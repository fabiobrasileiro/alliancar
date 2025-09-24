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
    valorAdesao: "R$ 0,00",
    saldoPendente: "R$ 0,00",
    vendasMes: 0,
    ranking: 0,
    metaMensal: 1500,
    progressoPorcentagem: 0,
    progresso: 0,
    vendasNecessarias: 0,
    performance: [],
    linkAfiliado: "",
    qrCode: "",
    rankingTop10: [],
  });

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Buscar dados principais

      // const { data: ranking } = await supabase
      //   .from('afiliados')
      //   .select('nome_completo, numero_placas')
      //   .order('numero_placas', { ascending: false });



      const { data: dashboard } = await supabase
        .from("afiliados")
        .select("*")
        .eq("auth_id", user?.id)
        .single();

      if (!dashboard) return;

      const { data: perfomance } = await supabase
        .from("formularios")
        .select("*")
        .eq("codigo_formulario", dashboard.form_link)

      // Buscar comissões (performance)
      const { data: comissoes } = await supabase
        .from("comissoes")
        .select("*, clientes(nome)")
        .limit(10);

      const { data: ranking, error: rankingError } = await supabase
        .from("ranking_afiliados")  // agora é a view
        .select("*")
        .order("posicao", { ascending: true })
        .limit(10);

      console.log('ranking:', ranking)

      if (rankingError) {
        console.error('Erro ao buscar ranking:', rankingError);
      }

      // Formatar dados
      const performanceData =
        perfomance?.map((item) => ({
          id: item.id,
          data: new Date(item.data_criacao).toLocaleDateString("pt-BR"),
          cliente: item.nome_cliente || "Cliente",
          valor: item.valor_adesao.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          comissao: (item.valor_adesao * 0.03).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          status: item.status,
        })) || [];


      const rankingData =
        ranking?.map((item: any) => ({
          posicao: item.posicao,
          nome: item.nome_completo || "Afiliado",
          vendas: item.numero_placas,
        })) || [];
      // ranking é o array da view
      const userRanking = ranking?.find((item: any) => item.id === dashboard.id)?.posicao || 0;


      setAffiliateData({
        valorAdesao: dashboard.valor_adesao.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        saldoPendente: dashboard.receita_pendente.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        vendasMes: dashboard.numero_placas || 0,
        ranking: userRanking,
        metaMensal: dashboard.meta.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        progresso: dashboard.valor_adesao,
        progressoPorcentagem: (dashboard.valor_adesao / dashboard.meta) * 100,
        vendasNecessarias: (dashboard.meta - dashboard.valor_adesao) / 200,
        performance: performanceData,
        linkAfiliado: `https://alliancar.vercel.app/formulario/${dashboard.form_link}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://alliancar.vercel.app/formulario/${dashboard.form_link}`,
        rankingTop10: rankingData,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard de Afiliado
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <OverviewCards
          valorAdesao={affiliateData.valorAdesao}
          saldoPendente={affiliateData.saldoPendente}
          vendasMes={affiliateData.vendasMes}
          ranking={affiliateData.ranking}
        />

        <GoalsProgress
          metaMensal={affiliateData.metaMensal}
          progresso={affiliateData.progresso}
          vendasNecessarias={affiliateData.vendasNecessarias}
          progressoPorcentagem={affiliateData.progressoPorcentagem}
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
