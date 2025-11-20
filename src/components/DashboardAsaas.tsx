'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Loader2, CreditCard, BarChart3, Target } from 'lucide-react';

interface DashboardData {
  afiliado_id: string;
  total_clientes: number;
  total_assinaturas: number;
  comissao_assinaturas: number;
  total_pagamentos: number;
  comissao_pagamentos: number;
  total_geral: number;
  comissao_total: number;
  metrics: {
    payments: {
      total: number;
      confirmed: number;
      pending: number;
      overdue: number;
      totalValue: number;
    };
    subscriptions: {
      total: number;
      active: number;
      inactive: number;
      totalValue: number;
    };
    customers: {
      total: number;
      uniqueFromPayments: number;
    };
  };
}

interface DashboardAsaasProps {
  afiliadoId: string;
  perfilData: any;
}

export default function DashboardAsaas({ afiliadoId, perfilData }: DashboardAsaasProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!afiliadoId) return;

      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Buscando dados do Asaas para:", afiliadoId);

        const response = await fetch(`/api/dashboard?afiliadoId=${afiliadoId}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do dashboard');
        }

        const data = await response.json();
        
        if (data.success) {
          setDashboardData(data.data);
          setLastUpdated(new Date());
          console.log("✅ Dados do dashboard carregados:", data.data);
        } else {
          throw new Error(data.error || 'Erro ao carregar dados');
        }
      } catch (err) {
        console.error('❌ Erro ao buscar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [afiliadoId]);

  // 🔹 Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
            <span className="text-white text-lg">Carregando dados do Asaas...</span>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Erro
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-red-400 text-xl font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-red-300">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Nenhum dado
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-bg border border-gray-700 rounded-xl p-8 text-center">
            <div className="text-gray-500 text-4xl mb-4">💸</div>
            <h3 className="text-gray-400 text-xl font-semibold mb-2">Nenhum dado encontrado</h3>
            <p className="text-gray-500">
              Ainda não há pagamentos ou assinaturas vinculados ao seu afiliado ID.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Cards principais
  const mainCards = [
    {
      title: 'Total de Clientes',
      value: dashboardData.total_clientes.toLocaleString('pt-BR'),
      icon: Users,
      color: 'bg-blue-500',
      description: 'Clientes únicos com pagamentos',
      trend: dashboardData.metrics.customers.uniqueFromPayments
    },
    {
      title: 'Valor em Assinaturas',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.total_assinaturas),
      icon: TrendingUp,
      color: 'bg-green-500',
      description: `${dashboardData.metrics.subscriptions.active} assinaturas ativas`,
      trend: dashboardData.metrics.subscriptions.active
    },
    {
      title: 'Valor em Pagamentos',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.total_pagamentos),
      icon: DollarSign,
      color: 'bg-purple-500',
      description: `${dashboardData.metrics.payments.confirmed} pagamentos confirmados`,
      trend: dashboardData.metrics.payments.confirmed
    },
    {
      title: 'Comissão Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.comissao_total),
      icon: CreditCard,
      color: 'bg-orange-500',
      description: '3% sobre vendas totais',
      trend: dashboardData.comissao_total
    }
  ];

  // 🔹 Cards de métricas detalhadas
  const metricCards = [
    {
      title: 'Pagamentos Pendentes',
      value: dashboardData.metrics.payments.pending,
      icon: BarChart3,
      color: 'bg-yellow-500',
      description: 'Aguardando confirmação'
    },
    {
      title: 'Pagamentos Atrasados',
      value: dashboardData.metrics.payments.overdue,
      icon: BarChart3,
      color: 'bg-red-500',
      description: 'Vencidos não pagos'
    },
    {
      title: 'Assinaturas Inativas',
      value: dashboardData.metrics.subscriptions.inactive,
      icon: Target,
      color: 'bg-gray-500',
      description: 'Canceladas ou suspensas'
    },
    {
      title: 'Ticket Médio',
      value: dashboardData.total_clientes > 0 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            dashboardData.total_geral / dashboardData.total_clientes
          )
        : 'R$ 0,00',
      icon: DollarSign,
      color: 'bg-indigo-500',
      description: 'Por cliente'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {perfilData?.super_admin ? 'Dashboard Geral' : `Bem-vindo, ${perfilData?.nome_completo ?? 'Afiliado'}`}
              </h1>
              <p className="text-gray-400 mt-2">
                Dados em tempo real da API Asaas
                {lastUpdated && (
                  <span className="text-gray-500 text-sm ml-2">
                    (Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-500 rounded-lg px-3 py-1">
              <span className="text-green-400 text-sm font-medium">✅ Conectado ao Asaas</span>
            </div>
          </div>
        </div>

        {/* Stats Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainCards.map((card, index) => (
            <div
              key={index}
              className="bg-bg border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-white mb-2">{card.value}</p>
                  <p className="text-gray-500 text-xs">{card.description}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              {card.trend > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-green-400 text-xs">
                    +{card.trend} {card.title.includes('Clientes') ? 'clientes' : card.title.includes('Assinaturas') ? 'ativas' : 'confirmados'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Métricas Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricCards.map((card, index) => (
            <div
              key={index}
              className="bg-navbar1 rounded-lg p-4 border border-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{card.title}</p>
                  <p className="text-white font-semibold text-lg mt-1">{card.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{card.description}</p>
                </div>
                <div className={`${card.color} p-2 rounded-lg`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-bg border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Resumo Financeiro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-400 text-sm">Faturamento Total</p>
              <p className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.total_geral)}
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-400 text-sm">Sua Comissão (3%)</p>
              <p className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.comissao_total)}
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-gray-400 text-sm">Valor Processado</p>
              <p className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  dashboardData.metrics.payments.totalValue + dashboardData.metrics.subscriptions.totalValue
                )}
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-gray-400 text-sm">Potencial Mensal</p>
              <p className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  dashboardData.total_assinaturas * 12
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Informações da API */}
        <div className="bg-bg border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Detalhes da Conexão Asaas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Afiliado ID</p>
              <p className="text-white font-mono">{afiliadoId}</p>
            </div>
            <div>
              <p className="text-gray-400">Total de Transações</p>
              <p className="text-white">
                {dashboardData.metrics.payments.total + dashboardData.metrics.subscriptions.total}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Taxa de Sucesso</p>
              <p className="text-green-400">
                {dashboardData.metrics.payments.total > 0 
                  ? Math.round((dashboardData.metrics.payments.confirmed / dashboardData.metrics.payments.total) * 100) 
                  : 0
                }%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}