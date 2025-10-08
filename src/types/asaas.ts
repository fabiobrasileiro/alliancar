// types/asaas.ts
export interface CustomerData {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}

export interface PaymentData {
  customer: string;
  billingType: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
  value: number;
  dueDate: string;
  description?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardToken?: string;
}

export interface SplitData {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
}

export interface SubscriptionData {
  customer: string;
  billingType: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
  value: number;
  nextDueDate: string;
  cycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  description: string;
  split?: SplitData[];
}