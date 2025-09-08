export interface ContactRow {
  id: string;
  contato?: string;
  nome_completo?: string;
  telefone?: string;
  cpf_cnpj?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  receita_estimada?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  status?: string;
  ativo?: boolean;
  link?: string;
  [key: string]: unknown;
}

export interface ContactFilters {
  nomeCompleto: string;
  telefone: string;
  cpfCnpj: string;
  banco: string;
  estado: string;
  searchTerm: string;
}
