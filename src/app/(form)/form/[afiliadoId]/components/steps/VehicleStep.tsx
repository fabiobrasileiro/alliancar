import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { FormState, InsurancePlan } from "./types";
import { createClient } from '@/utils/supabase/client'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Cliente será criado dentro das funções para evitar estado corrompido após inatividade
// (problema conhecido do Supabase: cliente singleton pode travar após 1-2min de inatividade)

const CACHE_KEY = "vehicle_options_cache_v1";
const CACHE_TTL_MS = 60 * 1000; // 60s
const FETCH_TIMEOUT_MS = 45 * 1000; // 45s — mais margem para rede lenta ou reentrada na página
const planCache = new Map<string, InsurancePlan | null>();

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), ms)
        ),
    ]);
}

interface VehicleCategory {
    id: string;
    name: string;
    description: string;
}

type VehicleOptionsCache = {
    timestamp: number;
    categories: VehicleCategory[];
    ranges: string[];
    inFlight: Promise<{ categories: VehicleCategory[]; ranges: string[] }> | null;
};

const vehicleOptionsCache: VehicleOptionsCache = {
    timestamp: 0,
    categories: [],
    ranges: [],
    inFlight: null
};

// Fallback quando Supabase falhar ou estourar timeout — usuário ainda consegue preencher
const FALLBACK_CATEGORIES: VehicleCategory[] = [
    { id: "9adf167c-b5e9-42c6-a62a-f2ada911a516", name: "VEICULO DE ENTRADA", description: "" }
];
const FALLBACK_RANGES = [
    "ATÉ R$ 20.000,00",
    "R$ 20.000,00 - R$ 30.000,00",
    "R$ 30.000,00 - R$ 40.000,00",
    "R$ 40.000,00 - R$ 50.000,00",
    "R$ 50.000,00 - R$ 60.000,00",
    "R$ 60.000,00 - R$ 70.000,00",
    "R$ 70.000,00 - R$ 80.000,00",
    "R$ 80.000,00 - R$ 90.000,00",
    "R$ 90.000,00 - R$ 100.000,00",
    "R$ 80.000,00 - R$ 100.000,00"
];

const readSessionCache = () => {
    if (typeof window === "undefined") return null;
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    try {
        const parsed = JSON.parse(cached) as {
            timestamp: number;
            categories?: VehicleCategory[];
            ranges?: Array<{ vehicle_range: string }>;
        };
        const ranges = [...new Set(
            (parsed.ranges || [])
                .map((plan) => plan.vehicle_range)
                .filter((range): range is string => typeof range === "string")
        )];
        return {
            timestamp: parsed.timestamp,
            categories: parsed.categories || [],
            ranges
        };
    } catch {
        return null;
    }
};

const writeSessionCache = (categories: VehicleCategory[], ranges: string[]) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
            timestamp: Date.now(),
            categories,
            ranges: ranges.map((range) => ({ vehicle_range: range }))
        })
    );
};

interface VehicleStepProps {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBack: () => void;
    onNext: () => void;
    onPlanoEncontrado: (plano: InsurancePlan | null) => void;
}

export default function VehicleStep({ form, onChange, onBack, onNext, onPlanoEncontrado }: VehicleStepProps) {
    const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
    const [fipeValues, setFipeValues] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [findingPlan, setFindingPlan] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        const applyOptions = (categories: VehicleCategory[], ranges: string[]) => {
            if (!isActive) return;
            setVehicleCategories(categories);
            setFipeValues(ranges);
            setLoadError(null);
            setLoading(false);
        };

        const fetchOptions = async () => {
            if (vehicleOptionsCache.inFlight) return vehicleOptionsCache.inFlight;

            vehicleOptionsCache.inFlight = (async () => {
                // Recria cliente para evitar estado corrompido após inatividade
                const supabaseClient = createClient();
                const [categoriesResult, plansResult] = await Promise.all([
                    supabaseClient.from("vehicle_categories").select("id, name, description").order("name"),
                    supabaseClient.from("insurance_plans").select("vehicle_range").order("vehicle_range")
                ]);

                if (categoriesResult.error) {
                    console.error("Erro ao buscar categorias:", categoriesResult.error);
                }

                if (plansResult.error) {
                    console.error("Erro ao buscar planos:", plansResult.error);
                }

                const categories = categoriesResult.data || [];
                const ranges = [...new Set((plansResult.data || []).map((plan) => plan.vehicle_range))];

                vehicleOptionsCache.timestamp = Date.now();
                vehicleOptionsCache.categories = categories;
                vehicleOptionsCache.ranges = ranges;
                writeSessionCache(categories, ranges);

                return { categories, ranges };
            })();

            try {
                return await vehicleOptionsCache.inFlight;
            } finally {
                vehicleOptionsCache.inFlight = null;
            }
        };

        const loadOptions = async () => {
            const now = Date.now();
            // Cache em memória: evita setLoading(true) e selects em "Carregando..." desnecessário
            if (vehicleOptionsCache.timestamp && now - vehicleOptionsCache.timestamp < CACHE_TTL_MS) {
                applyOptions(vehicleOptionsCache.categories, vehicleOptionsCache.ranges);
                return;
            }

            const sessionCache = readSessionCache();
            if (sessionCache && now - sessionCache.timestamp < CACHE_TTL_MS) {
                vehicleOptionsCache.timestamp = sessionCache.timestamp;
                vehicleOptionsCache.categories = sessionCache.categories;
                vehicleOptionsCache.ranges = sessionCache.ranges;
                applyOptions(sessionCache.categories, sessionCache.ranges);
                return;
            }

            setLoading(true);
            setLoadError(null);
            try {
                const data = await withTimeout(fetchOptions(), FETCH_TIMEOUT_MS);
                if (isActive) {
                    applyOptions(data.categories, data.ranges);
                }
            } catch (error) {
                if (isActive) {
                    console.error("Erro ao buscar dados:", error);
                    vehicleOptionsCache.inFlight = null;
                    // Usa fallback para o usuário conseguir preencher mesmo com timeout/rede falha
                    applyOptions(FALLBACK_CATEGORIES, FALLBACK_RANGES);
                    // Não seta loadError — usuário vê os selects com opções básicas e pode continuar
                }
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadOptions();

        return () => {
            isActive = false;
        };
    }, [retryCount]);

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

    const handleRetry = useCallback(() => {
        setLoadError(null);
        setLoading(true); // usuário vê "Carregando..." na hora
        vehicleOptionsCache.inFlight = null;
        setRetryCount((c) => c + 1);
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
            // Recria cliente para evitar estado corrompido após inatividade
            // (cliente singleton pode travar após 1-2min sem uso)
            const supabaseClient = createClient();
            const planPromise = supabaseClient
                .from('insurance_plans')
                .select('id, category_name, vehicle_range, adesao, monthly_payment, percentual_7_5, percentual_70, participation_min, vehicles')
                .eq('category_name', planCategoryName)
                .eq('vehicle_range', fipeRange)
                .limit(1);

            // PostgrestFilterBuilder é thenable mas não Promise nativa - precisa cast via unknown
            const result = await withTimeout(
                planPromise as unknown as Promise<{ data: InsurancePlan[] | null; error: unknown }>,
                FETCH_TIMEOUT_MS
            );
            const { data, error } = result;

            if (error) {
                console.error('Erro ao buscar plano:', error);
                planCache.set(cacheKey, null);
                onPlanoEncontrado(null);
                if (mountedRef.current) setFindingPlan(false);
                return;
            }

            const plan = data?.[0] ?? null;
            planCache.set(cacheKey, plan);
            onPlanoEncontrado(plan);

            if (!plan) {
                alert("Plano não encontrado para a categoria e faixa FIPE selecionadas.");
                if (mountedRef.current) setFindingPlan(false);
                return;
            }

            onNext();
        } catch (err) {
            console.error('Erro ao buscar plano:', err);
            onPlanoEncontrado(null);
            if (mountedRef.current) {
                setFindingPlan(false);
                const isTimeout = err instanceof Error && err.message === "timeout";
                const isAbortError = err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"));
                
                if (isTimeout || isAbortError) {
                    alert("A busca do plano demorou muito ou foi cancelada. Isso pode acontecer após ficar um tempo na página. Tente novamente.");
                } else {
                    console.error('Erro desconhecido ao buscar plano:', err);
                    alert("Erro ao buscar o plano. Tente recarregar a página ou verifique sua conexão.");
                }
            }
        } finally {
            if (mountedRef.current) setFindingPlan(false);
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

            {/* Categoria do carro e Valor FIPE — erro com retry ou conteúdo normal */}
            {loadError ? (
                <div className="space-y-2">
                    <label className="text-sm text-white">Categoria do carro</label>
                    <label className="text-sm text-white block mt-1">Valor do carro (FIPE)</label>
                    <div className="w-full p-3 border border-amber-600/50 bg-amber-900/20 text-amber-200 rounded flex flex-col gap-2">
                        <span>{loadError}</span>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="self-start px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                        >
                            Tentar de novo
                        </button>
                    </div>
                </div>
            ) : (
                <>
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
                </>
            )}

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
