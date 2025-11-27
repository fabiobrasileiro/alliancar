// components/PaymentResult.tsx
import { InsurancePlan, OrderValues } from "./steps/types";
import ThankYouPage from "./ThankYouPage";

interface PaymentResultProps {
    result: any;
    paymentMethod: string;
    onBack: () => void;
    orderValues: OrderValues;
    plano: InsurancePlan | null;
}

export default function PaymentResult({ result, paymentMethod, onBack, orderValues, plano }: PaymentResultProps) {
    if (!result.success) {
        return (
            <div className="max-w-2xl mx-auto p-6 my-14 bg-gray-900 shadow-lg rounded-lg">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Erro no Pagamento</h2>
                    <p className="text-white mb-6">{result.message || "Ocorreu um erro ao processar seu pagamento."}</p>
                    <button
                        onClick={onBack}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    if (result.payment?.status === 'CONFIRMED' || result.payment?.status === 'RECEIVED') {
        return (
            <ThankYouPage
                paymentData={{
                    paymentId: result.payment?.id || result.paymentId,
                    paymentMethod: paymentMethod,
                    invoiceUrl: result.invoiceUrl,
                    status: result.payment?.status
                }}
                orderValues={orderValues}
                plano={plano}
                onRedirect={onBack}
            />
        );
    }
    const renderPixPayment = () => (
        <div className="bg-white p-6 rounded-lg border-2 border-green-500">
            <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">QR Code PIX</h4>
                <p className="text-gray-600 text-sm">Escaneie com seu app bancário</p>
            </div>

            <div className="flex justify-center">
                <img
                    src={`data:image/png;base64,${result.pixQrCode}`}
                    alt="QR Code PIX"
                    className="w-64 h-64 border-2 border-gray-300 rounded-lg"
                />
            </div>

            <div className="mt-4 text-center">
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(result.pixPayload);
                        alert("Código PIX copiado!");
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                    Copiar Código PIX
                </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
                <p>Expira em: {new Date(result.pixExpirationDate).toLocaleString('pt-BR')}</p>
            </div>
        </div>
    );

    const renderBoletoPayment = () => (
        <div className="bg-white p-6 rounded-lg border-2 border-orange-500">
            <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Boleto Bancário</h4>
                <p className="text-gray-600 text-sm">Clique no botão abaixo para visualizar e imprimir seu boleto</p>
            </div>

            <div className="text-center">
                <a
                    href={result.bankSlipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold inline-block"
                >
                    Visualizar Boleto
                </a>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
                <p>Vencimento: {new Date(result.payment?.dueDate).toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
    );

    const renderCreditCardPayment = () => (
        <div className="bg-white p-6 rounded-lg border-2 border-blue-500">
            <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Pagamento com Cartão</h4>
                <p className="text-gray-600 text-sm">
                    {result.payment?.status === 'CONFIRMED'
                        ? "Pagamento confirmado com sucesso!"
                        : "Seu pagamento está sendo processado."}
                </p>
            </div>

            <div className="text-center">
                {result.invoiceUrl && (
                    <a
                        href={result.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-block"
                    >
                        Ver Comprovante
                    </a>
                )}
            </div>

            <div className="mt-4 text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${result.payment?.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${result.payment?.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                        }`}></div>
                    Status: {result.payment?.status === 'CONFIRMED' ? 'Confirmado' : 'Processando'}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 my-14 bg-gray-900 shadow-lg rounded-lg">
            <div className="text-center mb-8">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-500 mb-2">Pagamento Criado com Sucesso!</h2>
                <p className="text-white">Seu {paymentMethod === 'PIX' ? 'PIX' : paymentMethod === 'BOLETO' ? 'boleto' : 'pagamento com cartão'} foi gerado com sucesso</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Resumo do Pedido */}
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                        <h4 className="font-semibold text-white mb-4">Resumo do Pedido</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-white">
                                <span>Plano:</span>
                                <span className="font-semibold">{plano?.category_name}</span>
                            </div>
                            <div className="flex justify-between text-white">
                                <span>Valor Total:</span>
                                <span className="font-semibold text-green-400">
                                    R$ {orderValues.total.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-white text-sm">
                                <span>ID do Pagamento:</span>
                                <span className="font-mono">{result.payment?.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Informações de Contato */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Próximos Passos</h5>
                        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                            <li>Finalize o pagamento conforme as instruções</li>
                            <li>Você receberá a confirmação por e-mail</li>
                            <li>Em caso de dúvidas, entre em contato conosco</li>
                        </ul>
                    </div>
                </div>

                <div>
                    {/* Componente de Pagamento Específico */}
                    {paymentMethod === 'PIX' && renderPixPayment()}
                    {paymentMethod === 'BOLETO' && renderBoletoPayment()}
                    {paymentMethod === 'CREDIT_CARD' && renderCreditCardPayment()}
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onBack}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors mr-4"
                >
                    Voltar ao Início
                </button>

                {result.invoiceUrl && (
                    <a
                        href={result.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                    >
                        Ver Comprovante Completo
                    </a>
                )}
            </div>
        </div>
    );
}