import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Buscar todos afiliados
    const { data: afiliados, error } = await supabase
      .from('afiliados')
      .select('id, nome_completo, email');

    if (error) throw error;

    const dashboardData = [];

    // Buscar dados de cada afiliado
    for (const afiliado of afiliados) {
      try {
        const response = await fetch(
          `${process.env.ASAAS_BASE_URL}/payments?externalReference=${afiliado.id}`,
          {
            headers: {
              "access_token": process.env.ASAAS_API_KEY!
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const payments = data.data || [];
          
          const confirmedPayments = payments.filter((p: any) => 
            p.status === 'RECEIVED' || p.status === 'CONFIRMED'
          );
          
          const totalPagamentos = confirmedPayments.reduce((sum: number, p: any) => sum + p.value, 0);
          const uniqueCustomers = [...new Set(payments.map((p: any) => p.customer))];

          dashboardData.push({
            afiliado_id: afiliado.id,
            afiliado_nome: afiliado.nome_completo,
            total_clientes: uniqueCustomers.length,
            total_pagamentos: totalPagamentos,
            total_assinaturas: 0, // Você pode adicionar lógica para assinaturas
            comissao_assinaturas: 0,
            comissao_pagamentos: totalPagamentos * 0.03
          });
        }
      } catch (error) {
        console.error(`Erro no afiliado ${afiliado.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error: any) {
    console.error("❌ Erro no dashboard all:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}