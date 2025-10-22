// types/dashboard.ts
export interface AfiliadoData {
  afiliado_nome: string;
  subscription_value: number;
  payment_value: number;
  customers_count: number;
}

export interface PerformanceAfiliado {
  afiliado_id: string;
  afiliado_nome: string;
  total_clientes: number;
  total_assinaturas: number;
  total_cobrancas: number;
  valor_total_recebido: number;
  valor_total_pendente: number;
  taxa_conversao_percent: number;
  ticket_medio: number;
  clientes_ativos: number;
}

export interface RelatorioFinanceiro {
  mes_ano: string;
  afiliado_id: string;
  afiliado_nome: string;
  total_cobrancas: number;
  cobrancas_recebidas: number;
  cobrancas_pendentes: number;
  valor_total: number;
  valor_recebido: number;
  valor_pendente: number;
  taxa_sucesso_percent: number;
}