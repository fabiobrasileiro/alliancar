'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Barcode, QrCode, Calendar, DollarSign, User, FileText } from 'lucide-react';

interface AsaasPayment {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  subscription?: string;
  value: number;
  netValue: number;
  description: string;
  billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED';
  dueDate: string;
  paymentDate?: string;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference: string;
  creditCard?: {
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken: string;
  };
  bankSlipUrl?: string;
  pixTransaction?: any;
}

interface AsaasPaymentsProps {
  afiliadoId: string;
}

export default function AsaasPayments({ afiliadoId }: AsaasPaymentsProps) {
  const [payments, setPayments] = useState<AsaasPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!afiliadoId) return;

      try {
        setLoading(true);
        setError(null);

        // Buscar da API do Asaas
        const response = await fetch(`/api/payments?externalReference=${afiliadoId}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar pagamentos');
        }

        const data = await response.json();
        
        if (data.success) {
          setPayments(data.payments || []);
        } else {
          throw new Error(data.error || 'Erro ao carregar pagamentos');
        }
      } catch (err) {
        console.error('Erro ao buscar pagamentos:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [afiliadoId]);

  // Função para formatar status
  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      'PENDING': { color: 'text-yellow-500 bg-yellow-50', label: 'Pendente', icon: '⏳' },
      'CONFIRMED': { color: 'text-green-500 bg-green-50', label: 'Confirmado', icon: '✅' },
      'RECEIVED': { color: 'text-green-500 bg-green-50', label: 'Recebido', icon: '💰' },
      'OVERDUE': { color: 'text-red-500 bg-red-50', label: 'Atrasado', icon: '⚠️' },
      'REFUNDED': { color: 'text-gray-500 bg-gray-50', label: 'Estornado', icon: '↩️' },
      'CANCELLED': { color: 'text-gray-500 bg-gray-50', label: 'Cancelado', icon: '❌' }
    };
    return statusMap[status] || { color: 'text-gray-500 bg-gray-50', label: status, icon: '❓' };
  };

  // Função para formatar tipo de pagamento
  const getPaymentTypeInfo = (billingType: string) => {
    const typeMap: any = {
      'CREDIT_CARD': { color: 'text-purple-600 bg-purple-50', label: 'Cartão', icon: <CreditCard className="w-4 h-4" /> },
      'BOLETO': { color: 'text-blue-600 bg-blue-50', label: 'Boleto', icon: <Barcode className="w-4 h-4" /> },
      'PIX': { color: 'text-green-600 bg-green-50', label: 'PIX', icon: <QrCode className="w-4 h-4" /> }
    };
    return typeMap[billingType] || { color: 'text-gray-600 bg-gray-50', label: billingType, icon: <DollarSign className="w-4 h-4" /> };
  };

  if (loading) {
    return (
      <div className="bg-bg rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-white">Carregando pagamentos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg rounded-xl p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">❌</div>
          <p className="text-red-400">Erro ao carregar pagamentos</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-bg rounded-xl p-6">
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">💸</div>
          <p className="text-gray-400">Nenhum pagamento encontrado</p>
          <p className="text-gray-500 text-sm mt-1">Os pagamentos aparecerão aqui quando forem processados</p>
        </div>
      </div>
    );
  }

  // Calcular totais
  const totalValue = payments.reduce((sum, payment) => sum + payment.value, 0);
  const confirmedPayments = payments.filter(p => p.status === 'CONFIRMED' || p.status === 'RECEIVED');
  const totalConfirmed = confirmedPayments.reduce((sum, payment) => sum + payment.value, 0);

  return (
    <div className="bg-bg rounded-xl p-6">
      {/* Header com estatísticas */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          💰 Pagamentos do Asaas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-navbar1 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Processado</p>
                <p className="text-white font-bold text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-navbar1 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confirmados</p>
                <p className="text-white font-bold text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalConfirmed)}
                </p>
              </div>
              <div className="text-green-400 text-lg">✅</div>
            </div>
          </div>
          
          <div className="bg-navbar1 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Pagamentos</p>
                <p className="text-white font-bold text-lg">{payments.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pagamentos */}
      <div className="space-y-4">
        {payments.map((payment) => {
          const statusInfo = getStatusInfo(payment.status);
          const paymentTypeInfo = getPaymentTypeInfo(payment.billingType);
          
          return (
            <div key={payment.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Informações principais */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentTypeInfo.color}`}>
                      {paymentTypeInfo.icon}
                      {paymentTypeInfo.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-medium mb-1">{payment.description}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Venc: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                    {payment.paymentDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Pagamento: {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.value)}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2">
                  <a
                    href={payment.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Ver Fatura
                  </a>
                  
                  {payment.billingType === 'BOLETO' && payment.bankSlipUrl && (
                    <a
                      href={payment.bankSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Barcode className="w-4 h-4" />
                      Ver Boleto
                    </a>
                  )}
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
                  <div>
                    <span className="font-medium">ID:</span> {payment.id}
                  </div>
                  <div>
                    <span className="font-medium">Cliente:</span> {payment.customer}
                  </div>
                  <div>
                    <span className="font-medium">Fatura:</span> #{payment.invoiceNumber}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}