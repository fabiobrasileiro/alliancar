import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import SaquesClient from "./SaqueClient";

export default async function Saques() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Usuário não autenticado</p>
          <p className="text-gray-400 mt-2">Faça login novamente</p>
        </div>
      </div>
    );
  }

  const { data: afiliado } = await supabase
    .from("afiliados")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!afiliado?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Afiliado não encontrado</p>
          <p className="text-gray-400 mt-2">Entre em contato com o suporte</p>
        </div>
      </div>
    );
  }

  let dashboardData = null;
  try {
    // Usa apenas NEXT_PUBLIC_BASE_URL (definir na Vercel = URL do site em produção)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/dashboard?afiliadoId=${afiliado.id}`, { 
      cache: "no-store" 
    });
    if (response.ok) {
      const json = await response.json();
      if (json?.success) {
        dashboardData = json.data ?? null;
      }
    }
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    dashboardData = null;
  }

  const { data: bankData } = await supabase
    .from("afiliado_bank_data")
    .select("*")
    .eq("afiliado_id", afiliado.id)
    .single();

  const { data: saquesData } = await supabase
    .from("saques")
    .select("*")
    .eq("afiliado_id", afiliado.id)
    .order("criado_em", { ascending: false });

  return (
    <SaquesClient
      initialDashboard={dashboardData}
      initialBankData={bankData ?? null}
      initialSaques={saquesData ?? []}
    />
  );
}