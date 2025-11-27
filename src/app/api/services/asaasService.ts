// services/asaasService.ts
interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
}

interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED';
  dueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  description: string;
  externalReference: string;
  invoiceUrl: string;
}

export interface AffiliateBalance {
  totalReceived: number;
  totalPending: number;
  availableBalance: number;
  totalWithdrawn: number;
  pendingPayments: AsaasPayment[];
  receivedPayments: AsaasPayment[];
}

export class AsaasService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY!;
    this.baseUrl = process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Asaas API error: ${response.status} - ${await response.text()}`);
    }

    return response.json();
  }

  // Buscar todos os pagamentos de um afiliado
  async getAffiliatePayments(affiliateId: string): Promise<AsaasPayment[]> {
    try {
      // Busca pagamentos pela externalReference (ID do afiliado)
      const data = await this.makeRequest(`/payments?externalReference=${affiliateId}&limit=100`);
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos do afiliado:', error);
      return [];
    }
  }

  // Buscar pagamentos por período
  async getPaymentsByDateRange(affiliateId: string, startDate: string, endDate: string): Promise<AsaasPayment[]> {
    try {
      const data = await this.makeRequest(
        `/payments?externalReference=${affiliateId}&limit=100&createdDate[ge]=${startDate}&createdDate[le]=${endDate}`
      );
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos por período:', error);
      return [];
    }
  }

  // Calcular saldo do afiliado diretamente do Asaas
  async calculateAffiliateBalance(affiliateId: string): Promise<AffiliateBalance> {
    const allPayments = await this.getAffiliatePayments(affiliateId);
    
    const receivedPayments = allPayments.filter(p => 
      p.status === 'RECEIVED' || p.status === 'CONFIRMED'
    );

    const pendingPayments = allPayments.filter(p => 
      p.status === 'PENDING' || p.status === 'OVERDUE'
    );

    const totalReceived = receivedPayments.reduce((sum, payment) => sum + payment.netValue, 0);
    const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.value, 0);

    // Buscar saques realizados (você pode manter isso no seu DB ou também no Asaas)
    const totalWithdrawn = await this.getTotalWithdrawn(affiliateId);

    const availableBalance = totalReceived - totalWithdrawn;

    return {
      totalReceived,
      totalPending,
      availableBalance: Math.max(availableBalance, 0),
      totalWithdrawn,
      pendingPayments,
      receivedPayments,
    };
  }

  // Buscar total sacado (pode manter uma tabela simples no seu DB apenas para saques)
  private async getTotalWithdrawn(affiliateId: string): Promise<number> {
    // Aqui você pode fazer uma request para sua própria API/database
    // ou implementar outra lógica para rastrear saques
    try {
      const response = await fetch(`/api/withdrawals?affiliateId=${affiliateId}`);
      const data = await response.json();
      return data.totalWithdrawn || 0;
    } catch (error) {
      console.error('Erro ao buscar saques:', error);
      return 0;
    }
  }

  // Criar uma nova cobrança para o afiliado
  async createPayment(affiliateId: string, customerData: any, paymentData: {
    value: number;
    dueDate: string;
    description: string;
  }): Promise<AsaasPayment> {
    // Primeiro criar o cliente no Asaas se não existir
    const customer = await this.findOrCreateCustomer(customerData);

    const paymentPayload = {
      customer: customer.id,
      billingType: 'PIX', // ou 'BOLETO' conforme necessário
      value: paymentData.value,
      dueDate: paymentData.dueDate,
      description: paymentData.description,
      externalReference: affiliateId, // ID do afiliado para rastreamento
    };

    const payment = await this.makeRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentPayload),
    });

    return payment;
  }

  // Buscar ou criar cliente no Asaas
  private async findOrCreateCustomer(customerData: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
  }): Promise<AsaasCustomer> {
    try {
      // Tenta buscar cliente por CPF/CNPJ
      const searchData = await this.makeRequest(`/customers?cpfCnpj=${customerData.cpfCnpj}`);
      
      if (searchData.data && searchData.data.length > 0) {
        return searchData.data[0];
      }

      // Se não encontrou, cria novo cliente
      const newCustomer = await this.makeRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });

      return newCustomer;
    } catch (error) {
      console.error('Erro ao buscar/criar cliente:', error);
      throw error;
    }
  }

  // Buscar informações de um pagamento específico
  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return await this.makeRequest(`/payments/${paymentId}`);
  }

  // Gerar QR Code PIX (se o pagamento for PIX)
  async getPixQrCode(paymentId: string): Promise<any> {
    return await this.makeRequest(`/payments/${paymentId}/pixQrCode`);
  }
}