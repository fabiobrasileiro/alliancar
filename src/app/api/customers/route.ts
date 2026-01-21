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
    const apiKey = process.env.ASAAS_API_KEY;

    // Validação melhorada das variáveis de ambiente
    if (!apiKey) {
      console.error("❌ ASAAS_API_KEY não configurada");
      return NextResponse.json(
        { 
          success: false, 
          error: "Configuração de API inválida: ASAAS_API_KEY não encontrada",
          debug: {
            hasBaseUrl: !!baseUrl,
            baseUrl: baseUrl,
            hasApiKey: false
          }
        },
        { status: 500 }
      );
    }

    const url = `${baseUrl}/customers?externalReference=${externalReference}`;
    
    console.log(`🔍 Buscando clientes: ${url.substring(0, 50)}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na API do Asaas:", response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao buscar clientes: ${response.status}`,
          details: errorText.substring(0, 200), // Limita tamanho da resposta
          debug: {
            url: url.substring(0, 100),
            status: response.status
          }
        },
        { status: 500 }
      );
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
        error: error.message || "Erro desconhecido",
        type: error.name || "UnknownError"
      },
      { status: 500 }
    );
  }
}