export interface ReportSummary {
  negociacoesCriadas: number;
  cotacoesCriadas: number;
  negociacoesArquivadas: number;
  vendasConcretizadas: number;
  totalComissoes: number;
  totalPagamentos: number;
  metaCumprida: boolean;
  rankingPosicao?: number;
}

export interface ReportFilters {
  cooperativa: string;
  vendedor: string;
  dataInicio: string;
  dataFim: string;
}

export interface NegociacaoRow {
  id?: string;
  cliente: string;
  veiculo: string;
  valor: string;
  status: string;
  criadaEm: string;
  contato_nome?: string;
  marca?: string;
  modelo?: string;
  placa?: string;
  valor_negociado?: number;
  afiliado_id?: string;
}

export interface ChartData {
  vendas_por_status: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  negociacoes_por_mes: Array<{
    mes: string;
    negociacoes: number;
    vendas: number;
  }>;
  comissoes_por_mes: Array<{
    mes: string;
    valor: number;
  }>;
  top_afiliados: Array<{
    nome: string;
    vendas: number;
    posicao: number;
  }>;
}
