// types/dashboard.ts
export interface AfiliadoDashboard {
  afiliado_id: string;
  afiliado_nome: string;
  afiliado_email: string;
  customer_id: string;
  customer_nome: string;
  customer_email: string;
  customer_telefone: string;
  subscription_id: string;
  subscription_tipo: string;
  subscription_valor: number;
  subscription_status: string;
  subscription_proximo_vencimento: string;
  ultimo_payment_status: string;
  ultimo_payment_valor: number;
  total_pagos: number;
  total_pendentes: number;
  total_vencidos: number;
  valor_total_recebido: number;
  status_consolidado: string;
  dias_ate_vencimento: number;
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