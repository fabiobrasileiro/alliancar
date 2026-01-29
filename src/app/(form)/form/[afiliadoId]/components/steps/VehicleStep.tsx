import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { FormState, InsurancePlan } from "./types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Categorias/faixas via REST + fetch + AbortController (timeout cancela a requisição de verdade)

const CACHE_KEY = "vehicle_options_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10min — categorias mudam pouco, reduz chamadas ao Supabase
const FETCH_TIMEOUT_MS = 15 * 1000; // 15s — aborta requisição e usa cache/fallback
const planCache = new Map<string, InsurancePlan | null>();

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

// Inicializa cache em memória do localStorage quando o módulo carregar (apenas no browser)
if (typeof window !== "undefined") {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            const parsed = JSON.parse(cached) as {
                timestamp: number;
                categories?: VehicleCategory[];
                ranges?: Array<{ vehicle_range: string }>;
            };
            const now = Date.now();
            // Só usa se não estiver expirado
            if (parsed.timestamp && now - parsed.timestamp < CACHE_TTL_MS) {
                const ranges = [...new Set(
                    (parsed.ranges || [])
                        .map((plan) => plan.vehicle_range)
                        .filter((range): range is string => typeof range === "string")
                )];
                vehicleOptionsCache.timestamp = parsed.timestamp;
                vehicleOptionsCache.categories = parsed.categories || [];
                vehicleOptionsCache.ranges = ranges;
            }
        } catch {
            // Ignora erros de parse na inicialização
        }
    }
}

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
    // Usa localStorage em vez de sessionStorage para persistir entre navegações
    const cached = localStorage.getItem(CACHE_KEY);
    
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'vehicle-step',
            hypothesisId: 'H2',
            location: 'VehicleStep.tsx:readSessionCache',
            message: 'readSessionCache called',
            data: {
                hasCached: !!cached,
                cachedLength: cached?.length || 0,
            },
            timestamp: Date.now(),
        }),
    }).catch(() => { });
    // #endregion
    
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
        const result = {
            timestamp: parsed.timestamp,
            categories: parsed.categories || [],
            ranges
        };
        
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'debug-session',
                runId: 'vehicle-step',
                hypothesisId: 'H2',
                location: 'VehicleStep.tsx:readSessionCache',
                message: 'readSessionCache parsed',
                data: {
                    timestamp: result.timestamp,
                    categoriesCount: result.categories.length,
                    rangesCount: result.ranges.length,
                    ageMs: Date.now() - result.timestamp,
                },
                timestamp: Date.now(),
            }),
        }).catch(() => { });
        // #endregion
        
        return result;
    } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'debug-session',
                runId: 'vehicle-step',
                hypothesisId: 'H2',
                location: 'VehicleStep.tsx:readSessionCache',
                message: 'readSessionCache parse error',
                data: {
                    error: err instanceof Error ? err.message : String(err),
                },
                timestamp: Date.now(),
            }),
        }).catch(() => { });
        // #endregion
        return null;
    }
};

const writeSessionCache = (categories: VehicleCategory[], ranges: string[]) => {
    if (typeof window === "undefined") return;
    const timestamp = Date.now();
    const data = {
        timestamp,
        categories,
        ranges: ranges.map((range) => ({ vehicle_range: range }))
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'vehicle-step',
            hypothesisId: 'H2',
            location: 'VehicleStep.tsx:writeSessionCache',
            message: 'writeSessionCache called',
            data: {
                timestamp,
                categoriesCount: categories.length,
                rangesCount: ranges.length,
            },
            timestamp: Date.now(),
        }),
    }).catch(() => { });
    // #endregion
    
    // Usa localStorage em vez de sessionStorage para persistir entre navegações
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
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
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'debug-session',
                    runId: 'vehicle-step',
                    hypothesisId: 'H5',
                    location: 'VehicleStep.tsx:136',
                    message: 'applyOptions called',
                    data: {
                        categoriesCount: categories.length,
                        rangesCount: ranges.length,
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => { });
            // #endregion
        };

        const fetchOptions = async (): Promise<{ categories: VehicleCategory[]; ranges: string[] }> => {
            if (vehicleOptionsCache.inFlight) return vehicleOptionsCache.inFlight;

            const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            const headers: HeadersInit = {
                apikey: anonKey ?? "",
                Authorization: `Bearer ${anonKey}`,
                Accept: "application/json",
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            const doFetch = async () => {
                const categoriesUrl = new URL(`${baseUrl}/rest/v1/vehicle_categories`);
                categoriesUrl.searchParams.set("select", "id,name,description");
                categoriesUrl.searchParams.set("order", "name.asc");

                const plansUrl = new URL(`${baseUrl}/rest/v1/insurance_plans`);
                plansUrl.searchParams.set("select", "vehicle_range");
                plansUrl.searchParams.set("order", "vehicle_range.asc");

                const [categoriesRes, plansRes] = await Promise.all([
                    fetch(categoriesUrl.toString(), { method: "GET", headers, signal: controller.signal }),
                    fetch(plansUrl.toString(), { method: "GET", headers, signal: controller.signal }),
                ]).finally(() => clearTimeout(timeoutId));

                if (!categoriesRes.ok) {
                    console.error("Erro ao buscar categorias:", categoriesRes.status, await categoriesRes.text());
                }
                if (!plansRes.ok) {
                    console.error("Erro ao buscar planos:", plansRes.status, await plansRes.text());
                }

                const categoriesData = (await categoriesRes.json()) as VehicleCategory[] | null;
                const plansData = (await plansRes.json()) as { vehicle_range: string }[] | null;
                const categories = categoriesData ?? [];
                const ranges = [...new Set((plansData ?? []).map((p) => p.vehicle_range))];

                return { categories, ranges };
            };

            vehicleOptionsCache.inFlight = doFetch();

            try {
                const result = await vehicleOptionsCache.inFlight;
                vehicleOptionsCache.timestamp = Date.now();
                vehicleOptionsCache.categories = result.categories;
                vehicleOptionsCache.ranges = result.ranges;
                writeSessionCache(result.categories, result.ranges);
                return result;
            } finally {
                vehicleOptionsCache.inFlight = null;
            }
        };

        const loadOptions = async () => {
            const now = Date.now();

            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'debug-session',
                    runId: 'vehicle-step',
                    hypothesisId: 'H1',
                    location: 'VehicleStep.tsx:177',
                    message: 'loadOptions start',
                    data: {
                        retryCount,
                        cacheTimestamp: vehicleOptionsCache.timestamp,
                        now,
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => { });
            // #endregion
            // Cache em memória: evita setLoading(true) e selects em "Carregando..." desnecessário
            if (vehicleOptionsCache.timestamp && now - vehicleOptionsCache.timestamp < CACHE_TTL_MS) {
                // #region agent log
                fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: 'debug-session',
                        runId: 'vehicle-step',
                        hypothesisId: 'H1',
                        location: 'VehicleStep.tsx:184',
                        message: 'loadOptions using memory cache',
                        data: {
                            categoriesCount: vehicleOptionsCache.categories.length,
                            rangesCount: vehicleOptionsCache.ranges.length,
                        },
                        timestamp: Date.now(),
                    }),
                }).catch(() => { });
                // #endregion
                applyOptions(vehicleOptionsCache.categories, vehicleOptionsCache.ranges);
                return;
            }

            const sessionCache = readSessionCache();
            
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'debug-session',
                    runId: 'vehicle-step',
                    hypothesisId: 'H2',
                    location: 'VehicleStep.tsx:276',
                    message: 'loadOptions checking sessionCache',
                    data: {
                        hasSessionCache: !!sessionCache,
                        sessionCacheTimestamp: sessionCache?.timestamp || 0,
                        ageMs: sessionCache ? now - sessionCache.timestamp : 0,
                        cacheTTL: CACHE_TTL_MS,
                        isExpired: sessionCache ? (now - sessionCache.timestamp >= CACHE_TTL_MS) : true,
                        categoriesCount: sessionCache?.categories.length || 0,
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => { });
            // #endregion
            
            if (sessionCache && now - sessionCache.timestamp < CACHE_TTL_MS) {
                vehicleOptionsCache.timestamp = sessionCache.timestamp;
                vehicleOptionsCache.categories = sessionCache.categories;
                vehicleOptionsCache.ranges = sessionCache.ranges;

                // #region agent log
                fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: 'debug-session',
                        runId: 'vehicle-step',
                        hypothesisId: 'H1',
                        location: 'VehicleStep.tsx:196',
                        message: 'loadOptions using session cache',
                        data: {
                            categoriesCount: sessionCache.categories.length,
                            rangesCount: sessionCache.ranges.length,
                        },
                        timestamp: Date.now(),
                    }),
                }).catch(() => { });
                // #endregion
                applyOptions(sessionCache.categories, sessionCache.ranges);
                return;
            }

            setLoading(true);
            setLoadError(null);
            try {
                // #region agent log
                fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: 'debug-session',
                        runId: 'vehicle-step',
                        hypothesisId: 'H2',
                        location: 'VehicleStep.tsx:211',
                        message: 'loadOptions fetching from Supabase',
                        data: {},
                        timestamp: Date.now(),
                    }),
                }).catch(() => { });
                // #endregion
                const data = await fetchOptions();
                if (isActive) {
                    applyOptions(data.categories, data.ranges);
                }
            } catch (error) {
                if (isActive) {
                    console.error("Erro ao buscar dados:", error);
                    vehicleOptionsCache.inFlight = null;
                    // #region agent log
                    fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId: 'debug-session',
                            runId: 'vehicle-step',
                            hypothesisId: 'H2',
                            location: 'VehicleStep.tsx:224',
                            message: 'loadOptions error',
                            data: {
                                errorMessage: error instanceof Error ? error.message : String(error),
                            },
                            timestamp: Date.now(),
                        }),
                    }).catch(() => { });
                    // #endregion

                    // Se temos cache antigo (mesmo expirado), é melhor mostrar os dados reais
                    // do que cair para o fallback mínimo com 1 categoria.
                    if (sessionCache && sessionCache.categories.length > 0) {
                        // #region agent log
                        fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                sessionId: 'debug-session',
                                runId: 'vehicle-step',
                                hypothesisId: 'H2',
                                location: 'VehicleStep.tsx:loadOptions:staleCache',
                                message: 'loadOptions using stale session cache after error',
                                data: {
                                    categoriesCount: sessionCache.categories.length,
                                    rangesCount: sessionCache.ranges.length,
                                },
                                timestamp: Date.now(),
                            }),
                        }).catch(() => { });
                        // #endregion

                        applyOptions(sessionCache.categories, sessionCache.ranges);
                    } else {
                        // Usa fallback mínimo apenas se nunca conseguimos carregar dados reais
                        applyOptions(FALLBACK_CATEGORIES, FALLBACK_RANGES);
                    }
                    // Não seta loadError — usuário vê os selects com opções e pode continuar
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
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'debug-session',
                runId: 'vehicle-step',
                hypothesisId: 'H4',
                location: 'VehicleStep.tsx:274',
                message: 'handleRetry clicked',
                data: {},
                timestamp: Date.now(),
            }),
        }).catch(() => { });
        // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'debug-session',
                    runId: 'vehicle-step',
                    hypothesisId: 'H6',
                    location: 'VehicleStep.tsx:planSearch:start',
                    message: 'handleNextWithPlan start',
                    data: {
                        planCategoryName,
                        fipeRange,
                        cacheKey,
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => { });
            // #endregion

            const startTime = Date.now();

            // Usa REST API diretamente para evitar qualquer problema de cliente "travado"
            const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            const url = new URL(`${baseUrl}/rest/v1/insurance_plans`);
            url.searchParams.set(
                "select",
                "id,category_name,vehicle_range,adesao,monthly_payment,percentual_7_5,percentual_70,participation_min,vehicles"
            );
            url.searchParams.set("category_name", `eq.${planCategoryName}`);
            url.searchParams.set("vehicle_range", `eq.${fipeRange}`);
            url.searchParams.set("limit", "1");

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    apikey: anonKey || "",
                    Authorization: `Bearer ${anonKey}`,
                },
                signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));

            const durationMs = Date.now() - startTime;
            const isOk = response.ok;

            const data = (await response.json()) as InsurancePlan[] | null;

            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'debug-session',
                    runId: 'vehicle-step',
                    hypothesisId: 'H6',
                    location: 'VehicleStep.tsx:planSearch:result',
                    message: 'handleNextWithPlan result',
                    data: {
                        durationMs,
                        status: response.status,
                        ok: isOk,
                        hasData: !!data && data.length > 0,
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => { });
            // #endregion

            if (!isOk) {
                console.error('Erro HTTP ao buscar plano:', response.status, await response.text());
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

            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'debug-session',
                    runId: 'vehicle-step',
                    hypothesisId: 'H6',
                    location: 'VehicleStep.tsx:planSearch:error',
                    message: 'handleNextWithPlan error',
                    data: {
                        errorMessage: err instanceof Error ? err.message : String(err),
                        errorName: err instanceof Error ? err.name : 'unknown',
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => { });
            // #endregion

            onPlanoEncontrado(null);
            if (mountedRef.current) {
                setFindingPlan(false);
                const isTimeout = err instanceof Error && err.message === "The user aborted a request." || err instanceof Error && err.name === "AbortError";
                
                if (isTimeout) {
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
