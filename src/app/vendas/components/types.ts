// types.ts
export type StatusNegociacao =
  | "Cotação recebida"
  | "Em negociação"
  | "Vistoria"
  | "Liberada para cadastro"
  | "Venda concretizada";

export type StatusPagamento = "pendente" | "processando" | "pago" | "falha";

export interface Negociacao {
  id: string;
  placa: string;
  ano_modelo: string;
  modelo: string;
  marca: string;
  afiliado_id: string;
  contato_id: string;
  status: StatusNegociacao;
  valor_negociado?: number;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  // Campos para join com contatos
  contato_nome?: string;
  contato_email?: string;
  contato_celular?: string;
}

export interface AvaliacaoVenda {
  id: string;
  negociacao_id: string;
  afiliado_id: string;
  valor_venda: number;
  porcentagem_comissao: number;
  valor_comissao: number;
  status: StatusPagamento;
  observacoes_avaliador?: string;
  aprovado: boolean;
  data_aprovacao?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface SaleCard {
  id: string;
  clientName: string;
  date: string;
  vehicle: string;
  price: string;
  status: StatusNegociacao;
  tags: string[];
  hasTracker: boolean;
  isAccepted: boolean;
  isExpired: boolean;
  daysInStage: number;
  user: string;
  placa: string;
  marca: string;
  modelo: string;
  ano_modelo: string;
  valor_negociado?: number;
}

export interface NewNegotiationForm {
  placa: string;
  ano_modelo: string;
  modelo: string;
  marca: string;
  nomeContato: string;
  email: string;
  celular: string;
  estado: string;
  cidade: string;
  origemLead: string;
  valor_negociado?: number;
  observacoes?: string;
}

export interface FilterData {
  tipoData: string;
  dataInicial: string;
  dataFinal: string;
  status: StatusNegociacao[];
  marcas: string[];
  modelos: string[];
  valorMin: number;
  valorMax: number;
}
