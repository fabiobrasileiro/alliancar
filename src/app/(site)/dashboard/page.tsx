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
import { AfiliadoData } from "./types";

export default function AffiliateDashboard() {
  const supabase = createClient();
  const { user, perfil } = useUser();
  const [dashboard, setDashboard] = useState<AfiliadoData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data, error } = await supabase
          .from("dashboard")
          .select("*")

        setDashboard(data ? data[0] : null)
      } catch (error) {
        console.error(error);
      }
    }
    fetchDashboard();
  }, [supabase])
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, Fábio Brasileiro
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <OverviewCards
          valorAdesao={dashboard?.payment_value || 0}
          saldoPendente={dashboard?.payment_value || 0}
          vendasMes={dashboard?.customers_count || 0}
          ranking={dashboard?.payment_value || 0}
        />

        <GoalsProgress
          metaMensal={perfil?.meta || 2500}
          progresso={dashboard?.payment_value || 0}
          vendasNecessarias={Math.max(0, (perfil?.meta || 2500) - (dashboard?.payment_value || 0))}
          progressoPorcentagem={Math.min(100, ((dashboard?.payment_value || 0) / (perfil?.meta || 2500)) * 100)}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <PerformanceReports />
            <ReferralTools
              linkAfiliado={'oi'}
              qrCode={'oi'}
              onCopyLink={()=>{}}
            />
          </div>

          <div>
            {/* <Ranking
              rankingTop10={affiliateData.rankingTop10}
              userName={perfil?.nome_completo || "Você"}
            />
            <SupportCommunity /> */}
          </div>
        </div>
      </main>
    </div>
  );
}