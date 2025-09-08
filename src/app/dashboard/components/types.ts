export type Performance = {
  id: number;
  data: string;
  cliente: string;
  valor: string;
  comissao: string;
  status: string;
};

export type RankingTop10 = {
  posicao: number;
  nome: string;
  vendas: number;
};

export interface Afiliado {
  saldoDisponivel: string;
  saldoPendente: string;
  vendasMes: number;
  ranking: number;
  metaMensal: number;
  progresso: number;
  vendasNecessarias: number;
  performance: Performance[];
  linkAfiliado: string;
  qrCode: string;
  badges: string[];
  rankingTop10: RankingTop10[];
}