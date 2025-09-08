export interface Atividade {
  id: number;
  created_at: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  prioridade: "alta" | "media" | "baixa";
  tipo: "reuniao" | "tarefa" | "ligacao" | "apresentacao";
  status: "atrasada" | "hoje" | "planejada" | "concluida";
}

export interface Usuario {
  id: string;
  nome_completo: string;
}

export interface TypeFilters {
  Visita: boolean;
  Whatsapp: boolean;
  Ligar: boolean;
  Email: boolean;
  Previsão_fechamento: boolean;
}

export interface PriorityFilters {
  Alta: boolean;
  Normal: boolean;
  Baixa: boolean;
}

export interface NewActivityForm {
  titulo: string;
  descricao: string;
  responsavel: string;
  responsavel_name: string;
  prioridade: "Alta" | "Normal" | "Baixa";
  tipo: "Ligar" | "Whatsapp" | "Email" | "Visita" | "Previsão de fechamento";
  prazo: string;
}
