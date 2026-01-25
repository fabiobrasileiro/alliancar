import { useMemo, useCallback, useEffect, useState } from "react";
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

const CACHE_KEY = "vehicle_options_cache_v1";
const CACHE_TTL_MS = 60 * 1000; // 60s
const planCache = new Map<string, InsurancePlan | null>();

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
    const [findingPlan, setFindingPlan] = useState(false);

    useEffect(() => {
        const fetchData = async (isBackground = false) => {
            try {
                if (!isBackground) setLoading(true);

                const [categoriesResult, plansResult] = await Promise.all([
                    supabase.from('vehicle_categories').select('id, name, description').order('name'),
                    supabase.from('insurance_plans').select('vehicle_range').order('vehicle_range'),
                ]);

                if (categoriesResult.error) {
                    console.error('Erro ao buscar categorias:', categoriesResult.error);
                } else {
                    setVehicleCategories(categoriesResult.data || []);
                }

                if (plansResult.error) {
                    console.error('Erro ao buscar planos:', plansResult.error);
                } else {
                    const uniqueRanges = [...new Set((plansResult.data || []).map(plan => plan.vehicle_range))];
                    setFipeValues(uniqueRanges);
                }

                if (typeof window !== "undefined") {
                    sessionStorage.setItem(
                        CACHE_KEY,
                        JSON.stringify({
                            timestamp: Date.now(),
                            categories: categoriesResult.data || [],
                            ranges: plansResult.data || [],
                        })
                    );
                }
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                if (!isBackground) setLoading(false);
            }
        };

        if (typeof window !== "undefined") {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached) as {
                        timestamp: number;
                        categories?: VehicleCategory[];
                        ranges?: Array<{ vehicle_range: string }>;
                    };
                    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
                        setVehicleCategories(parsed.categories || []);
                        const uniqueRanges = [...new Set(
                            (parsed.ranges || [])
                                .map((plan) => plan.vehicle_range)
                                .filter((range): range is string => typeof range === 'string')
                        )];
                        setFipeValues(uniqueRanges);
                        setLoading(false);
                        // revalidate em background
                        fetchData(true);
                        return;
                    }
                } catch {
                    // fallback para fetch normal
                }
            }
        }

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

    const isFormValid = useMemo(() => (
        form.vehicleInfo.category &&
        form.vehicleInfo.fipeValue &&
        form.vehicleInfo.privateUse !== undefined
    ), [form.vehicleInfo.category, form.vehicleInfo.fipeValue, form.vehicleInfo.privateUse]);

    const mapCategoryToPlanName = useCallback((categoryName?: string) => {
        if (!categoryName) return null;
        const normalized = categoryName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/^VEICULO\s+/i, "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_");

        if (normalized.includes("ENTRADA")) return "ENTRADA";
        if (normalized.includes("ESPECIAL_I")) return "ESPECIAL_I";
        if (normalized.includes("ESPECIAL_II")) return "ESPECIAL_II";
        if (normalized.includes("UTILITARIO")) return "UTILITARIO";
        return normalized;
    }, []);

    const handleNextWithPlan = useCallback(async () => {
        if (!isFormValid) return;

        const selectedCategory = vehicleCategories.find((cat) => cat.id === form.vehicleInfo.category);
        const planCategoryName = mapCategoryToPlanName(selectedCategory?.name);
        const fipeRange = form.vehicleInfo.fipeValue;

        if (!planCategoryName || !fipeRange) {
            onPlanoEncontrado(null);
            onNext();
            return;
        }

        const cacheKey = `${planCategoryName}|${fipeRange}`;
        if (planCache.has(cacheKey)) {
            onPlanoEncontrado(planCache.get(cacheKey) || null);
            onNext();
            return;
        }

        setFindingPlan(true);
        try {
            const { data, error } = await supabase
                .from('insurance_plans')
                .select('id, category_name, vehicle_range, adesao, monthly_payment, percentual_7_5, percentual_70, participation_min, vehicles')
                .eq('category_name', planCategoryName)
                .eq('vehicle_range', fipeRange)
                .limit(1);

            if (error) {
                console.error('Erro ao buscar plano:', error);
                planCache.set(cacheKey, null);
                onPlanoEncontrado(null);
                return;
            }

            const plan = data?.[0] ?? null;
            planCache.set(cacheKey, plan);
            onPlanoEncontrado(plan);

            if (!plan) {
                alert("Plano não encontrado para a categoria e faixa FIPE selecionadas.");
                return;
            }

            onNext();
        } catch (error) {
            console.error('Erro ao buscar plano:', error);
            onPlanoEncontrado(null);
        } finally {
            setFindingPlan(false);
        }
    }, [
        form.vehicleInfo.category,
        form.vehicleInfo.fipeValue,
        isFormValid,
        mapCategoryToPlanName,
        onNext,
        onPlanoEncontrado,
        vehicleCategories,
    ]);

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
                    onClick={handleNextWithPlan}
                    disabled={!isFormValid || findingPlan}
                    className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    {findingPlan ? "Buscando plano..." : "Avançar"}
                </button>
            </div>
        </div>
    );
}
