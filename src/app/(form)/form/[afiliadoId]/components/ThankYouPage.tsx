// components/ThankYouPage.tsx
import Link from "next/link";
import { InsurancePlan, OrderValues } from "./steps/types";

interface ThankYouPageProps {
    paymentData: {
        paymentId: string;
        paymentMethod: string;
        invoiceUrl?: string;
        status: string;
    };
    orderValues: OrderValues;
    plano: InsurancePlan | null;
    onRedirect: () => void;
}

export default function ThankYouPage({ paymentData, orderValues, plano, onRedirect }: ThankYouPageProps) {
    const getPaymentMethodText = () => {
        switch (paymentData.paymentMethod) {
            case 'PIX':
                return 'PIX';
            case 'BOLETO':
                return 'Boleto Bancário';
            case 'CREDIT_CARD':
                return 'Cartão de Crédito';
            default:
                return 'Pagamento';
        }
    };

    const formatDate = () => {
        return new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-background rounded-2xl shadow-2xl p-8 text-center">
                {/* Ícone de sucesso */}
                <div className="mb-6">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Título principal */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Pagamento Confirmado!
                </h1>

                {/* Mensagem de agradecimento */}
                <p className="text-lg text-gray-600 mb-8">
                    Obrigado por escolher nosso seguro auto. Seu pagamento foi processado com sucesso.
                </p>

                {/* Card de confirmação */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-green-800 font-semibold">PAGAMENTO CONFIRMADO</span>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span>Método:</span>
                            <span className="font-semibold">{getPaymentMethodText()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Valor:</span>
                            <span className="font-semibold text-green-600">
                                R$ {orderValues.total.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Data:</span>
                            <span className="font-semibold">{formatDate()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>ID:</span>
                            <span className="font-mono text-xs">{paymentData.paymentId}</span>
                        </div>
                    </div>
                </div>

                {/* Resumo do seguro */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4">Resumo do seu Seguro</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span>Plano:</span>
                            <span className="font-semibold">{plano?.category_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cobertura:</span>
                            <span className="font-semibold">{plano?.vehicle_range}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Mensalidade:</span>
                            <span className="font-semibold">R$ {plano?.monthly_payment?.toFixed(2)}/mês</span>
                        </div>
                    </div>
                </div>

                {/* Próximos passos */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-blue-800 mb-3">Próximos Passos</h3>
                    <div className="space-y-2 text-sm text-blue-700 text-left">
                        <div className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                            <span>Você receberá o contrato por e-mail em até 24 horas</span>
                        </div>
                        <div className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                            <span>Seu seguro estará ativo a partir da confirmação da vistória por meio do aplicativo abaixo</span>
                            
                        </div>
                        <div className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                            <span>Em caso de sinistro, entre em contato com nossa central 24h</span>
                        </div>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {paymentData.invoiceUrl && (
                        <a
                            href={paymentData.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                        >
                            📄 Baixar Comprovante
                        </a>
                    )}
                    
                    <button
                        onClick={onRedirect}
                        className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                        🏠 Ir para o Início
                    </button>
                </div>

                {/* Informações de contato */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">
                        Precisa de ajuda? Entre em contato conosco:
                    </p>
                    <div className="flex justify-center space-x-6 text-sm text-gray-600">
                        <span>📞 (11) 9999-9999</span>
                        <span>✉️ suporte@seguroauto.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}