interface OrderSummaryProps {
    orderValues: {
        monthly: number;
        membership: number;
        installation: number;
        total: number;
    };
    coupon: string;
    discount: number;
    totalWithDiscount: number;
    onCouponChange: (coupon: string) => void;
    onCouponApply: () => void;
    onCouponRemove: () => void;
}

export default function OrderSummary({
    orderValues,
    coupon,
    discount,
    totalWithDiscount,
    onCouponChange,
    onCouponApply,
    onCouponRemove
}: OrderSummaryProps) {
    return (
        <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <img
                        src="https://resources.powercrm.com.br/assets/external/images/chave_de_cadeia.png"
                        alt="Cadeado"
                        className="w-6 h-6"
                    />
                    <span className="font-semibold text-gray-800">Compra 100% segura</span>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4 text-center">
                    <p className="text-sm text-yellow-800">
                        Efetue agora o pagamento da sua adesão. Sua mensalidade será cobrada apenas no próximo mês via boleto bancário
                    </p>
                </div>

                <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-gray-700 mb-2">
                        Falta pouco para o seu veículo: <span className="text-blue-600 font-medium">GM - Chevrolet ONIX HATCH EFFECT 1.4 8V F.Power 5p Mec., 2017</span> avaliado em <span className="text-green-600 font-medium">R$ 52.484,00</span> ficar protegido!
                    </p>
                    <p className="text-sm text-gray-700">
                        Plano: <span className="text-blue-600 font-medium">OFERTA ESPECIAL</span>
                        <small className="block text-xs text-gray-500 mt-1">*De acordo com a tabela FIPE do mês atual</small>
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cupom de desconto
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={coupon}
                                onChange={(e) => onCouponChange(e.target.value)}
                                placeholder="Digite o cupom"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 pr-8"
                                maxLength={32}
                            />
                            {coupon && (
                                <button
                                    type="button"
                                    onClick={onCouponRemove}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onCouponApply}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Aplicar
                        </button>
                    </div>
                    {discount > 0 && (
                        <div className="text-green-600 text-sm mt-2">
                            Cupom aplicado! Desconto de R$ {discount.toFixed(2)}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">Mensalidade:</span>
                        <span className="text-green-600 font-semibold">R$ {orderValues.monthly.toFixed(2)}</span>
                    </div>

                    <div className="border-t pt-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700 text-sm">Taxa única de adesão:</span>
                            <span className="text-gray-700">R$ {orderValues.membership.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-sm">Taxa de Instalação:</span>
                            <span className="text-gray-700">R$ {orderValues.installation.toFixed(2)}</span>
                        </div>
                    </div>

                    {discount > 0 && (
                        <div className="flex justify-between items-center text-red-600">
                            <span>Desconto:</span>
                            <span>- R$ {discount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="border-t pt-3">
                        <div className="flex justify-between items-center font-semibold">
                            <span className="text-gray-800">Total a Pagar:</span>
                            <span className="text-green-600 text-lg">R$ {totalWithDiscount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                    <img
                        src="https://resources.powercrm.com.br/assets/external/images/cartoes.png"
                        alt="Formas de pagamento"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}