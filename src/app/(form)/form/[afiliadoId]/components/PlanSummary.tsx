interface PlanSummaryProps {
    orderValues: {
        monthly: number;
        membership: number;
        installation: number;
        services: number;
        subtotal: number;
        total: number;
    };
    coupon: string;
    discount: number;
    totalWithDiscount: number;
    selectedServices: string[];
    optionalServices: any[];
    onCouponChange: (coupon: string) => void;
    onCouponApply: () => void;
    onCouponRemove: () => void;
    plano: any;
}

export default function PlanSummary({
    orderValues,
    coupon,
    discount,
    totalWithDiscount,
    selectedServices,
    optionalServices,
    onCouponChange,
    onCouponApply,
    onCouponRemove,
    plano
}: PlanSummaryProps) {
    return (
        <div className="bg-bg p-6 rounded-lg border ">
            <h3 className="text-lg font-semibold mb-4">Resumo do Plano</h3>
            
            {plano && (
                <div className="mb-4 p-3 bg-gbblue-50 rounded border">
                    <h4 className="font-semibold text-a1">{plano.category_name}</h4>
                    <p className="text-sm text-a2">{plano.vehicle_range}</p>
                    <p className="text-lg font-bold text-a1 mt-2">
                        R$ {plano.monthly_payment}/mês
                    </p>
                </div>
            )}

            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-white">
                    <span>Adesão:</span>
                    <span>R$ {orderValues.membership.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                    <span>1ª Mensalidade:</span>
                    <span>R$ {orderValues.monthly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                    <span>Instalação:</span>
                    <span>R$ {orderValues.installation.toFixed(2)}</span>
                </div>
                
                {orderValues.services > 0 && (
                    <div className="flex justify-between text-white border-t pt-2">
                        <span>Serviços opcionais:</span>
                        <span>R$ {orderValues.services.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between text-white border-t pt-2 font-semibold">
                    <span>Subtotal:</span>
                    <span>R$ {orderValues.subtotal.toFixed(2)}</span>
                </div>
            </div>

            {discount > 0 && (
                <div className="flex justify-between  text-green-600 mb-2">
                    <span>Desconto:</span>
                    <span>-R$ {discount.toFixed(2)}</span>
                </div>
            )}

            <div className="border-t pt-3 mb-4">
                <div className="flex justify-between text-white font-semibold text-lg">
                    <span>Total:</span>
                    <span>R$ {totalWithDiscount.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Cupom de desconto"
                        value={coupon}
                        onChange={(e) => onCouponChange(e.target.value)}
                        className="flex-1 p-2 border rounded text-sm placeholder-white"
                    />
                    {discount === 0 ? (
                        <button
                            onClick={onCouponApply}
                            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                        >
                            Aplicar
                        </button>
                    ) : (
                        <button
                            onClick={onCouponRemove}
                            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                        >
                            Remover
                        </button>
                    )}
                </div>
                {discount > 0 && (
                    <p className="text-green-600 text-sm">Cupom aplicado com sucesso!</p>
                )}
            </div>

            {selectedServices.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Serviços selecionados:</h4>
                    <ul className="space-y-1 text-sm">
                        {optionalServices
                            .filter(service => selectedServices.includes(service.id))
                            .map(service => (
                                <li key={service.id} className="flex justify-between text-white">
                                    <span>{service.name}</span>
                                    <span>R$ {service.price.toFixed(2)}</span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
}