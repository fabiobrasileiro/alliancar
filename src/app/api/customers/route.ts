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

    console.log("🔍 Buscando clientes do Asaas para:", externalReference);

    const url = `https://api-sandbox.asaas.com/v3/customers?externalReference=${externalReference}`;
    
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
    
    console.log(`✅ ${data.data?.length || 0} clientes encontrados`);

    return NextResponse.json({
      success: true,
      data: data.data || [],
      total: data.totalCount || 0
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