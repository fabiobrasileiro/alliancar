import { NextResponse } from "next/server";

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  // ... outros campos do customer
}

interface AsaasPayment {
  id: string;
  value: number;
  status: string;
  // ... outros campos do payment
}

interface AsaasSubscription {
  id: string;
  value: number;
  status: string;
  // ... outros campos do subscription
}

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

    console.log("📊 Buscando dados simplificados para afiliado:", afiliadoId);

    // 1️⃣ Buscar CLIENTES do afiliado (para placas)
    const customersResponse = await fetch(
      `${process.env.ASAAS_BASE_URL}/customers?externalReference=${afiliadoId}`,
      {
        headers: {
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );

    const customersData = customersResponse.ok ? await customersResponse.json() : { data: [] };
    const customers: AsaasCustomer[] = customersData.data || [];
    const totalClientes = customers.length;

    // 2️⃣ Buscar PAGAMENTOS do afiliado (para pagamentos a receber)
    const paymentsResponse = await fetch(
      `${process.env.ASAAS_BASE_URL}/payments?externalReference=${afiliadoId}`,
      {
        headers: {
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );

    const paymentsData = paymentsResponse.ok ? await paymentsResponse.json() : { data: [] };
    const payments: AsaasPayment[] = paymentsData.data || [];

    // Pagamentos CONFIRMADOS mas não sacados
    const pagamentosAReceber = payments
      .filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED')
      .reduce((sum: number, p: AsaasPayment) => sum + p.value, 0);

    // 3️⃣ Buscar ASSINATURAS do afiliado (para mensalidades)
    const subscriptionsResponse = await fetch(
      `${process.env.ASAAS_BASE_URL}/subscriptions?externalReference=${afiliadoId}`,
      {
        headers: {
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );

    const subscriptionsData = subscriptionsResponse.ok ? await subscriptionsResponse.json() : { data: [] };
    const subscriptions: AsaasSubscription[] = subscriptionsData.data || [];

    // Assinaturas ATIVAS (3% do valor total)
    const assinaturasAtivas = subscriptions.filter(s => s.status === 'ACTIVE');
    const valorMensalidades = assinaturasAtivas.reduce((sum: number, s: AsaasSubscription) => sum + s.value, 0);
    const mensalidadesAReceber = valorMensalidades * 0.03; // 3% de comissão

    // 4️⃣ Calcular TOTAL A RECEBER
    const totalAReceber = pagamentosAReceber + mensalidadesAReceber;

    const dashboardData = {
      afiliado_id: afiliadoId,
      total_clientes: totalClientes,
      pagamentos_a_receber: pagamentosAReceber,
      mensalidades_a_receber: mensalidadesAReceber,
      total_a_receber: totalAReceber,
      
      // Dados detalhados para debug
      detalhes: {
        clientes: totalClientes,
        pagamentos_confirmados: payments.filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED').length,
        assinaturas_ativas: assinaturasAtivas.length,
        valor_total_mensalidades: valorMensalidades
      }
    };

    console.log("📈 Dashboard simplificado:", dashboardData);

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error: any) {
    console.error("❌ Erro no dashboard simplificado:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message
      },
      { status: 500 }
    );
  }
}