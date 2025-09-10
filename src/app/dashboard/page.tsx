// components/affiliate-dashboard/AffiliateDashboard.tsx
"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import OverviewCards from "./components/OverviewCards";
import GoalsProgress from "./components/GoalsProgress";
import PerformanceReports from "./components/PerformanceReports";
import ReferralTools from "./components/ReferralTools";
import Ranking from "./components/Ranking";
import SupportCommunity from "./components/SupportCommunity";
import { AffiliateData } from "./components/types";

interface Metas {
  valor_meta: Number;
}

export default function AffiliateDashboard() {
  const supabase = createClient();
  const { user, perfil } = useUser();
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState<AffiliateData>({
    saldoDisponivel: "R$ 0,00",
    saldoPendente: "R$ 0,00",
    vendasMes: 0,
    ranking: 0,
    metaMensal: 1500,
    progresso: 0,
    vendasNecessarias: 0,
    performance: [],
    linkAfiliado: "",
    qrCode: "",
    rankingTop10: []
  });

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Buscar dados principais
      const { data: dashboard } = await supabase
        .from('afiliados')
        .select('*')
        .eq('auth_id', user?.id)
        .single();

      if (!dashboard) return;

      // Buscar comissões (performance)
      const { data: comissoes } = await supabase
        .from('comissoes')
        .select('*, clientes(nome)')
        .limit(10);


      // Buscar ranking
      const { data: ranking } = await supabase
        .from('ranking_afiliados')
        .select('*, afiliados(nome_completo)')
        .order('posicao', { ascending: true })
        .limit(10);

      

      // Formatar dados
      const performanceData = comissoes?.map(item => ({
        id: item.id,
        data: new Date(item.criado_em).toLocaleDateString('pt-BR'),
        cliente: item.clientes?.nome || 'Cliente',
        valor: item.valor_contrato.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        comissao: item.valor_comissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        status: item.status
      })) || [];

      const rankingData = ranking?.map((item, index) => ({
        posicao: index + 1,
        nome: item.afiliados?.nome_completo || "Afiliado",
        vendas: item.total_vendas,
        total_comissao: item.total_comissao
      })) || [];


      setAffiliateData({
        saldoDisponivel: dashboard.receita_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        saldoPendente: dashboard.receita_pendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        vendasMes: dashboard.numero_placas || 0,
        ranking: 0, // Você pode calcular isso baseado no ranking
        metaMensal: 1500, // Valor fixo ou buscar de metas_afiliados
        progresso: (dashboard.receita_total / 5000) * 100,
        vendasNecessarias: Math.ceil((5000 - dashboard.receita_total) / 100),
        performance: performanceData,
        linkAfiliado: `https://seusite.com/afiliado/${dashboard.id}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://seusite.com/afiliado/${dashboard.id}`,
        rankingTop10: rankingData
      });

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateData.linkAfiliado);
    alert("Link copiado!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Afiliado</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <OverviewCards
          saldoDisponivel={affiliateData.saldoDisponivel}
          saldoPendente={affiliateData.saldoPendente}
          vendasMes={affiliateData.vendasMes}
          ranking={affiliateData.ranking}
        />

        <GoalsProgress
          metaMensal={affiliateData.metaMensal}
          progresso={affiliateData.progresso}
          vendasNecessarias={affiliateData.vendasNecessarias}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <PerformanceReports performance={affiliateData.performance} />
            <ReferralTools
              linkAfiliado={affiliateData.linkAfiliado}
              qrCode={affiliateData.qrCode}
              onCopyLink={copyToClipboard}
            />
          </div>

          <div>
            <Ranking
              rankingTop10={affiliateData.rankingTop10}
              userName={perfil?.nome_completo || "Você"}
            />
            <SupportCommunity />
          </div>
        </div>
      </main>
    </div>
  );
}