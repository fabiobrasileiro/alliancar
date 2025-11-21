// Adicione estes tipos aos existentes
export interface ContactRow {
  id: string;
  nome: string;
  email?: string;
  celular?: string;
  cpf_cnpj?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  origem_lead?: string;
  veiculo_trabalho?: boolean;
  enviar_cotacao_email?: boolean;
  afiliado_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export const ORIGEM_LEAD_OPTIONS = [
  "Facebook",
  "Google",
  "Indicação",
  "Instagram",
  "Presencial",
  "Site",
] as const;
export interface Contato {
  id: string;
  name: string;
  email: string;
  telefone: string;
  estado: string;
  city_name: string;
  created_at: string;
  observacoes?: string;
  mobile_phone?: string;
}

export interface Filtros {
  name: string;
  email: string;
  telefone: string;
  estado: string;
  city_name: string;
}