import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const externalReference = searchParams.get('externalReference');

    if (!externalReference) {
      return NextResponse.json(
        { success: false, error: "externalReference é obrigatório" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3";
    const url = `${baseUrl}/customers?externalReference=${externalReference}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': process.env.ASAAS_API_KEY!
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na API do Asaas:", response.status, errorText);
      throw new Error(`Erro ao buscar clientes: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || [],
      total: data.totalCount || 0
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'max-age=60',
        'Vercel-CDN-Cache-Control': 'max-age=60'
      }
    });

  } catch (error: any) {
    console.error("❌ Erro ao buscar clientes:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.response?.data || error
      },
      { status: 500 }
    );
  }
}