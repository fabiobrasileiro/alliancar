// // components/PlanSelectionStep.tsx
// 'use client';

// import { useState } from "react";
// import { InsurancePlanWithCategory, CalculatedCoverage } from '@/types/insurance';

// interface PlanSelectionStepProps {
//     onBack: () => void;
//     onNext: (selectionData: {
//         selectedPlan: InsurancePlanWithCategory | null;
//         selectedServices: string[];
//         coverages: CalculatedCoverage | null;
//         totalMonthly: number;
//     }) => void;
//     selectedPlan: InsurancePlanWithCategory | null;
//     coverages: CalculatedCoverage | null;
// }

// interface OptionalService {
//     id: string;
//     name: string;
//     price: number;
//     included: boolean;
//     conflicts?: string[];
//     tracker?: string;
// }

// export default function PlanSelectionStep({ 
//     onBack, 
//     onNext, 
//     selectedPlan,
//     coverages
// }: PlanSelectionStepProps) {
//     const [selectedServices, setSelectedServices] = useState<string[]>([]);

//     const services: OptionalService[] = [
//         { id: "38966", name: "Assistência 24H 500km", price: 32.10, included: false },
//         { id: "39000", name: "Danos a Terceiros 100 Mil", price: 43.10, included: false },
//         { id: "37208", name: "Colisão, Incêndio, Vidros, Lanterna e Carro Reserva 7 dias", price: 40.20, included: false },
//         { id: "38896", name: "Carro Reserva 15 dias (7 dias* + 8 dias adicionais)", price: 10.00, included: false },
//         { id: "38897", name: "Carro Reserva 30 dias (7 dias* + 23 dias adicionais)", price: 18.00, included: false },
//     ];

//     const handleServiceToggle = (serviceId: string) => {
//         const newServices = selectedServices.includes(serviceId)
//             ? selectedServices.filter(id => id !== serviceId)
//             : [...selectedServices, serviceId];
        
//         setSelectedServices(newServices);
//     };

//     const calculateOptionalTotal = () => {
//         return services
//             .filter(service => selectedServices.includes(service.id))
//             .reduce((total, service) => total + service.price, 0);
//     };

//     const calculateBaseTotal = () => {
//         if (!selectedPlan || !coverages) return 0;
        
//         return selectedPlan.monthly_payment + 
//                coverages.theft + 
//                coverages.collision + 
//                coverages.third_party + 
//                coverages.assistance + 
//                coverages.glass;
//     };

//     const handleConfirm = () => {
//         const baseTotal = calculateBaseTotal();
//         const optionalTotal = calculateOptionalTotal();
        
//         onNext({
//             selectedPlan,
//             selectedServices,
//             coverages,
//             totalMonthly: baseTotal + optionalTotal
//         });
//     };

//     if (!selectedPlan || !coverages) {
//         return (
//             <div className="text-center py-8">
//                 <p className="text-gray-600">Nenhum plano selecionado. Volte e selecione um plano.</p>
//                 <button
//                     onClick={onBack}
//                     className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//                 >
//                     Voltar para Seleção
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="bg-white border border-gray-200 rounded-lg p-6">
//                 {/* Cabeçalho do Plano Selecionado */}
//                 <div className="flex justify-between items-center mb-6 pb-4 border-b">
//                     <div>
//                         <h2 className="text-2xl font-bold text-gray-800">PLANO SELECIONADO</h2>
//                         <p className="text-gray-600 mt-1">
//                             {selectedPlan.vehicle_categories?.name} - {selectedPlan.vehicle_range}
//                         </p>
//                     </div>
//                     <div className="text-right">
//                         <div className="text-2xl font-bold text-blue-600">
//                             R$ {selectedPlan.monthly_payment.toFixed(2)}
//                         </div>
//                         <div className="text-sm text-gray-500">Mensalidade Base</div>
//                     </div>
//                 </div>

//                 {/* Coberturas Incluídas do Plano */}
//                 <div className="mb-8">
//                     <p className="text-gray-700 mb-4 text-lg font-semibold">Coberturas Incluídas:</p>
//                     <ul className="space-y-3">
//                         <li className="flex justify-between items-center py-3 border-b">
//                             <div className="flex items-center">
//                                 <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
//                                     <span className="text-white text-sm">✓</span>
//                                 </div>
//                                 <span className="text-gray-700 font-medium">Roubo e Furto (70%)</span>
//                             </div>
//                             <div className="text-right">
//                                 <div className="text-green-600 font-semibold">R$ {coverages.theft.toFixed(2)}</div>
//                                 <div className="text-xs text-gray-500">Incluído</div>
//                             </div>
//                         </li>
//                         <li className="flex justify-between items-center py-3 border-b">
//                             <div className="flex items-center">
//                                 <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
//                                     <span className="text-white text-sm">✓</span>
//                                 </div>
//                                 <span className="text-gray-700 font-medium">Colisão/Incêndio (7.5%)</span>
//                             </div>
//                             <div className="text-right">
//                                 <div className="text-green-600 font-semibold">R$ {coverages.collision.toFixed(2)}</div>
//                                 <div className="text-xs text-gray-500">Incluído</div>
//                             </div>
//                         </li>
//                         <li className="flex justify-between items-center py-3 border-b">
//                             <div className="flex items-center">
//                                 <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
//                                     <span className="text-white text-sm">✓</span>
//                                 </div>
//                                 <span className="text-gray-700 font-medium">Danos a Terceiros (7.5%)</span>
//                             </div>
//                             <div className="text-right">
//                                 <div className="text-green-600 font-semibold">R$ {coverages.third_party.toFixed(2)}</div>
//                                 <div className="text-xs text-gray-500">Incluído</div>
//                             </div>
//                         </li>
//                         <li className="flex justify-between items-center py-3 border-b">
//                             <div className="flex items-center">
//                                 <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
//                                     <span className="text-white text-sm">✓</span>
//                                 </div>
//                                 <span className="text-gray-700 font-medium">Assistência 24H (7.5%)</span>
//                             </div>
//                             <div className="text-right">
//                                 <div className="text-green-600 font-semibold">R$ {coverages.assistance.toFixed(2)}</div>
//                                 <div className="text-xs text-gray-500">Incluído</div>
//                             </div>
//                         </li>
//                         <li className="flex justify-between items-center py-3 border-b">
//                             <div className="flex items-center">
//                                 <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
//                                     <span className="text-white text-sm">✓</span>
//                                 </div>
//                                 <span className="text-gray-700 font-medium">Vidros (7.5%)</span>
//                             </div>
//                             <div className="text-right">
//                                 <div className="text-green-600 font-semibold">R$ {coverages.glass.toFixed(2)}</div>
//                                 <div className="text-xs text-gray-500">Incluído</div>
//                             </div>
//                         </li>
//                     </ul>

//                     {/* Total das Coberturas Base */}
//                     <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                         <div className="flex justify-between items-center text-lg">
//                             <span className="font-semibold text-gray-800">Total do Plano Base:</span>
//                             <span className="font-bold text-blue-600">
//                                 R$ {calculateBaseTotal().toFixed(2)}
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Serviços Opcionais */}
//                 <div className="border-t pt-6">
//                     <div className="flex justify-between items-center mb-6">
//                         <h3 className="text-xl font-bold text-gray-800">Serviços Opcionais</h3>
//                     </div>
                    
//                     <p className="text-gray-700 mb-6">Acrescente serviços opcionais ao seu plano</p>
                    
//                     <ul className="space-y-4 mb-6">
//                         {services.map((service) => (
//                             <li key={service.id} className="flex justify-between items-center py-4 border-b">
//                                 <div className="flex items-center space-x-4 flex-1">
//                                     <label className="relative inline-flex items-center cursor-pointer">
//                                         <input
//                                             type="checkbox"
//                                             checked={selectedServices.includes(service.id)}
//                                             onChange={() => handleServiceToggle(service.id)}
//                                             className="sr-only peer"
//                                         />
//                                         <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                                     </label>
//                                     <div className="flex-1">
//                                         <span className="text-gray-700 block font-medium">{service.name}</span>
//                                     </div>
//                                 </div>
//                                 <div className="text-right">
//                                     <strong className="text-gray-900 text-lg">R$ {service.price.toFixed(2)}</strong>
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>

//                     {/* Resumo Financeiro */}
//                     <div className="space-y-3 mb-6">
//                         {selectedServices.length > 0 && (
//                             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                                 <div className="flex justify-between items-center">
//                                     <span className="text-blue-800 font-semibold">Total dos serviços opcionais:</span>
//                                     <span className="text-blue-800 font-bold text-lg">R$ {calculateOptionalTotal().toFixed(2)}</span>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                             <div className="flex justify-between items-center text-lg">
//                                 <span className="text-green-800 font-bold">Total Mensal:</span>
//                                 <span className="text-green-800 font-bold text-xl">
//                                     R$ {(calculateBaseTotal() + calculateOptionalTotal()).toFixed(2)}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     <button
//                         type="button"
//                         onClick={handleConfirm}
//                         className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-semibold text-lg transition duration-200"
//                     >
//                         Confirmar e Ir para Pagamento
//                     </button>
//                 </div>
//             </div>

//             <div className="flex gap-3">
//                 <button
//                     type="button"
//                     onClick={onBack}
//                     className="flex-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-600 transition duration-200"
//                 >
//                     Voltar para Planos
//                 </button>
//             </div>
//         </div>
//     );
// }