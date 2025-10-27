"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Types
interface ReportFilters {
  afiliado: string;
  status: string;
  dataInicio: string;
  dataFim: string;
}

interface ReportSummary {
  negociacoesCriadas: number;
  cotacoesCriadas: number;
  vendasConcretizadas: number;
  totalComissoes: number;
  totalValorVendas: number;
  metaCumprida: boolean;
  rankingPosicao: number;
  totalPagamentos: number;
  afiliadosAtivos: number;
}

interface NegociacaoRow {
  id: string;
  cliente: string;
  veiculo: string;
  valor: number;
  status: string;
  afiliado: string;
  criadaEm: string;
  contato_nome?: string;
  marca?: string;
  modelo?: string;
  placa?: string;
  valor_negociado?: number;
  afiliado_id?: string;
  email_afiliado?: string;
}

interface ChartData {
  vendas_por_status: Array<{ status: string; count: number; color: string }>;
  negociacoes_por_mes: Array<{ mes: string; negociacoes: number; vendas: number }>;
  comissoes_por_mes: Array<{ mes: string; valor: number }>;
  top_afiliados: Array<{ nome: string; vendas: number; comissao: number; posicao: number }>;
}

interface Afiliado {
  id: string;
  nome_completo: string;
  email: string;
  ativo: boolean;
  receita_total: number;
  numero_placas: number;
  criado_em: string;
}

export default function RelatoriosAdminPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    afiliado: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  });

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [negociacoes, setNegociacoes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar datas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Fetch afiliados
  const fetchAfiliados = async (): Promise<Afiliado[]> => {
    const { data, error } = await supabase
      .from('afiliados')
      .select('*')
      .order('nome_completo');

    if (error) throw error;
    return data || [];
  };

  // Fetch negociações com filtros
  const fetchNegociacoes = async (filters: ReportFilters): Promise<any[]> => {
    let query = supabase
      .from('negociacoes')
      .select(`
        *,
        contatos(*),
        afiliados(*)
      `)
      .order('criado_em', { ascending: false });

    // Aplicar filtros
    if (filters.afiliado && filters.afiliado !== 'all') {
      query = query.eq('afiliado_id', filters.afiliado);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.dataInicio) {
      query = query.gte('criado_em', `${filters.dataInicio}T00:00:00`);
    }

    if (filters.dataFim) {
      query = query.lte('criado_em', `${filters.dataFim}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  };

  // Calcular resumo
  const calculateSummary = (negociacoesData: any[], afiliadosData: Afiliado[]): ReportSummary => {
    const totalNegociacoes = negociacoesData.length;
    const cotacoesCriadas = negociacoesData.filter(n => n.status === 'Cotação recebida').length;
    const vendasConcretizadas = negociacoesData.filter(n => n.status === 'Venda concretizada').length;
    
    const totalValorVendas = negociacoesData
      .filter(n => n.status === 'Venda concretizada')
      .reduce((sum, n) => sum + (n.valor_negociado || 0), 0);

    const totalComissoes = totalValorVendas * 0.03; // 3% de comissão

    const afiliadosAtivos = afiliadosData.filter(a => a.ativo).length;

    return {
      negociacoesCriadas: totalNegociacoes,
      cotacoesCriadas,
      vendasConcretizadas,
      totalComissoes,
      totalValorVendas,
      metaCumprida: vendasConcretizadas >= 50,
      rankingPosicao: 1,
      totalPagamentos: afiliadosData.length,
      afiliadosAtivos,
    };
  };

  // Preparar dados para gráficos
  const prepareChartData = (negociacoes: any[], afiliados: Afiliado[]): ChartData => {
    // Vendas por Status
    const statusCount = negociacoes.reduce((acc: any, neg) => {
      acc[neg.status] = (acc[neg.status] || 0) + 1;
      return acc;
    }, {});

    const vendasPorStatus = Object.entries(statusCount).map(([status, count], index) => ({
      status,
      count: count as number,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index] || '#6b7280'
    }));

    // Negociações por Mês (últimos 6 meses)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        fullDate: date,
        formatted: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
      };
    }).reverse();

    const negociacoesPorMes = last6Months.map(({ fullDate, formatted }) => {
      const monthStart = new Date(fullDate.getFullYear(), fullDate.getMonth(), 1);
      const monthEnd = new Date(fullDate.getFullYear(), fullDate.getMonth() + 1, 0);
      
      const count = negociacoes.filter(neg => {
        const negDate = new Date(neg.criado_em);
        return negDate >= monthStart && negDate <= monthEnd;
      }).length;

      const vendas = negociacoes.filter(neg => {
        const negDate = new Date(neg.criado_em);
        return neg.status === 'Venda concretizada' && 
               negDate >= monthStart && 
               negDate <= monthEnd;
      }).length;

      return { mes: formatted, negociacoes: count, vendas };
    });

    // Comissões por mês
    const comissoesPorMes = last6Months.map(({ fullDate, formatted }) => {
      const monthStart = new Date(fullDate.getFullYear(), fullDate.getMonth(), 1);
      const monthEnd = new Date(fullDate.getFullYear(), fullDate.getMonth() + 1, 0);
      
      const vendasMes = negociacoes.filter(neg => {
        const negDate = new Date(neg.criado_em);
        return neg.status === 'Venda concretizada' && 
               negDate >= monthStart && 
               negDate <= monthEnd;
      });

      const totalComissao = vendasMes.reduce((sum, neg) => {
        return sum + ((neg.valor_negociado || 0) * 0.03);
      }, 0);

      return { mes: formatted, valor: totalComissao };
    });

    // Top Afiliados
    const afiliadosPerformance = afiliados.map(afiliado => {
      const vendasAfiliado = negociacoes.filter(
        neg => neg.afiliado_id === afiliado.id && neg.status === 'Venda concretizada'
      );

      const totalVendas = vendasAfiliado.length;
      const totalComissao = vendasAfiliado.reduce((sum, neg) => {
        return sum + ((neg.valor_negociado || 0) * 0.03);
      }, 0);

      return {
        nome: afiliado.nome_completo,
        vendas: totalVendas,
        comissao: totalComissao,
        posicao: 0
      };
    })
      .filter(af => af.vendas > 0)
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 10)
      .map((af, index) => ({ ...af, posicao: index + 1 }));

    return {
      vendas_por_status: vendasPorStatus,
      negociacoes_por_mes: negociacoesPorMes,
      comissoes_por_mes: comissoesPorMes,
      top_afiliados: afiliadosPerformance,
    };
  };

  // Carregar dados do relatório
  const loadReportData = async (filters: ReportFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Carregar dados em paralelo
      const [afiliadosData, negociacoesData] = await Promise.all([
        fetchAfiliados(),
        fetchNegociacoes(filters)
      ]);

      setAfiliados(afiliadosData);
      setNegociacoes(negociacoesData);

      // Calcular resumo
      const summaryData = calculateSummary(negociacoesData, afiliadosData);
      setSummary(summaryData);

      // Preparar dados dos gráficos
      const chartData = prepareChartData(negociacoesData, afiliadosData);
      setChartData(chartData);

    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  // Processar negociações para a tabela
  const processedNegociacoes: NegociacaoRow[] = negociacoes.map((neg: any) => ({
    id: neg.id,
    cliente: neg.contatos?.nome || "Cliente não informado",
    veiculo: `${neg.marca || ""} ${neg.modelo || ""} ${neg.ano_modelo || ""}`.trim() || "Veículo não informado",
    valor: neg.valor_negociado || 0,
    status: neg.status || "Status não informado",
    afiliado: neg.afiliados?.nome_completo || "Afiliado não informado",
    criadaEm: formatDate(neg.criado_em),
    contato_nome: neg.contatos?.nome,
    marca: neg.marca,
    modelo: neg.modelo,
    placa: neg.placa,
    valor_negociado: neg.valor_negociado,
    afiliado_id: neg.afiliado_id,
    email_afiliado: neg.afiliados?.email,
  }));

  // Exportar para CSV
  const exportToCSV = () => {
    if (processedNegociacoes.length === 0) return;

    const headers = ['Cliente', 'Veículo', 'Valor', 'Status', 'Afiliado', 'Data'];
    const rows = processedNegociacoes.map(row => [
      row.cliente,
      row.veiculo,
      formatCurrency(row.valor),
      row.status,
      row.afiliado,
      row.criadaEm
    ]);

    const csv = [headers, ...rows].map(row =>
      row.map(value => typeof value === 'string' && value.includes(',') ? `"${value}"` : value).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-admin-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers
  const handleFilterChange = (field: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    loadReportData(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      afiliado: "",
      status: "",
      dataInicio: "",
      dataFim: "",
    });
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadReportData(filters);
  }, []);

  // Componentes de gráficos
  const StatusPieChart = ({ data }: { data: Array<{ status: string; count: number; color: string }> }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return <p className="text-slate-500">Nenhum dado disponível</p>;

    return (
      <div className="flex flex-col items-center w-full">
        <div className="relative w-48 h-48 mb-4">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100;
              const circumference = 2 * Math.PI * 80;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = data
                .slice(0, index)
                .reduce((acc, prevItem) => acc - (prevItem.count / total) * circumference, 0);

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 100 100)"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span>{item.status}: {item.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BarChart = ({ data }: { data: Array<{ mes: string; negociacoes: number; vendas: number }> }) => {
    const maxValue = Math.max(...data.map(item => Math.max(item.negociacoes, item.vendas)), 1);

    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex-1 flex items-end justify-around gap-2 px-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 flex-1">
              <div className="flex gap-1 items-end h-32">
                <div
                  className="bg-blue-500 rounded-t min-w-[12px]"
                  style={{ height: `${(item.negociacoes / maxValue) * 100}%` }}
                  title={`Negociações: ${item.negociacoes}`}
                ></div>
                <div
                  className="bg-green-500 rounded-t min-w-[12px]"
                  style={{ height: `${(item.vendas / maxValue) * 100}%` }}
                  title={`Vendas: ${item.vendas}`}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{item.mes}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Negociações</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Vendas</span>
          </div>
        </div>
      </div>
    );
  };

  const LineChart = ({ data }: { data: Array<{ mes: string; valor: number }> }) => {
    const maxValue = Math.max(...data.map(item => item.valor));
    const minValue = Math.min(...data.map(item => item.valor));
    const range = maxValue - minValue || 1;

    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex-1 relative">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {data.map((item, index) => {
              if (index === 0) return null;
              const prevItem = data[index - 1];
              const x1 = (index - 1) * (400 / (data.length - 1));
              const x2 = index * (400 / (data.length - 1));
              const y1 = 180 - ((prevItem.valor - minValue) / range) * 160;
              const y2 = 180 - ((item.valor - minValue) / range) * 160;

              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#8b5cf6"
                  strokeWidth="2"
                />
              );
            })}
            {data.map((item, index) => {
              const x = index * (400 / (data.length - 1));
              const y = 180 - ((item.valor - minValue) / range) * 160;

              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#8b5cf6"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-around text-xs text-gray-600">
          {data.map((item, index) => (
            <span key={index}>{item.mes}</span>
          ))}
        </div>
      </div>
    );
  };

  const RankingList = ({ data }: { data: Array<{ nome: string; vendas: number; posicao: number }> }) => {
    if (data.length === 0) return <p className="text-slate-500 text-center">Nenhum afiliado com vendas</p>;

    return (
      <div className="space-y-3">
        {data.map((afiliado, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-blue-500"}
              `}
              >
                {afiliado.posicao}
              </div>
              <span className="font-medium text-sm">{afiliado.nome}</span>
            </div>
            <span className="text-sm text-gray-600">
              {afiliado.vendas} vendas
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="block m-auto p-4 md:px-6 md:py-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-bold leading-tight m-0 text-slate-800 text-3xl">
              Dashboard Administrativo
            </h1>
            <p className="text-slate-600 text-base mt-2">
              Visão completa de todos os afiliados e negociações do sistema
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => loadReportData(filters)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-background disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Atualizando...' : 'Atualizar Dados'}
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total de Afiliados</p>
              <p className="text-2xl font-bold text-blue-600">
                {afiliados.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <section className="bg-white rounded-lg border p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Filtro por Afiliado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Afiliado
            </label>
            <select
              value={filters.afiliado}
              onChange={(e) => handleFilterChange("afiliado", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os afiliados</option>
              {afiliados.map((afiliado) => (
                <option key={afiliado.id} value={afiliado.id}>
                  {afiliado.nome_completo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="Cotação recebida">Cotação Recebida</option>
              <option value="Em negociação">Em Negociação</option>
              <option value="Venda concretizada">Venda Concretizada</option>
              <option value="Arquivada">Arquivada</option>
            </select>
          </div>

          {/* Filtro por Data Início */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por Data Fim */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) => handleFilterChange("dataFim", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-background transition-colors"
          >
            Limpar
          </button>
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Aplicando..." : "Aplicar Filtros"}
          </button>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 text-lg">
            Carregando dados completos...
          </span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-red-800 text-lg mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => loadReportData(filters)}
            className="mt-4 px-4 py-2 border border-red-200 text-red-700 rounded-md hover:bg-red-50 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Conteúdo */}
      {!loading && !error && (
        <>
          {/* Cards de Resumo */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summary && (
              <>
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Negociações Criadas</p>
                      <p className="text-2xl font-bold text-blue-600">{summary.negociacoesCriadas}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Vendas Concretizadas</p>
                      <p className="text-2xl font-bold text-green-600">{summary.vendasConcretizadas}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total em Vendas</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalValorVendas)}</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total de Comissões</p>
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalComissoes)}</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Gráficos */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Vendas por Status */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-4">Vendas por Status</h3>
              <div className="h-64 flex items-center justify-center">
                {chartData?.vendas_por_status && chartData.vendas_por_status.length > 0 ? (
                  <StatusPieChart data={chartData.vendas_por_status} />
                ) : (
                  <p className="text-slate-500">Nenhum dado de vendas disponível</p>
                )}
              </div>
            </div>

            {/* Gráfico de Negociações por Mês */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-4">Negociações por Mês</h3>
              <div className="h-64 flex items-center justify-center">
                {chartData?.negociacoes_por_mes && chartData.negociacoes_por_mes.length > 0 ? (
                  <BarChart data={chartData.negociacoes_por_mes} />
                ) : (
                  <p className="text-slate-500">Nenhum dado mensal disponível</p>
                )}
              </div>
            </div>

            {/* Gráfico de Comissões por Mês */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-4">Comissões por Mês</h3>
              <div className="h-64 flex items-center justify-center">
                {chartData?.comissoes_por_mes && chartData.comissoes_por_mes.length > 0 ? (
                  <LineChart data={chartData.comissoes_por_mes} />
                ) : (
                  <p className="text-slate-500">Nenhum dado de comissões disponível</p>
                )}
              </div>
            </div>

            {/* Top Afiliados */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-4">Top 10 Afiliados</h3>
              <div className="h-64 overflow-y-auto">
                <RankingList data={chartData?.top_afiliados || []} />
              </div>
            </div>
          </section>

          {/* Tabela de Negociações */}
          <section className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Todas as Negociações</h3>
              <button
                onClick={exportToCSV}
                disabled={processedNegociacoes.length === 0}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              {processedNegociacoes.length > 0 ? (
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-background border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Veículo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Afiliado</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedNegociacoes.map((negociacao) => (
                      <tr key={negociacao.id} className="border-b hover:bg-background">
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {negociacao.cliente}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {negociacao.veiculo}
                          {negociacao.placa && (
                            <span className="text-background0 text-xs block mt-1">
                              Placa: {negociacao.placa}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {formatCurrency(negociacao.valor)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${
                                negociacao.status === 'Venda concretizada'
                                  ? 'bg-green-100 text-green-800'
                                  : negociacao.status === 'Em negociação'
                                  ? 'bg-blue-100 text-blue-800'
                                  : negociacao.status === 'Cotação recebida'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            `}
                          >
                            {negociacao.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <div>
                            <div className="font-medium">{negociacao.afiliado}</div>
                            {negociacao.email_afiliado && (
                              <div className="text-xs text-background0">{negociacao.email_afiliado}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {negociacao.criadaEm}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma negociação encontrada</h3>
                  <p className="mt-1 text-sm text-background0">
                    Tente ajustar os filtros para ver mais resultados.
                  </p>
                </div>
              )}
            </div>

            {/* Paginação */}
            {processedNegociacoes.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{processedNegociacoes.length}</span> resultados
                </div>
                <div className="flex gap-2">
                  <button
                    disabled
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-400 cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    disabled
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-400 cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}