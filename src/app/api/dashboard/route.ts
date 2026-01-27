import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";


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
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const afiliadoId = searchParams.get('afiliadoId');

    if (!afiliadoId) {
      return NextResponse.json(
        { success: false, error: "afiliadoId é obrigatório" },
        { status: 400 }
      );
    }

    console.log("📊 Buscando dados para afiliado:", afiliadoId);
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/dashboard/route.ts:start',message:'api_dashboard_start',data:{afiliadoId},timestamp:Date.now(),sessionId:'debug-session',runId:'perf1',hypothesisId:'H'})}).catch(()=>{});
    console.log("[perf][H] api_dashboard_start", { afiliadoId });
    // #endregion

    // Inicializar Supabase
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // 1️⃣ Buscar SAQUES do afiliado (para deduzir do total)
    const saquesPromise = supabase
      .from('saques')
      .select('id, valor, status')
      .eq('afiliado_id', afiliadoId);

    // 2️⃣ Buscar dados do Asaas em paralelo (com timeout de 10s)
    const customersStart = Date.now();
    const paymentsStart = Date.now();
    const subscriptionsStart = Date.now();
    
    // Helper para criar fetch com timeout
    const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs = 10000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      })
        .finally(() => clearTimeout(timeoutId))
        .catch(err => {
          if (err.name === 'AbortError') {
            console.error(`❌ Timeout ao buscar ${url}`);
          } else {
            console.error(`❌ Erro ao buscar ${url}:`, err);
          }
          return { ok: false, status: 500, json: async () => ({ data: [] }) };
        });
    };
    
    const fetchHeaders = {
      "access_token": process.env.ASAAS_API_KEY!
    };
    
    const customersPromise = fetchWithTimeout(
      `${process.env.ASAAS_BASE_URL}/customers?externalReference=${afiliadoId}`,
      { headers: fetchHeaders }
    );

    const paymentsPromise = fetchWithTimeout(
      `${process.env.ASAAS_BASE_URL}/payments?externalReference=${afiliadoId}`,
      { headers: fetchHeaders }
    );

    const subscriptionsPromise = fetchWithTimeout(
      `${process.env.ASAAS_BASE_URL}/subscriptions?externalReference=${afiliadoId}`,
      { headers: fetchHeaders }
    );

    const [
      { data: saquesData, error: saquesError },
      customersResponse,
      paymentsResponse,
      subscriptionsResponse
    ] = await Promise.all([
      saquesPromise,
      customersPromise,
      paymentsPromise,
      subscriptionsPromise
    ]);
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/dashboard/route.ts:afterPromiseAll',message:'api_dashboard_after_promises',data:{elapsedMs:Date.now()-startTime,customersStatus:customersResponse.status,paymentsStatus:paymentsResponse.status,subscriptionsStatus:subscriptionsResponse.status,customersMs:Date.now()-customersStart,paymentsMs:Date.now()-paymentsStart,subscriptionsMs:Date.now()-subscriptionsStart},timestamp:Date.now(),sessionId:'debug-session',runId:'perf3',hypothesisId:'H'})}).catch(()=>{});
    console.log("[perf][H] api_dashboard_after_promises", { elapsedMs: Date.now() - startTime, customersStatus: customersResponse.status, paymentsStatus: paymentsResponse.status, subscriptionsStatus: subscriptionsResponse.status, customersMs: Date.now() - customersStart, paymentsMs: Date.now() - paymentsStart, subscriptionsMs: Date.now() - subscriptionsStart });
    // #endregion

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

    const customersData = customersResponse.ok ? await customersResponse.json() : { data: [] };
    const customers: AsaasCustomer[] = customersData.data || [];
    const totalClientes = customers.length;

    const paymentsData = paymentsResponse.ok ? await paymentsResponse.json() : { data: [] };
    const payments: AsaasPayment[] = paymentsData.data || [];

    // Pagamentos CONFIRMADOS mas não sacados
    const pagamentosAReceber = payments
      .filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED')
      .reduce((sum: number, p: AsaasPayment) => sum + p.value, 0);

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

    // Adiciona headers de cache para otimização
    // Cache no cliente por 60 segundos (staleTime)
    // Mas permite revalidação imediata se necessário
    return NextResponse.json({
      success: true,
      data: dashboardData
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'max-age=60',
        'Vercel-CDN-Cache-Control': 'max-age=60'
      }
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