import { useState } from "react";

interface OptionalService {
    id: string;
    name: string;
    price: number;
    included: boolean;
    conflicts?: string[];
    tracker?: string;
}

interface PlanSelectionStepProps {
    onBack: () => void;
    onNext: () => void;
    selectedServices: string[];
    onServicesChange: (services: string[]) => void;
    plano: any;
}

export default function PlanSelectionStep({ 
    onBack, 
    onNext, 
    selectedServices, 
    onServicesChange,
    plano 
}: PlanSelectionStepProps) {
    const [services, setServices] = useState<OptionalService[]>([
        { id: "38966", name: "Assistência 24H 500km", price: 32.10, included: false },
        { id: "39000", name: "Danos a Terceiros 100 Mil", price: 43.10, included: false },
        { id: "37208", name: "Colisão, Incêndio, Vidros, Lanterna e Carro Reserva 7 dias", price: 40.20, included: false },
        { id: "38896", name: "Carro Reserva 15 dias (7 dias* + 8 dias adicionais)", price: 10.00, included: false },
        { id: "38897", name: "Carro Reserva 30 dias (7 dias* + 23 dias adicionais)", price: 18.00, included: false },
    ]);

    const handleServiceToggle = (serviceId: string) => {
        const newServices = selectedServices.includes(serviceId)
            ? selectedServices.filter(id => id !== serviceId)
            : [...selectedServices, serviceId];
        
        onServicesChange(newServices);
    };

    const calculateTotal = () => {
        return services
            .filter(service => selectedServices.includes(service.id))
            .reduce((total, service) => total + service.price, 0);
    };

    const calcularCoberturas = () => {
        if (!plano) return {};
        
        return {
            rouboFurto: plano.monthly_payment * (plano.percentual_70 || 0.7),
            colisaoIncendio: plano.monthly_payment * (plano.percentual_7_5 || 0.075),
            danosTerceiros: plano.monthly_payment * (plano.percentual_7_5 || 0.075),
            assistencia: plano.monthly_payment * (plano.percentual_7_5 || 0.075),
            vidros: plano.monthly_payment * (plano.percentual_7_5 || 0.075)
        };
    };

    const coberturas = calcularCoberturas();

    return (
        <div className="space-y-6">
            <div className="bg-bg border rounded-lg p-6">
                {/* Cabeçalho do Plano */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-a1">
                        {plano?.category_name || 'PLANO ENCONTRADO'}
                    </h2>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Faixa: {plano?.vehicle_range}</div>
                        <div className="text-lg font-bold text-a1">
                            R$ {plano?.monthly_payment || '0,00'}/mês
                        </div>
                    </div>
                </div>

                {/* Serviços Incluídos */}
                <div className="mb-8">
                    <p className="text-white mb-4 text-lg">Coberturas do plano:</p>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center py-3 border-b">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-a2 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="text-white font-medium">Roubo e Furto</span>
                            </div>
                            <div className="text-a2 font-semibold">
                                R$ {coberturas.rouboFurto?.toFixed(2) || '0,00'}
                            </div>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-a2 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="text-white font-medium">Colisão/Incêndio</span>
                            </div>
                            <div className="text-a2 font-semibold">
                                R$ {coberturas.colisaoIncendio?.toFixed(2) || '0,00'}
                            </div>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-a2 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="text-white font-medium">Danos a Terceiros</span>
                            </div>
                            <div className="text-a2 font-semibold">
                                R$ {coberturas.danosTerceiros?.toFixed(2) || '0,00'}
                            </div>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-a2 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="text-white font-medium">Assistência 24H</span>
                            </div>
                            <div className="text-a2 font-semibold">
                                R$ {coberturas.assistencia?.toFixed(2) || '0,00'}
                            </div>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-a2 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="text-white font-medium">Vidros</span>
                            </div>
                            <div className="text-a2 font-semibold">
                                R$ {coberturas.vidros?.toFixed(2) || '0,00'}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Serviços Opcionais */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Serviços Opcionais</h3>
                    </div>
                    
                    <p className="text-white mb-6">Acrescente serviços opcionais ao seu plano</p>
                    
                    <ul className="space-y-4 mb-6">
                        {services.map((service) => (
                            <li key={service.id} className="flex justify-between items-center py-4 border-b">
                                <div className="flex items-center space-x-4 flex-1">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedServices.includes(service.id)}
                                            onChange={() => handleServiceToggle(service.id)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                    <div className="flex-1">
                                        <span className="text-white block">{service.name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <strong className="text-white text-lg">R$ {service.price.toFixed(2)}</strong>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Total dos Opcionais */}
                    {selectedServices.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-a1 font-semibold">Total dos serviços opcionais:</span>
                                <span className="text-a1 font-bold text-lg">R$ {calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onNext}
                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-semibold text-lg"
                    >
                        Confirmar e Ir para Pagamento
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-600"
                >
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
                >
                    Próximo
                </button>
            </div>
        </div>
    );
}