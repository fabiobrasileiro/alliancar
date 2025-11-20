"use client";

interface PixPaymentModalProps {
    pixData: {
        qrCode: string;
        payload: string;
        expirationDate: string;
        invoiceUrl?: string;
    };
    onClose: () => void;
}

export default function PixPaymentModal({ pixData, onClose }: PixPaymentModalProps) {
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(pixData.payload);
            alert("Código PIX copiado para a área de transferência!");
        } catch (err) {
            console.error('Falha ao copiar: ', err);
        }
    };

    // Extrair valor do payload PIX
    const getPixValue = () => {
        try {
            const valorParam = pixData.payload.split('&').find(param => param.includes('valor'));
            if (valorParam) {
                const valor = valorParam.split('=')[1];
                return parseFloat(valor).toFixed(2);
            }
        } catch (error) {
            console.error("Erro ao extrair valor:", error);
        }
        return "193.00";
    };

    // Abrir página do Asaas
    const openAsaasPage = () => {
        // Usa a invoiceUrl do pagamento ou fallback
        const asaasUrl = pixData.invoiceUrl || `https://sandbox.asaas.com/i/${pixData.payload.split('&')[0]}`;
        window.open(asaasUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-green-600 mb-4 text-center">Pagamento via PIX</h3>
                
                {/* Valor */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-sm text-green-700 mb-1">Valor a pagar</p>
                    <p className="text-3xl font-bold text-green-800">R$ {getPixValue()}</p>
                </div>

                {/* Botão Principal - Abrir no Asaas */}
                <div className="mb-6 text-center">
                    <button
                        onClick={openAsaasPage}
                        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
                    >
                        🌐 ABRIR PAGAMENTO PIX
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                        Clique para abrir a página de pagamento no Asaas
                    </p>
                </div>

                {/* Código PIX como alternativa */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        📋 Código PIX Alternativo
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={pixData.payload}
                            readOnly
                            className="flex-1 p-3 border border-gray-300 rounded text-sm text-gray-800 bg-gray-50 font-mono"
                            onClick={(e) => e.currentTarget.select()}
                        />
                        <button
                            onClick={copyToClipboard}
                            className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 whitespace-nowrap"
                        >
                            Copiar
                        </button>
                    </div>
                </div>

                {/* Informações */}
                <div className="space-y-3 mb-6">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-blue-800 text-sm">
                            <strong>💡 Como pagar:</strong><br/>
                            1. Clique em "ABRIR PAGAMENTO PIX" acima<br/>
                            2. A página do Asaas abrirá com o QR Code<br/>
                            3. Escaneie com seu app de banco
                        </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-800 text-sm">
                            <strong>⏰ Expira em:</strong><br/>
                            {new Date(pixData.expirationDate).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    className="w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition-colors font-medium"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}