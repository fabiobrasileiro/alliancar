import { useState, useEffect } from "react";
import { FormState, InsurancePlan } from "./types";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VehicleStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBack: () => void;
    onNext: () => void;
    onPlanoEncontrado: (plano: InsurancePlan | null) => void;
}

interface VehicleOption {
    brand: string;
    model: string;
    year: string;
}

export default function VehicleStep({ form, onChange, onBack, onNext, onPlanoEncontrado }: VehicleStepProps) {
    const [loadingPlano, setLoadingPlano] = useState(false);
    const [planoEncontrado, setPlanoEncontrado] = useState<InsurancePlan | null>(null);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<VehicleOption[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const mockVehicles: VehicleOption[] = [
            { brand: "Volkswagen", model: "GOL", year: "2023" },
            { brand: "Toyota", model: "COROLLA", year: "2023" },
            { brand: "Honda", model: "CIVIC", year: "2023" },
            { brand: "Fiat", model: "UNO", year: "2023" },
            { brand: "Chevrolet", model: "ONIX", year: "2023" },
            { brand: "Ford", model: "KA", year: "2023" },
            { brand: "Hyundai", model: "HB20", year: "2023" },
            { brand: "Renault", model: "KWID", year: "2023" },
        ];
        setVehicleOptions(mockVehicles);
        setFilteredVehicles(mockVehicles);
    }, []);

    const buscarPlanoPorModelo = async (modelo: string) => {
        if (!modelo || modelo.length < 3) return;
        
        setLoadingPlano(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockPlan: InsurancePlan = {
                id: "1",
                category_name: "PROTEÇÃO ESSENCIAL",
                vehicle_range: "Até R$ 50.000",
                adesao: 149.90,
                monthly_payment: 89.90,
                percentual_7_5: 7.5,
                percentual_70: 70,
                participation_min: "100",
                vehicles: ["GOL", "COROLLA", "CIVIC", "UNO", "ONIX", "KA", "HB20", "KWID"]
            };

            if (mockPlan.vehicles.some(vehicle => 
                vehicle.toLowerCase().includes(modelo.toLowerCase()) ||
                modelo.toLowerCase().includes(vehicle.toLowerCase())
            )) {
                setPlanoEncontrado(mockPlan);
                onPlanoEncontrado(mockPlan);
            } else {
                setPlanoEncontrado(null);
                onPlanoEncontrado(null);
            }
        } catch (error) {
            console.error('Erro ao buscar plano:', error);
            setPlanoEncontrado(null);
            onPlanoEncontrado(null);
        } finally {
            setLoadingPlano(false);
        }
    };

    const handleVehicleSelect = (vehicle: VehicleOption) => {
        const brandEvent = {
            target: {
                name: "brand",
                value: vehicle.brand
            }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(brandEvent);

        const modelEvent = {
            target: {
                name: "model",
                value: vehicle.model
            }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(modelEvent);

        const yearEvent = {
            target: {
                name: "year",
                value: vehicle.year
            }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(yearEvent);

        buscarPlanoPorModelo(vehicle.model);

        setShowVehicleModal(false);
        setSearchTerm("");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toUpperCase();
        setSearchTerm(term);
        
        const filtered = vehicleOptions.filter(vehicle => 
            vehicle.model.includes(term) || 
            vehicle.brand.toUpperCase().includes(term)
        );
        setFilteredVehicles(filtered);
    };

    const isFormValid = form.vehicleInfo.plate && 
                       form.vehicleInfo.brand && 
                       form.vehicleInfo.year && 
                       form.vehicleInfo.model && 
                       form.vehicleInfo.state && 
                       form.vehicleInfo.city &&
                       planoEncontrado;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informações do Veículo</h3>

            <input
                name="plate"
                placeholder="Placa (XXX0000)"
                value={form.vehicleInfo.plate}
                onChange={onChange}
                maxLength={7}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500 placeholder-gray-400"
                required
            />

            <button
                type="button"
                onClick={() => setShowVehicleModal(true)}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500 text-left hover:bg-gray-700 transition-colors"
            >
                {form.vehicleInfo.model ? 
                    `${form.vehicleInfo.brand} ${form.vehicleInfo.model} ${form.vehicleInfo.year}` : 
                    "Selecione o veículo"
                }
            </button>

            {showVehicleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 text-black">Selecione seu veículo</h3>
                        
                        <input
                            type="text"
                            placeholder="Buscar modelo ou marca..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-3 border rounded mb-4 text-black placeholder-gray-500"
                        />
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {filteredVehicles.map((vehicle, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleVehicleSelect(vehicle)}
                                    className="w-full p-3 text-left border rounded hover:bg-gray-100 text-black transition-colors"
                                >
                                    <div className="font-semibold">{vehicle.brand} {vehicle.model}</div>
                                    <div className="text-sm text-gray-600">Ano: {vehicle.year}</div>
                                </button>
                            ))}
                        </div>

                        {filteredVehicles.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                Nenhum veículo encontrado
                            </div>
                        )}

                        <button
                            onClick={() => setShowVehicleModal(false)}
                            className="w-full mt-4 p-3 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {loadingPlano && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">Buscando plano disponível...</p>
                </div>
            )}

            {planoEncontrado && !loadingPlano && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Plano Encontrado!</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Categoria:</strong> {planoEncontrado.category_name}</div>
                        <div><strong>Faixa:</strong> {planoEncontrado.vehicle_range}</div>
                        <div><strong>Taxa de Ativação:</strong> R$ {planoEncontrado.adesao?.toFixed(2)}</div>
                        <div><strong>Mensalidade:</strong> R$ {planoEncontrado.monthly_payment?.toFixed(2)}</div>
                    </div>
                </div>
            )}

            {form.vehicleInfo.model && !planoEncontrado && !loadingPlano && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Modelo não encontrado</h4>
                    <p className="text-yellow-700 text-sm">
                        Este modelo não está disponível em nossa lista atual. 
                        Entre em contato com nosso atendimento para mais informações.
                    </p>
                </div>
            )}

            <select
                name="state"
                value={form.vehicleInfo.state}
                onChange={onChange}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500"
                required
            >
                <option value="" className="text-gray-500">Selecione o estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AM">Amazonas</option>
                <option value="AP">Amapá</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
            </select>

            <input
                name="city"
                placeholder="Cidade"
                value={form.vehicleInfo.city}
                onChange={onChange}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500 placeholder-gray-400"
                required
            />

            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="isTaxiApp"
                    checked={form.vehicleInfo.isTaxiApp}
                    onChange={onChange}
                    className="mr-2"
                    id="taxiApp"
                />
                <label htmlFor="taxiApp" className="text-sm text-white">
                    Taxi/App (Uber, 99, etc)
                </label>
            </div>

            <div className="flex gap-3">
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
                    disabled={!isFormValid}
                    className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    Próximo
                </button>
            </div>
        </div>
    );
}