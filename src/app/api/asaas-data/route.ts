import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const afiliadoId = searchParams.get('afiliadoId');
    const tipo = searchParams.get('tipo'); // 'payments' ou 'subscriptions'

    if (!afiliadoId || !tipo) {
      return NextResponse.json(
        { success: false, error: "afiliadoId e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`📊 Buscando ${tipo} para afiliado:`, afiliadoId);

    const baseUrl = process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3";
    let endpoint = '';
    if (tipo === 'payments') {
      endpoint = `${baseUrl}/payments?externalReference=${afiliadoId}`;
    } else if (tipo === 'subscriptions') {
      endpoint = `${baseUrl}/subscriptions?externalReference=${afiliadoId}`;
    } else {
      return NextResponse.json(
        { success: false, error: "Tipo inválido" },
        { status: 400 }
      );
    }

    const response = await fetch(endpoint, {
      headers: {
        "access_token": process.env.ASAAS_API_KEY!
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar ${tipo} do Asaas`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || []
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'max-age=60',
        'Vercel-CDN-Cache-Control': 'max-age=60'
      }
    });

  } catch (error: any) {
    console.error(`❌ Erro ao buscar dados do Asaas:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message
      },
      { status: 500 }
    );
  }
}