import { useState, useEffect } from "react";
import { FormState, InsurancePlan } from "./types";
import { createClient } from '@supabase/supabase-js'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

interface VehicleCategory {
    id: string;
    name: string;
    description: string;
}

export default function VehicleStep({ form, onChange, onBack, onNext, onPlanoEncontrado }: VehicleStepProps) {
    const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
    const [fipeValues, setFipeValues] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscar categorias de veículos
                const { data: categories, error: categoriesError } = await supabase
                    .from('vehicle_categories')
                    .select('id, name, description')
                    .order('name');

                if (categoriesError) {
                    console.error('Erro ao buscar categorias:', categoriesError);
                } else {
                    setVehicleCategories(categories || []);
                }

                // Buscar valores FIPE únicos dos insurance_plans
                const { data: plans, error: plansError } = await supabase
                    .from('insurance_plans')
                    .select('vehicle_range')
                    .order('vehicle_range');

                if (plansError) {
                    console.error('Erro ao buscar planos:', plansError);
                } else {
                    // Obter valores únicos de vehicle_range
                    const uniqueRanges = [...new Set((plans || []).map(plan => plan.vehicle_range))];
                    setFipeValues(uniqueRanges);
                }
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Função auxiliar para criar eventos sintéticos para o onChange
    const createChangeEvent = (name: string, value: string | boolean) => {
        if (typeof value === 'boolean') {
            const event = {
                target: {
                    name: name,
                    value: String(value),
                    type: 'checkbox',
                    checked: value
                }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
        } else {
            const event = {
                target: {
                    name: name,
                    value: String(value),
                    type: 'text'
                }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
        }
    };

    const isFormValid = form.vehicleInfo.category && 
                       form.vehicleInfo.fipeValue && 
                       form.vehicleInfo.privateUse !== undefined;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Dados do Veículo</h3>

            {/* Categoria do carro */}
            <div className="space-y-2">
                <label className="text-sm text-white">Categoria do carro</label>
                {loading ? (
                    <div className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded">
                        Carregando...
                    </div>
                ) : (
                    <Select
                        value={form.vehicleInfo.category || ""}
                        onValueChange={(value) => createChangeEvent('category', value)}
                    >
                        <SelectTrigger className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500">
                            <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {vehicleCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Valor do carro (FIPE) */}
            <div className="space-y-2">
                <label className="text-sm text-white">Valor do carro (FIPE)</label>
                {loading ? (
                    <div className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded">
                        Carregando...
                    </div>
                ) : (
                    <Select
                        value={form.vehicleInfo.fipeValue || ""}
                        onValueChange={(value) => createChangeEvent('fipeValue', value)}
                    >
                        <SelectTrigger className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500">
                            <SelectValue placeholder="Selecione o valor FIPE" />
                        </SelectTrigger>
                        <SelectContent>
                            {fipeValues.map((range, index) => (
                                <SelectItem key={index} value={range}>
                                    {range}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Uso particular */}
            <div className="space-y-2">
                <label className="text-sm text-white">Uso particular</label>
                <Select
                    value={form.vehicleInfo.privateUse === true ? "sim" : form.vehicleInfo.privateUse === false ? "nao" : ""}
                    onValueChange={(value) => createChangeEvent('privateUse', value === "sim")}
                >
                    <SelectTrigger className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:border-blue-500">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                </Select>
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
                    Avançar
                </button>
            </div>
        </div>
    );
}
