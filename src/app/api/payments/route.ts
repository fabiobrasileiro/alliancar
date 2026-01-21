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

    // Buscar pagamentos do Asaas
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

    const url = `${baseUrl}/payments?externalReference=${externalReference}`;
    console.log(`🔍 Buscando pagamentos: ${url.substring(0, 50)}...`);

    const asaasResponse = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access_token": apiKey
      }
    });

    if (!asaasResponse.ok) {
      const errorText = await asaasResponse.text();
      console.error("❌ Erro na API do Asaas:", asaasResponse.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao buscar pagamentos: ${asaasResponse.status}`,
          details: errorText.substring(0, 200),
          debug: {
            url: url.substring(0, 100),
            status: asaasResponse.status
          }
        },
        { status: 500 }
      );
    }

    const asaasData = await asaasResponse.json();

    // Filtrar apenas os dados que precisamos e ordenar por data (mais recente primeiro)
    const payments = (asaasData.data || [])
      .map((payment: any) => ({
        object: payment.object,
        id: payment.id,
        dateCreated: payment.dateCreated,
        customer: payment.customer,
        subscription: payment.subscription,
        value: payment.value,
        netValue: payment.netValue,
        description: payment.description,
        billingType: payment.billingType,
        status: payment.status,
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate,
        invoiceUrl: payment.invoiceUrl,
        invoiceNumber: payment.invoiceNumber,
        externalReference: payment.externalReference,
        creditCard: payment.creditCard,
        bankSlipUrl: payment.bankSlipUrl,
        pixTransaction: payment.pixTransaction
      }))
      .sort((a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

    return NextResponse.json({
      success: true,
      payments: payments,
      total: payments.length,
      totalValue: payments.reduce((sum: number, payment: any) => sum + payment.value, 0)
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'max-age=60',
        'Vercel-CDN-Cache-Control': 'max-age=60'
      }
    });

  } catch (error: any) {
    console.error("❌ Erro ao buscar pagamentos:", error);
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