export type StatusPagamento = "pendente" | "processando" | "pago" | "falha";
export type StatusAtividade =
  | "pendente"
  | "em_andamento"
  | "concluida"
  | "cancelada";
export type PrioridadeAtividade = "Baixa" | "Normal" | "Alta" | "Urgente";
export type TipoUsuario = "afiliado" | "admin" | "supervisor";
export type OrigemCliente =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "indicacao"
  | "site"
  | "outro";

export interface Performance {
  id: string;
  data: string;
  cliente: string;
  valor: string;
  comissao: string;
  status: StatusPagamento;
}

export interface RankingTop10 {
  posicao: number;
  nome: string;
  vendas: number;
  total_comissao: number;
}

export interface Afiliado {
  id: string;
  nome_completo: string;
  email: string;
  saldoDisponivel: string;
  saldoPendente: string;
  foto_perfil_url?: string;
  receita_total: number;
  receita_pendente: number;
  numero_placas: number;
  porcentagem_comissao: number;
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

// Tipos para dados do Supabase
export interface SupabaseAfiliado {
  id: string;
  auth_id: string;
  nome_completo: string;
  email: string;
  cpf_cnpj?: string;
  telefone?: string;
  foto_perfil_url?: string;
  receita_total: number;
  receita_pendente: number;
  numero_placas: number;
  porcentagem_comissao: number;
  ativo: boolean;
  tipo: string;
  criado_em: string;
  atualizado_em: string;
}

export interface SupabaseComissao {
  id: string;
  afiliado_id: string;
  cliente_id?: string;
  placa_veiculo: string;
  valor_contrato: number;
  porcentagem_comissao: number;
  valor_comissao: number;
  mes_referencia: string;
  status: StatusPagamento;
  data_pagamento?: string;
  criado_em: string;
  atualizado_em: string;
  clientes?: {
    nome: string;
  };
}

export interface AffiliateData {
  valorAdesao: string;
  saldoPendente: string;
  vendasMes: number;
  ranking: number;
  metaMensal: number;
  progresso: number;
  vendasNecessarias: number;
  performance: any[];
  linkAfiliado: string;
  progressoPorcentagem: number;
  qrCode: string;
  rankingTop10: any[];
}
