import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";


interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
}

interface AsaasPayment {
  id: string;
  value: number;
  status: string;
}

interface AsaasSubscription {
  id: string;
  value: number;
  status: string;
}

interface Saque {
  id: string;
  valor: number;
  status: string;
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

    console.log("📊 Buscando dados para afiliado:", afiliadoId);

    // Inicializar Supabase
    const supabase = createClient();

    // 1️⃣ Buscar SAQUES do afiliado (para deduzir do total)
    const { data: saquesData, error: saquesError } = await supabase
      .from('saques')
      .select('id, valor, status')
      .eq('afiliado_id', afiliadoId);

    if (saquesError) {
      console.error('❌ Erro ao buscar saques:', saquesError);
    }

    const saques: Saque[] = saquesData || [];
    
    // Calcular total já sacado (apenas saques com status 'pago')
    const totalSacado = saques
      .filter(s => s.status === 'pago')
      .reduce((sum: number, s: Saque) => sum + s.valor, 0);

    // Calcular total pendente de saque (saques com status 'pendente')
    const totalPendenteSaque = saques
      .filter(s => s.status === 'pendente')
      .reduce((sum: number, s: Saque) => sum + s.valor, 0);

    console.log(`💰 Saques: Total sacado: R$ ${totalSacado}, Pendentes: R$ ${totalPendenteSaque}`);

    // 2️⃣ Buscar CLIENTES do afiliado (para placas)
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

    // 3️⃣ Buscar PAGAMENTOS do afiliado (para pagamentos a receber)
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

    // 4️⃣ Buscar ASSINATURAS do afiliado (para mensalidades)
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

    // 5️⃣ Calcular TOTAIS considerando saques
    const totalBruto = pagamentosAReceber + mensalidadesAReceber;
    
    // Total disponível para saque = Total bruto - Total já sacado - Total pendente de saque
    const totalDisponivelSaque = Math.max(0, totalBruto - totalSacado - totalPendenteSaque);

    // Total acumulado (incluindo o que já foi sacado)
    const totalAcumulado = totalBruto;

    const dashboardData = {
      afiliado_id: afiliadoId,
      
      // Totais principais
      total_clientes: totalClientes,
      pagamentos_a_receber: pagamentosAReceber,
      mensalidades_a_receber: mensalidadesAReceber,
      
      // Totais considerando saques
      total_bruto: totalBruto,
      total_sacado: totalSacado,
      total_pendente_saque: totalPendenteSaque,
      total_a_receber: totalDisponivelSaque,
      total_acumulado: totalAcumulado,
      
      // Dados detalhados para debug
      detalhes: {
        clientes: totalClientes,
        pagamentos_confirmados: payments.filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED').length,
        assinaturas_ativas: assinaturasAtivas.length,
        valor_total_mensalidades: valorMensalidades,
        total_saques: saques.length,
        saques_pagos: saques.filter(s => s.status === 'pago').length,
        saques_pendentes: saques.filter(s => s.status === 'pendente').length
      }
    };

    console.log("📈 Dashboard com lógica de saques:", {
      totalBruto: dashboardData.total_bruto,
      totalSacado: dashboardData.total_sacado,
      totalPendenteSaque: dashboardData.total_pendente_saque,
      totalDisponivel: dashboardData.total_a_receber
    });

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error: any) {
    console.error("❌ Erro no dashboard:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message
      },
      { status: 500 }
    );
  }
}