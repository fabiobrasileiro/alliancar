export interface ReportSummary {
  negociacoesCriadas: number;
  cotacoesCriadas: number;
  negociacoesArquivadas: number;
  vendasConcretizadas: number;
}

export interface ReportFilters {
  cooperativa: string;
  vendedor: string;
  dataInicio: string;
  dataFim: string;
}

export interface NegociacaoRow {
  cliente: string;
  veiculo: string;
  valor: string;
  status: string;
  criadaEm: string;
}
