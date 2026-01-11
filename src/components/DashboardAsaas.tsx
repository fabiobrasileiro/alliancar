'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Users, DollarSign, TrendingUp, CreditCard, Loader2, RefreshCw, Eye, EyeOff, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import GoalsProgressAfiliado from '@/app/(site)/dashboard/components/GoalsProgress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DashboardData {
  afiliado_id: string;
  total_clientes: number;
  pagamentos_a_receber: number;
  mensalidades_a_receber: number;
  total_a_receber: number;
  detalhes: {
    clientes: number;
    pagamentos_confirmados: number;
    assinaturas_ativas: number;
    valor_total_mensalidades: number;
  };
}

interface DashboardAsaasProps {
  afiliadoId: string;
  perfilData: any;
}

export default function DashboardAsaas({ afiliadoId, perfilData }: DashboardAsaasProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hideFinancialValues, setHideFinancialValues] = useState<boolean>(() => {
    // Carrega do localStorage se existir
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard_hideFinancialValues');
      return saved === 'true';
    }
    return false;
  });

  // Ref para evitar múltiplas chamadas simultâneas
  const fetchingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Função para formatar valores monetários - memoizada
  const formatCurrency = useCallback((value: number): string => {
    if (hideFinancialValues) {
      return '••••••';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }, [hideFinancialValues]);

  // Função para formatar valores numéricos (sem moeda) - memoizada
  const formatCurrencyWithoutSymbol = useCallback((value: number): string => {
    if (hideFinancialValues) {
      return '••••••';
    }
    return new Intl.NumberFormat('pt-BR').format(value);
  }, [hideFinancialValues]);

  // Função fetch memoizada para evitar recriações
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (!afiliadoId) {
      setLoading(false);
      return;
    }

    // Evita múltiplas chamadas simultâneas
    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    try {
      // Só seta refreshing se for refresh manual ou já tiver carregado dados antes
      if (isManualRefresh || hasLoadedRef.current) {
        setRefreshing(true);
      }
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
        hasLoadedRef.current = true;
        console.log("✅ Dados do dashboard carregados:", data.data);
      } else {
        throw new Error(data.error || 'Erro ao carregar dados');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  }, [afiliadoId]);

  // Toggle da visibilidade - memoizado
  const toggleVisibility = useCallback(() => {
    setHideFinancialValues(prev => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboard_hideFinancialValues', String(newValue));
      }
      return newValue;
    });
  }, []);

  // 🔹 Cards principais - APENAS 4 CARDS - Memoizado ANTES dos early returns para seguir as regras dos Hooks
  const cards = useMemo(() => {
    if (!dashboardData) {
      return [];
    }
    return [
      {
        title: 'Total de Clientes',
        value: dashboardData.total_clientes.toLocaleString('pt-BR'),
        subtitle: `${dashboardData.detalhes.clientes} clientes cadastrados`,
        icon: Users,
        color: 'bg-blue-500',
        description: 'Clientes únicos no sistema',
        isFinancial: false // Não é valor monetário
      },
      {
        title: 'Pagamentos a Receber',
        value: formatCurrency(dashboardData.pagamentos_a_receber),
        subtitle: `${dashboardData.detalhes.pagamentos_confirmados} pagamentos confirmados`,
        icon: DollarSign,
        color: 'bg-green-500',
        description: 'Valor disponível para saque',
        isFinancial: true
      },
      {
        title: 'Mensalidades a Receber',
        value: formatCurrency(dashboardData.mensalidades_a_receber),
        subtitle: `${dashboardData.detalhes.assinaturas_ativas} assinaturas ativas`,
        icon: TrendingUp,
        color: 'bg-purple-500',
        description: hideFinancialValues 
          ? '3% sobre ••••••'
          : `3% sobre R$ ${formatCurrencyWithoutSymbol(dashboardData.detalhes.valor_total_mensalidades)}`,
        isFinancial: true
      },
      {
        title: 'Total a Receber',
        value: formatCurrency(dashboardData.total_a_receber),
        subtitle: 'Soma de todos os recebíveis',
        icon: CreditCard,
        color: 'bg-orange-500',
        description: 'Saldo total disponível',
        isFinancial: true
      }
    ];
  }, [dashboardData, formatCurrency, formatCurrencyWithoutSymbol, hideFinancialValues]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
              onClick={() => fetchDashboardData(true)}
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
              Ainda não há clientes ou pagamentos vinculados ao seu afiliado ID.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                Dados em tempo real
                {lastUpdated && (
                  <span className="text-gray-500 text-sm ml-2">
                    (Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Botão de Suporte */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Suporte</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Suporte</DialogTitle>
                    <DialogDescription className="text-gray-300 mt-2">
                      Fale com um suporte tem alguma dúvida?
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              {/* Botão para ocultar/mostrar valores financeiros */}
              <button
                onClick={toggleVisibility}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                title={hideFinancialValues ? 'Mostrar valores' : 'Ocultar valores'}
                aria-label={hideFinancialValues ? 'Mostrar valores' : 'Ocultar valores'}
              >
                {hideFinancialValues ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span className="text-sm">Mostrar Valores</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Ocultar Valores</span>
                  </>
                )}
              </button>
              
              {/* Botão de Status Ativo/Inativo */}
              {dashboardData && (
                <button
                  disabled
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-default ${
                    dashboardData.total_clientes >= 7
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                  title={
                    dashboardData.total_clientes >= 7
                      ? 'Afiliado ativo - Pode fazer saque (7 ou mais placas)'
                      : 'Afiliado inativo - Não pode fazer saque (menos de 7 placas)'
                  }
                >
                  {dashboardData.total_clientes >= 7 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Ativo</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Inativo</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Grid de 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.length > 0 && cards.map((card, index) => (
            <div
              key={index}
              className="bg-bg border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-white mb-2">{card.value}</p>
                  <p className="text-gray-500 text-xs">{card.subtitle}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-gray-400 text-xs border-t border-gray-700 pt-3">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Componente de Metas */}
        {!perfilData?.super_admin && (
          <div className="mb-8">
            <GoalsProgressAfiliado totalPlacas={dashboardData.total_clientes} />
          </div>
        )}

       
      </div>
    </div>
  );
}