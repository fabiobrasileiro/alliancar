import { NextResponse } from "next/server";

async function fetchFromAsaas(endpoint: string, afiliadoId: string) {
  try {
    const response = await fetch(
      `${process.env.ASAAS_BASE_URL}${endpoint}?externalReference=${afiliadoId}`,
      {
        headers: {
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`Erro ao buscar ${endpoint}:`, error);
    return [];
  }
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

    // Buscar todos os dados em paralelo
    const [customers, payments, subscriptions] = await Promise.all([
      fetchFromAsaas('/customers', afiliadoId),
      fetchFromAsaas('/payments', afiliadoId),
      fetchFromAsaas('/subscriptions', afiliadoId)
    ]);

    // Calcular métricas
    const totalClientes = customers.length;
    
    const pagamentosAReceber = (payments as any[])
      .filter((p: any) => p.status === 'RECEIVED' || p.status === 'CONFIRMED')
      .reduce((sum: number, p: any) => sum + p.value, 0);

    const assinaturasAtivas = (subscriptions as any[]).filter((s: any) => s.status === 'ACTIVE');
    const valorMensalidades = assinaturasAtivas.reduce((sum: number, s: any) => sum + s.value, 0);
    const mensalidadesAReceber = valorMensalidades * 0.03;

    const totalAReceber = pagamentosAReceber + mensalidadesAReceber;

    const dashboardData = {
      afiliado_id: afiliadoId,
      total_clientes: totalClientes,
      pagamentos_a_receber: pagamentosAReceber,
      mensalidades_a_receber: mensalidadesAReceber,
      total_a_receber: totalAReceber,
      detalhes: {
        clientes: totalClientes,
        pagamentos_confirmados: (payments as any[]).filter((p: any) => p.status === 'RECEIVED' || p.status === 'CONFIRMED').length,
        assinaturas_ativas: assinaturasAtivas.length,
        valor_total_mensalidades: valorMensalidades
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error: any) {
    console.error("❌ Erro no dashboard completo:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}