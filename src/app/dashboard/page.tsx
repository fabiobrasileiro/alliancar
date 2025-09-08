// components/affiliate-dashboard/AffiliateDashboard.tsx
"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import OverviewCards from "./components/OverviewCards";
import GoalsProgress from "./components/GoalsProgress";
import PerformanceReports from "./components/PerformanceReports";
import ReferralTools from "./components/ReferralTools";
import Ranking from "./components/Ranking";
import SupportCommunity from "./components/SupportCommunity";
import { Afiliado } from "./components/types";

interface AffiliateDashboardProps {
  initialData?: Partial<Afiliado>;
}

export default function AffiliateDashboard({ initialData }: AffiliateDashboardProps) {
  const supabase = createClient();
  const { user, perfil } = useUser();
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState<Afiliado>({
    saldoDisponivel: "R$ 0,00",
    saldoPendente: "R$ 0,00",
    vendasMes: 0,
    ranking: 0,
    metaMensal: 2000,
    progresso: 1350,
    vendasNecessarias: 3,
    performance: [],
    linkAfiliado: "https://alliancar.com/afiliado/12345",
    qrCode: "/api/qr?url=https://alliancar.com/afiliado/12345",
    badges: [],
    rankingTop10: [],
    ...initialData
  });

  // Buscar dados do dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulação de dados - substituir com chamadas reais ao Supabase
      const mockData = {
        saldoDisponivel: "R$ 850,00",
        saldoPendente: "R$ 420,50",
        vendasMes: 27,
        ranking: 5,
        metaMensal: 2000,
        progresso: 1350,
        vendasNecessarias: 3,
        performance: [
          { id: 1, data: "15/09/2025", cliente: "João Silva", valor: "R$ 89,90", comissao: "R$ 35,96", status: "Pago" },
          { id: 2, data: "14/09/2025", cliente: "Maria Santos", valor: "R$ 89,90", comissao: "R$ 35,96", status: "Pago" },
          { id: 3, data: "13/09/2025", cliente: "Pedro Costa", valor: "R$ 89,90", comissao: "R$ 35,96", status: "Pendente" },
          { id: 4, data: "12/09/2025", cliente: "Ana Oliveira", valor: "R$ 89,90", comissao: "R$ 35,96", status: "Pago" },
          { id: 5, data: "11/09/2025", cliente: "Carlos Souza", valor: "R$ 89,90", comissao: "R$ 35,96", status: "Pago" },
        ],
        linkAfiliado: "https://alliancar.com/afiliado/12345",
        qrCode: "/api/qr?url=https://alliancar.com/afiliado/12345",
        badges: ["Primeira venda", "10 vendas", "Top 5 da semana"],
        rankingTop10: [
          { posicao: 1, nome: "Carlos Santos", vendas: 54 },
          { posicao: 2, nome: "Ana Oliveira", vendas: 48 },
          { posicao: 3, nome: "João Silva", vendas: 42 },
          { posicao: 4, nome: "Maria Costa", vendas: 37 },
          { posicao: 5, nome: perfil?.nome_completo || "Você", vendas: 27 },
          { posicao: 6, nome: "Pedro Alves", vendas: 25 },
          { posicao: 7, nome: "Laura Mendes", vendas: 22 },
          { posicao: 8, nome: "Ricardo Lima", vendas: 19 },
          { posicao: 9, nome: "Fernanda Rocha", vendas: 16 },
          { posicao: 10, nome: "Paulo Cardoso", vendas: 14 },
        ]
      };

      setAffiliateData(prev => ({ ...prev, ...mockData }));
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Você pode adicionar uma notificação de sucesso aqui
  };

  const shareOnSocialMedia = (platform: string) => {
    const shareUrl = encodeURIComponent(affiliateData.linkAfiliado);
    const shareText = encodeURIComponent("Conheça a Alilancar Proteção Veicular!");

    const urls = {
      whatsapp: `https://wa.me/?text=${shareText} ${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      instagram: `https://www.instagram.com/?url=${shareUrl}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Afiliado</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {perfil?.nome_completo?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">
                    {perfil?.nome_completo || user?.email}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuItem>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PerformanceReports performance={affiliateData.performance} />
            
            <ReferralTools
              linkAfiliado={affiliateData.linkAfiliado}
              qrCode={affiliateData.qrCode}
              onCopyLink={() => copyToClipboard(affiliateData.linkAfiliado)}
              onShare={shareOnSocialMedia}
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

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">Alilancar Proteção Veicular © 2025</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm hover:text-gray-300">Política de Privacidade</a>
              <a href="#" className="text-sm hover:text-gray-300">Termos de Uso</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}