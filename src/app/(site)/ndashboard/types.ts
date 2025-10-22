export interface User {
  id: string
  nome_completo: string
  email: string
  receita_total: number
  receita_pendente: number
  numero_placas: number
  porcentagem_comissao: number
  ativo: boolean
  form_link: string
  valor_adesao: number
  meta: number
  form_id: string
  total_activities: number
  clients: number
}

export interface User {
  id: string
  nome_completo: string
  email: string
  receita_total: number
  receita_pendente: number
  numero_placas: number
  porcentagem_comissao: number
  ativo: boolean
  form_link: string
  valor_adesao: number
  meta: number
  form_id: string
  total_activities: number
  clients: number
}

export interface Performance {
  id: string
  data: string
  cliente: string
  valor: string
  comissao: string
  status: 'pago' | 'pendente' | 'processando'
}

export interface RankingTop10 {
  posicao: number
  nome: string
  vendas: number
}

// Tipos para o componente de metas
export interface GoalsData {
  metaMensal: number
  progresso: number
  vendasNecessarias: number
  progressoPorcentagem: number
}