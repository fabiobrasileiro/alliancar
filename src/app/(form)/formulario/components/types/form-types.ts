import z from "zod";

// src/types/form-types.ts
export interface FormData {
  pwrClntNm: string;
  pwrCltPhn: string;
  pwrClntMl: string;
  pwrVhclPlt: string;
  pwrVhclTyp: string;
  pwrVhclBrnch: string;
  pwrVhclYr: string;
  pwrVhclMdl: string;
  pwrStt: string;
  pwrCt: string;
  taxiApp: boolean;
  pwrObs: string;
  pwrCnsltnt: string;
  pwrCmpnHsh: string;
  pwrFrmCode: string;
  pwrPplnClmn: string;
  pwrLdSrc: string;
}

export interface VehicleBrand {
  id: number;
  name: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  brand_id: number;
}

export interface State {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
}

// src/types/formTypes.ts
export interface MarcaVeiculo {
  id: number;
  nome: string;
}

export interface ModeloVeiculo {
  id: number;
  nome: string;
  marca_id: number;
  ano: number;
}

export interface Estado {
  id: number;
  nome: string;
  uf: string;
}

export interface Cidade {
  id: number;
  nome: string;
  estado_id: number;
}

export interface MultiStepFormProps {
  afiliadoId?: string;
}

// Esquema de validação Zod atualizado para Português
export const formSchema = z.object({
  afiliado_id: z.string().optional(),
  nome_cliente: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone_cliente: z.string().min(10, "Telefone inválido"),
  email_cliente: z.string().email("Email inválido"),
  placa_veiculo: z.string().min(7, "Placa deve ter 7 caracteres").max(7),
  tipo_veiculo: z.string().min(1, "Selecione o tipo de veículo"),
  marca_veiculo: z.string().min(1, "Selecione a marca"),
  ano_veiculo: z.string().min(1, "Selecione o ano"),
  modelo_veiculo: z.string().min(1, "Selecione o modelo"),
  estado: z.string().min(1, "Selecione o estado"),
  cidade: z.string().min(1, "Selecione a cidade"),
  taxi_aplicativo: z.boolean().default(false),
  observacoes: z.string().optional(),
  consultor: z.string().default("4lli4nc4r"),
  campanha_hash: z.string().default("4lli4nc4r club487"),
  codigo_formulario: z.string().default("DOarNyQe"),
  pipeline_coluna: z.string().default("1"),
  fonte_lead: z.string().default("14588"),
});

export type FormValues = z.infer<typeof formSchema>;