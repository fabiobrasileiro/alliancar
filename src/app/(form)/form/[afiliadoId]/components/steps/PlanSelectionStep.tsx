import { useState } from "react";
import { InsurancePlan, VehicleInfo, OptionalService } from "./types";

interface PlanSelectionStepProps {
    onBack: () => void;
    onNext: () => void;
    selectedServices: string[];
    onServicesChange: (services: string[]) => void;
    plano: InsurancePlan | null;
    vehicleInfo: VehicleInfo;
}

export default function PlanSelectionStep({ 
    onBack, 
    onNext, 
    selectedServices, 
    onServicesChange,
    plano,
    vehicleInfo
}: PlanSelectionStepProps) {
    const [expandedService, setExpandedService] = useState<string | null>(null);

    const services: OptionalService[] = [
        { 
            id: "danos_terceiros", 
            name: "Danos a Terceiros", 
            price: 43.10, 
            included: false,
            description: "Cobertura ampliada para danos causados a terceiros em caso de acidente. Inclui proteção para veículos de terceiros e propriedades."
        },
        { 
            id: "assistencia_24h", 
            name: "Assistência 24h", 
            price: 32.10, 
            included: false,
            description: "Assistência completa 24 horas por dia, 7 dias por semana. Inclui reboque, chaveiro, pane seca e troca de pneus."
        },
        { 
            id: "vidros", 
            name: "Vidros", 
            price: 25.00, 
            included: false,
            description: "Cobertura especial para quebra de vidros, lanternas e retrovisores. Reparo ou substituição sem franquia."
        },
    ];

    const handleServiceToggle = (serviceId: string) => {
        const newServices = selectedServices.includes(serviceId)
            ? selectedServices.filter(id => id !== serviceId)
            : [...selectedServices, serviceId];
        
        onServicesChange(newServices);
    };

    const toggleServiceDetails = (serviceId: string) => {
        setExpandedService(expandedService === serviceId ? null : serviceId);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-600">
                    <h2 className="text-2xl font-bold text-white">
                        {plano?.category_name || 'PLANO ENCONTRADO'}
                    </h2>
                    <div className="text-right">
                        <div className="text-sm text-gray-300">Faixa: {plano?.vehicle_range}</div>
                        <div className="text-lg font-bold text-blue-400">
                            R$ {plano?.monthly_payment?.toFixed(2) || '0,00'}/mês
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-white mb-4 text-lg font-semibold">Coberturas incluídas no plano:</p>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center py-3 border-b border-gray-600">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="text-white font-medium">Roubo e Furto</span>
                            </div>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b border-gray-600">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="text-white font-medium">Colisão/Incêndio</span>
                            </div>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b border-gray-600">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="text-white font-medium">Carro Reserva 7 dias</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="border-t border-gray-600 pt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Serviços Opcionais</h3>
                    
                    <div className="space-y-3">
                        {services.map((service) => (
                            <div key={service.id} className="border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                                <div className="flex justify-between items-center">
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
                                            <span className="text-white block font-medium">{service.name}</span>
                                            <span className="text-blue-400 text-lg font-bold">+ R$ {service.price.toFixed(2)}/mês</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleServiceDetails(service.id)}
                                        className="text-white hover:text-blue-300 transition-transform p-1"
                                    >
                                        <svg 
                                            className={`w-6 h-6 transform transition-transform ${
                                                expandedService === service.id ? 'rotate-180' : ''
                                            }`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {expandedService === service.id && service.description && (
                                    <div className="mt-3 p-3 bg-gray-700 rounded text-gray-200 text-sm">
                                        {service.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                            💡 <strong>Atenção:</strong> O valor da mensalidade será cobrado apenas 30 dias após o pagamento da taxa de ativação.
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-600 transition-colors"
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold transition-colors"
                        >
                            Confirmar e Ir para Pagamento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}