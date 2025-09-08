export interface FinancialSummary {
  saldoTotal: string;
  saldoDisponivel: string;
  saldoPendente: string;
  totalTransacoes: number;
}

export interface Transaction {
  id: string;
  tipo: "entrada" | "saida" | "comissao";
  descricao: string;
  valor: string;
  data: string;
  status: "pendente" | "aprovado" | "rejeitado";
  categoria: string;
}

export interface PaymentRequest {
  valor: string;
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: "corrente" | "poupanca";
  observacoes?: string;
}
