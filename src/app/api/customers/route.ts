import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Fallback: busca clientes na tabela Supabase customers (afiliado_id = externalReference). */
async function fallbackSupabaseCustomers(externalReference: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .or(`afiliado_id.eq.${externalReference},external_reference.eq.${externalReference}`)
    .eq("deleted", false);
  if (error || !data?.length) return null;
  return data.map((row: Record<string, unknown>) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    mobilePhone: row.mobile_phone ?? row.phone ?? "",
    cpfCnpj: row.cpf_cnpj ?? "",
    postalCode: row.postal_code ?? "",
    address: row.address ?? "",
    addressNumber: row.address_number ?? "",
    complement: row.complement ?? "",
    province: row.province ?? "",
    city: row.city ?? 0,
    cityName: row.city_name ?? "",
    state: (row.province as string) ?? "",
    country: row.country ?? "Brasil",
    externalReference: row.external_reference ?? externalReference,
    observations: row.observations ?? "",
    deleted: Boolean(row.deleted),
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const externalReference = searchParams.get("externalReference");

    if (!externalReference) {
      return NextResponse.json(
        { success: false, error: "externalReference é obrigatório" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3";
    const apiKey = process.env.ASAAS_API_KEY;

    if (apiKey) {
      const url = `${baseUrl}/customers?externalReference=${externalReference}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json", access_token: apiKey },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          { success: true, data: data.data || [], total: data.totalCount || 0 },
          {
            headers: {
              "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
              "CDN-Cache-Control": "max-age=60",
              "Vercel-CDN-Cache-Control": "max-age=60",
            },
          }
        );
      }
      console.error("❌ Erro na API do Asaas:", response.status, await response.text());
    } else {
      console.warn("⚠️ ASAAS_API_KEY não configurada; usando fallback Supabase.");
    }

    const fallback = await fallbackSupabaseCustomers(externalReference);
    if (fallback) {
      return NextResponse.json(
        { success: true, data: fallback, total: fallback.length, source: "supabase" },
        {
          headers: {
            "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: apiKey
          ? "Erro ao buscar clientes no Asaas e nenhum dado em Supabase."
          : "ASAAS_API_KEY não configurada e nenhum cliente encontrado no Supabase.",
        details: "Verifique ASAAS_API_KEY, ASAAS_BASE_URL e a tabela customers (afiliado_id).",
      },
      { status: 500 }
    );
  } catch (error: unknown) {
    let ref: string | null = null;
    try {
      ref = new URL(request.url).searchParams.get("externalReference");
    } catch {
      /* ignored */
    }
    if (ref) {
      const fallback = await fallbackSupabaseCustomers(ref).catch(() => null);
      if (fallback) {
        return NextResponse.json(
          { success: true, data: fallback, total: fallback.length, source: "supabase" },
          { headers: { "Cache-Control": "private, max-age=60" } }
        );
      }
    }
    console.error("❌ Erro ao buscar clientes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        type: error instanceof Error ? error.name : "UnknownError",
      },
      { status: 500 }
    );
  }
}