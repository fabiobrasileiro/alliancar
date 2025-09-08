export interface SaleCard {
  id: string;
  clientName: string;
  date: string;
  vehicle: string;
  price: string;
  status: "quotation" | "negotiation" | "inspection" | "ready" | "closed";
  tags: string[];
  hasTracker: boolean;
  isAccepted?: boolean;
  isExpired?: boolean;
  daysInStage: number;
  user: string;
  userAvatar?: string;
}

export interface NewNegotiationForm {
  cooperativa: string;
  tipoVeiculo: string;
  placa: string;
  marca: string;
  anoModelo: string;
  modelo: string;
  nomeContato: string;
  email: string;
  celular: string;
  estado: string;
  cidade: string;
  origemLead: string;
  subOrigemLead: string;
  veiculoTrabalho: boolean;
  enviarCotacao: boolean;
}

export interface FilterData {
  tipoData: string;
  dataInicial: string;
  dataFinal: string;
  cooperativas: string[];
  usuarios: string[];
  origem: string[];
  subOrigem: string[];
  tagsAutomaticas: string;
  cartoesArquivados: boolean;
  cotaçõesPagas: boolean;
  boletosNaoPagos: boolean;
  instalacaoRastreador: boolean;
  cartoesExpirados: boolean;
  cartoesAceitos: boolean;
  cartoesNaoAtendidos: boolean;
  ordenarAntigas: boolean;
}
