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
    const asaasResponse = await fetch(
      `${baseUrl}/payments?externalReference=${externalReference}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );

    if (!asaasResponse.ok) {
      throw new Error(`Erro ao buscar pagamentos: ${asaasResponse.status}`);
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
        error: error.message,
        details: error.response?.data || error
      },
      { status: 500 }
    );
  }
}