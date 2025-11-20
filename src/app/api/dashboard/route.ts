import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const afiliadoId = searchParams.get('afiliadoId');

    if (!afiliadoId) {
      return NextResponse.json(
        { success: false, error: "afiliadoId é obrigatório" },
        { status: 400 }
      );
    }

    console.log("📊 Buscando dados do dashboard para afiliado:", afiliadoId);

    // 1️⃣ Buscar pagamentos do afiliado
    const paymentsResponse = await fetch(
      `${process.env.ASAAS_BASE_URL}/payments?externalReference=${afiliadoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );

    if (!paymentsResponse.ok) {
      throw new Error(`Erro ao buscar pagamentos: ${paymentsResponse.status}`);
    }

    const paymentsData = await paymentsResponse.json();
    const payments = paymentsData.data || [];

    // 2️⃣ Buscar assinaturas do afiliado
    const subscriptionsResponse = await fetch(
      `${process.env.ASAAS_BASE_URL}/subscriptions?externalReference=${afiliadoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );

    const subscriptionsData = await subscriptionsResponse.ok ? await subscriptionsResponse.json() : { data: [] };
    const subscriptions = subscriptionsData.data || [];

    // 3️⃣ Buscar clientes do afiliado
    const customersResponse = await fetch(
      `${process.env.ASAAS_BASE_URL}/customers?externalReference=${afiliadoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );

    const customersData = await customersResponse.ok ? await customersResponse.json() : { data: [] };
    const customers = customersData.data || [];

    console.log("📈 Dados encontrados:", {
      payments: payments.length,
      subscriptions: subscriptions.length,
      customers: customers.length
    });

    // 4️⃣ Calcular métricas
    const metrics = calculateMetrics(payments, subscriptions, customers, afiliadoId);

    return NextResponse.json({
      success: true,
      data: metrics,
      summary: {
        totalPayments: payments.length,
        totalSubscriptions: subscriptions.length,
        totalCustomers: customers.length
      }
    });

  } catch (error: any) {
    console.error("❌ Erro ao buscar dados do dashboard:", error);
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

// Função para calcular métricas
function calculateMetrics(payments: any[], subscriptions: any[], customers: any[], afiliadoId: string) {
  // Pagamentos confirmados (RECEIVED, CONFIRMED)
  const confirmedPayments = payments.filter(p => 
    p.status === 'RECEIVED' || p.status === 'CONFIRMED'
  );
  
  const totalPagamentos = confirmedPayments.reduce((sum, p) => sum + p.value, 0);

  // Assinaturas ativas
  const activeSubscriptions = subscriptions.filter(s => 
    s.status === 'ACTIVE'
  );
  
  const totalAssinaturas = activeSubscriptions.reduce((sum, s) => sum + s.value, 0);

  // Clientes únicos (baseado nos payments)
  const uniqueCustomers = [...new Set(payments.map(p => p.customer))];

  return {
    afiliado_id: afiliadoId,
    total_clientes: uniqueCustomers.length,
    total_assinaturas: totalAssinaturas,
    comissao_assinaturas: totalAssinaturas * 0.03, // 3% de comissão
    total_pagamentos: totalPagamentos,
    comissao_pagamentos: totalPagamentos * 0.03, // 3% de comissão
    total_geral: totalAssinaturas + totalPagamentos,
    comissao_total: (totalAssinaturas + totalPagamentos) * 0.03,
    
    // Métricas detalhadas
    metrics: {
      payments: {
        total: payments.length,
        confirmed: confirmedPayments.length,
        pending: payments.filter(p => p.status === 'PENDING').length,
        overdue: payments.filter(p => p.status === 'OVERDUE').length,
        totalValue: totalPagamentos
      },
      subscriptions: {
        total: subscriptions.length,
        active: activeSubscriptions.length,
        inactive: subscriptions.filter(s => s.status !== 'ACTIVE').length,
        totalValue: totalAssinaturas
      },
      customers: {
        total: customers.length,
        uniqueFromPayments: uniqueCustomers.length
      }
    }
  };
}