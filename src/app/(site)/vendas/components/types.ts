// app/negociacoes/components/types.ts
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
  contato_nome?: string;
  contato_email?: string;
  contato_celular?: string;
}

export interface SaleCard {
  id: string;
  clientName: string;
  date: string;
  vehicle: string;
  price: string;
  status: StatusNegociacao;
  tags: string[];
  hasTracker: boolean; // Não opcional, sempre tem valor
  isAccepted: boolean; // Não opcional, sempre tem valor
  isExpired: boolean; // Não opcional, sempre tem valor
  daysInStage: number; // Não opcional, sempre tem valor
  user: string;
  placa: string;
  marca: string;
  modelo: string;
  ano_modelo: string;
  valor_negociado?: number;
}

export interface NewNegotiationForm {
  placa: string;
  afiliado_id?: string; 
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