'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Tipos
interface AfiliadoDashboard {
  afiliado_id: string;
  afiliado_nome: string;
  afiliado_email: string;
  total_clientes: number;
  total_payments: number;
  adesao_recebida: number;
  adesao_a_receber: number;
  total_subscriptions: number;
  recorrencia_a_receber: number;
  total_hotlinks: number;
  total_cliques: number;
  total_conversoes: number;
  taxa_conversao: number;
  score_total: number;
  primeiro_cliente_data: string;
  ultimo_cliente_data: string;
  data_consulta: string;
  ranking_geral?: number;
}

interface MetricasGerais {
  total_afiliados: number;
  total_clientes_geral: number;
  adesao_recebida_geral: number;
  adesao_a_receber_geral: number;
  recorrencia_a_receber_geral: number;
  taxa_conversao_media: number;
}

// Ícones simples como SVG
const Icons = {
  Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
  Money: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-13a2 2 0 11-4 0 2 2 0 014 0zM4 21v-4a1 1 0 011-1h14a1 1 0 011 1v4" /></svg>,
  Trending: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Link: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Trophy: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Crown: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
};

export default function Dashboard() {
  const [meusDados, setMeusDados] = useState<AfiliadoDashboard | null>(null);
  const [ranking, setRanking] = useState<AfiliadoDashboard[]>([]);
  const [metricasGerais, setMetricasGerais] = useState<MetricasGerais | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('meu-desempenho');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do afiliado logado
      const { data: userData } = await supabase.auth.getUser();
      const userId = '83a47952-1bfb-4f62-96c9-884e50efbc26';

      if (userId) {
        const { data: meuDashboard } = await supabase
          .from('afiliados_dashboard')
          .select('*')
          .eq('afiliado_id', userId)
          .single();

        setMeusDados(meuDashboard);

        // Tentar buscar ranking (se for admin)
        const { data: rankingData } = await supabase
          .from('afiliados_dashboard')
          .select('*')
          .order('score_total', { ascending: false });

        if (rankingData && rankingData.length > 0) {
          const rankingComRank = rankingData.map((item, index) => ({
            ...item,
            ranking_geral: index + 1
          }));
          setRanking(rankingComRank);
          setIsAdmin(true);
        }

        // Buscar métricas gerais
        const { data: metricasData } = await supabase
          .rpc('get_metricas_gerais_dashboard');

        setMetricasGerais(metricasData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarNumero = (valor: number) => {
    return valor.toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Afiliados</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {meusDados?.afiliado_nome}
              </span>
              {meusDados?.ranking_geral && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Rank #{meusDados.ranking_geral}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('meu-desempenho')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'meu-desempenho'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Meu Desempenho
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('ranking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ranking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Ranking Geral
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('metricas-gerais')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'metricas-gerais'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Métricas Gerais
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'meu-desempenho' && meusDados && (
          <div className="space-y-6">
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total de Clientes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatarNumero(meusDados.total_clientes)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Placas ativas</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Icons.Users />
                  </div>
                </div>
              </div>

              {/* Adesão Recebida */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Adesão Recebida</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatarMoeda(meusDados.adesao_recebida)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Valor confirmado</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Icons.Money />
                  </div>
                </div>
              </div>

              {/* Adesão a Receber */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Adesão a Receber</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatarMoeda(meusDados.adesao_a_receber)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Valor pendente</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Icons.Trending />
                  </div>
                </div>
              </div>

              {/* Recorrência a Receber */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recorrência Mensal</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatarMoeda(meusDados.recorrencia_a_receber)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Por mês</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Icons.Trophy />
                  </div>
                </div>
              </div>
            </div>

            {/* Segunda Linha de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hotlinks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hotlinks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatarNumero(meusDados.total_hotlinks)}
                    </p>
                    <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                      <span>{formatarNumero(meusDados.total_cliques)} cliques</span>
                      <span>{formatarNumero(meusDados.total_conversoes)} conversões</span>
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <Icons.Link />
                  </div>
                </div>
              </div>

              {/* Taxa de Conversão */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {meusDados.taxa_conversao.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Eficiência</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <Icons.Trending />
                  </div>
                </div>
              </div>

              {/* Score Total */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Score Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatarMoeda(meusDados.score_total)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Performance geral</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <Icons.Crown />
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Primeiro cliente:</p>
                  <p className="font-medium">
                    {new Date(meusDados.primeiro_cliente_data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Último cliente:</p>
                  <p className="font-medium">
                    {new Date(meusDados.ultimo_cliente_data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && isAdmin && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Ranking de Afiliados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Afiliado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clientes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adesão Recebida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recorrência Mensal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ranking.map((afiliado) => (
                    <tr key={afiliado.afiliado_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                            afiliado.ranking_geral === 1 
                              ? 'bg-yellow-100 text-yellow-800'
                              : afiliado.ranking_geral === 2
                              ? 'bg-gray-100 text-gray-800'
                              : afiliado.ranking_geral === 3
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            #{afiliado.ranking_geral}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {afiliado.afiliado_nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {afiliado.afiliado_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarNumero(afiliado.total_clientes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarMoeda(afiliado.adesao_recebida)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarMoeda(afiliado.recorrencia_a_receber)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatarMoeda(afiliado.score_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'metricas-gerais' && isAdmin && metricasGerais && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Geral</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Afiliados:</span>
                  <span className="font-semibold">{formatarNumero(metricasGerais.total_afiliados)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Clientes:</span>
                  <span className="font-semibold">{formatarNumero(metricasGerais.total_clientes_geral)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa Conversão Média:</span>
                  <span className="font-semibold">{metricasGerais.taxa_conversao_media.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financeiro</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Adesão Recebida:</span>
                  <span className="font-semibold text-green-600">
                    {formatarMoeda(metricasGerais.adesao_recebida_geral)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adesão a Receber:</span>
                  <span className="font-semibold text-yellow-600">
                    {formatarMoeda(metricasGerais.adesao_a_receber_geral)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recorrência Mensal:</span>
                  <span className="font-semibold text-purple-600">
                    {formatarMoeda(metricasGerais.recorrencia_a_receber_geral)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Médias por Afiliado</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes por Afiliado:</span>
                  <span className="font-semibold">
                    {formatarNumero(Math.round(metricasGerais.total_clientes_geral / metricasGerais.total_afiliados))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adesão Média:</span>
                  <span className="font-semibold">
                    {formatarMoeda(metricasGerais.adesao_recebida_geral / metricasGerais.total_afiliados)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recorrência Média:</span>
                  <span className="font-semibold">
                    {formatarMoeda(metricasGerais.recorrencia_a_receber_geral / metricasGerais.total_afiliados)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}