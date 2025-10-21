'use client';

import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, AlertTriangle, 
  Calendar, CreditCard, BarChart3, Filter, RefreshCw 
} from 'lucide-react';
import { AfiliadoDashboard, PerformanceAfiliado, RelatorioFinanceiro } from './types';
import { dashboardService } from '../../../lib/supabase/dashboardService';
import MetricCard from './components/MetricCard';
import AfiliadosTable from './components/AfiliadosTable';
import FinanceChart from './components/FinanceChart';
import PerformanceChart from './components/PerformanceChart';
import ChurnAlert from './components/ChurnAlert';

export default function Dashboard() {
  const [data, setData] = useState<AfiliadoDashboard[]>([]);
  const [performance, setPerformance] = useState<PerformanceAfiliado[]>([]);
  const [financeiro, setFinanceiro] = useState<RelatorioFinanceiro[]>([]);
  const [churnData, setChurnData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Chamando direto as views do Supabase
      const [dashboardData, performanceData, financeiroData, churnData] = await Promise.all([
        dashboardService.getDashboardAfiliados(),
        dashboardService.getPerformanceAfiliados(),
        dashboardService.getRelatorioFinanceiro(dateRange),
        dashboardService.getAnaliseChurn()
      ]);

      setData(dashboardData || []);
      setPerformance(performanceData || []);
      setFinanceiro(financeiroData || []);
      setChurnData(churnData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Métricas calculadas das views
  const metrics = {
    totalAfiliados: performance.length,
    totalClientes: performance.reduce((sum, p) => sum + p.total_clientes, 0),
    valorRecebido: performance.reduce((sum, p) => sum + p.valor_total_recebido, 0),
    clientesAtivos: performance.reduce((sum, p) => sum + p.clientes_ativos, 0),
    cobrancasPendentes: data.reduce((sum, d) => sum + d.total_pendentes, 0),
    taxaConversao: performance.length > 0 
      ? performance.reduce((sum, p) => sum + p.taxa_conversao_percent, 0) / performance.length 
      : 0,
    riscoChurn: churnData.length
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Afiliados</h1>
              <p className="text-gray-600">Dados em tempo real das views do Supabase</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
              
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de Churn */}
        {churnData.length > 0 && (
          <ChurnAlert count={churnData.length} />
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Afiliados"
            value={metrics.totalAfiliados.toString()}
            icon={Users}
            description="Afiliados ativos no sistema"
            color="blue"
          />
          <MetricCard
            title="Valor Recebido"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(metrics.valorRecebido)}
            icon={DollarSign}
            description="Total recebido dos clientes"
            color="green"
          />
          <MetricCard
            title="Clientes Ativos"
            value={metrics.clientesAtivos.toString()}
            icon={TrendingUp}
            description="Clientes com assinaturas ativas"
            color="purple"
          />
          <MetricCard
            title="Risco de Churn"
            value={metrics.riscoChurn.toString()}
            icon={AlertTriangle}
            description="Clientes em risco de cancelamento"
            color="red"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <FinanceChart data={financeiro} />
          <PerformanceChart data={performance} />
        </div>

        {/* Tabela de Afiliados */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Desempenho por Afiliado</h2>
            <span className="text-sm text-gray-500">
              {data.length} registros encontrados
            </span>
          </div>
          <AfiliadosTable data={data} />
        </div>
      </main>
    </div>
  );
}