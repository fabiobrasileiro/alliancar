// components/PixPaymentDisplay.tsx
import { useState } from 'react';

interface PixPaymentDisplayProps {
    paymentData: {
        pixQrCode: string;
        pixPayload: string;
        pixExpirationDate: string;
        paymentId: string;
        invoiceUrl: string;
        summary: {
            total: number;
            plano: string;
        };
    };
    onBack: () => void;
}

export default function PixPaymentDisplay({ paymentData, onBack }: PixPaymentDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyPixCode = async () => {
        try {
            await navigator.clipboard.writeText(paymentData.pixPayload);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Falha ao copiar código PIX:', err);
        }
    };

    const formatExpirationDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-green-500 mb-2">Pagamento via PIX</h3>
                <p className="text-white">Escaneie o QR Code ou copie o código PIX para pagar</p>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-4">Resumo do Pedido</h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-white">
                        <span>Plano:</span>
                        <span className="font-semibold">{paymentData.summary.plano}</span>
                    </div>
                    <div className="flex justify-between text-white">
                        <span>Valor:</span>
                        <span className="font-semibold text-green-400">
                            R$ {paymentData.summary.total.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-white">
                        <span>Expira em:</span>
                        <span className="font-semibold text-yellow-400">
                            {formatExpirationDate(paymentData.pixExpirationDate)}
                        </span>
                    </div>
                </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-lg border-2 border-green-500">
                <div className="text-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">QR Code para Pagamento</h4>
                    <p className="text-gray-600 text-sm">Escaneie com seu app bancário</p>
                </div>
                
                <div className="flex justify-center">
                    <img 
                        src={`data:image/png;base64,${paymentData.pixQrCode}`}
                        alt="QR Code PIX"
                        className="w-64 h-64 border-2 border-gray-300 rounded-lg"
                    />
                </div>

                <div className="mt-4 text-center">
                    <p className="text-gray-600 text-sm mb-2">Não consegue escanear?</p>
                    <button
                        onClick={handleCopyPixCode}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold w-full max-w-xs"
                    >
                        {copied ? '✓ Código Copiado!' : 'Copiar Código PIX'}
                    </button>
                </div>
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2">Como pagar:</h5>
                <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                    <li>Abra o app do seu banco</li>
                    <li>Selecione a opção "Pagar com PIX"</li>
                    <li>Escaneie o QR Code ou cole o código copiado</li>
                    <li>Confirme o pagamento</li>
                    <li>O processo é instantâneo!</li>
                </ol>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-600 transition-colors"
                >
                    Voltar
                </button>
                <a
                    href={paymentData.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors text-center font-semibold"
                >
                    Ver Comprovante
                </a>
            </div>

            {/* Status */}
            <div className="text-center">
                <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Aguardando pagamento...
                </div>
            </div>
        </div>
    );
}