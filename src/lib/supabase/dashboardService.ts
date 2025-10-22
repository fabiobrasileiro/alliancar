import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dashboardService = {
  async getDashboardAfiliados() {
    const { data, error } = await supabase
      .from('vw_dashboard_afiliados')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getPerformanceAfiliados() {
    const { data, error } = await supabase
      .from('vw_performance_afiliados')
      .select('*')
      .order('valor_total_recebido', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getRelatorioFinanceiro(range: string = '30d') {
    // Calcular data base baseada no range
    const baseDate = new Date();
    switch (range) {
      case '7d': baseDate.setDate(baseDate.getDate() - 7); break;
      case '30d': baseDate.setDate(baseDate.getDate() - 30); break;
      case '90d': baseDate.setDate(baseDate.getDate() - 90); break;
      case '1y': baseDate.setFullYear(baseDate.getFullYear() - 1); break;
    }

    const { data, error } = await supabase
      .from('vw_relatorio_financeiro_mensal')
      .select('*')
      .gte('mes_ano', baseDate.toISOString())
      .order('mes_ano', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getAnaliseChurn() {
    const { data, error } = await supabase
      .from('vw_analise_churn')
      .select('*')
      .in('classificacao_churn', ['CHURN_CONFIRMADO', 'CHURN_PROVAVEL']);
    
    if (error) throw error;
    return data;
  }
};