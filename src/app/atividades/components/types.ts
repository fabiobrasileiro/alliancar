export interface Atividade {
  id: number;
  titulo: string;
  descricao: string;
  afiliado_id: string;
  prioridade: "Alta" | "Normal" | "Baixa";
  tipo: "Ligar" | "Whatsapp" | "Email" | "Visita" | "Previsão de fechamento";
  prazo: string;
  status: "atrasada" | "hoje" | "planejada" | "concluida";
  concluida_em?: string;
  criado_em: string;
}

export interface Usuario {
  id: string;
  nome_completo: string;
}

export interface TypeFilters {
  Ligar: boolean;
  Whatsapp: boolean;
  Email: boolean;
  Visita: boolean;
  Previsão_fechamento: boolean;
}

export interface PriorityFilters {
  Alta: boolean;
  Normal: boolean;
  Baixa: boolean;
}

export interface NovaAtividade {
  titulo: string;
  descricao: string;
  afiliado_id: string;
  prioridade: "Alta" | "Normal" | "Baixa";
  tipo: "Ligar" | "Whatsapp" | "Email" | "Visita" | "Previsão de fechamento";
  prazo: string;
}
