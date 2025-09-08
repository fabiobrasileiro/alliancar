"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BarChart3, Menu } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import SalesKanban from "./components/SalesKanban";
import FilterModal from "./components/FilterModal";
import NewNegotiationModal from "./components/NewNegotiationModal";
import { SaleCard, NewNegotiationForm, FilterData } from "./components/types";

export default function VendasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [formData, setFormData] = useState<NewNegotiationForm>({
        cooperativa: "11375",
        tipoVeiculo: "0",
        placa: "",
        marca: "",
        anoModelo: "",
        modelo: "",
        nomeContato: "",
        email: "",
        celular: "",
        estado: "",
        cidade: "",
        origemLead: "0",
        subOrigemLead: "",
        veiculoTrabalho: false,
        enviarCotacao: false,
    });

    const [filterData, setFilterData] = useState<FilterData>({
        tipoData: "0",
        dataInicial: "",
        dataFinal: "",
        cooperativas: [],
        usuarios: [],
        origem: [],
        subOrigem: [],
        tagsAutomaticas: "0",
        cartoesArquivados: false,
        cotaçõesPagas: false,
        boletosNaoPagos: false,
        instalacaoRastreador: false,
        cartoesExpirados: false,
        cartoesAceitos: false,
        cartoesNaoAtendidos: false,
        ordenarAntigas: false,
    });

    const [cards, setCards] = useState<SaleCard[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const supabase = createClient();

    const daysBetween = (isoDate: string) => {
        const created = new Date(isoDate).getTime();
        const now = Date.now();
        const diff = Math.max(0, now - created);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const fetchCards = async () => {
        try {
            setLoadingCards(true);
            const { data, error } = await supabase
                .from("negociacoes")
                .select(
                    "id, tipo_veiculo, placa, marca_id, ano_modelo, modelo_id, origem_lead, veiculo_trabalho, enviar_cotacao, chaves, created_at",
                )
                .order("created_at", { ascending: false });
            if (error) throw error;

            const mapped: SaleCard[] = (data || []).map((row: any) => {
                const chaves = (row as any).chaves || {};
                const clientName = chaves.nome_contato || "-";
                const vehicleParts = [row.placa, row.marca_id, row.modelo_id].filter(
                    Boolean,
                );
                const vehicle = vehicleParts.length
                    ? vehicleParts.join(" · ")
                    : row.placa || "-";
                const createdAt = row.created_at as string;
                const etapa = (chaves.etapa as SaleCard["status"]) || "quotation";
                return {
                    id: row.id,
                    clientName,
                    date: new Date(createdAt).toLocaleString("pt-BR"),
                    vehicle,
                    price: "-",
                    status: etapa,
                    tags: [],
                    hasTracker: !!row.veiculo_trabalho,
                    isAccepted: false,
                    isExpired: false,
                    daysInStage: daysBetween(createdAt),
                    user: chaves.responsavel || "-",
                } as SaleCard;
            });
            setCards(mapped);
        } catch (err: any) {
            console.error("Erro ao carregar negociações", err);
            toast.error("Erro ao carregar negociações");
        } finally {
            setLoadingCards(false);
        }
    };

    useEffect(() => {
        fetchCards();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFormChange = (
        field: keyof NewNegotiationForm,
        value: string | boolean,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                tipo_veiculo: formData.tipoVeiculo || null,
                placa: formData.placa || null,
                marca_id: formData.marca || null,
                ano_modelo: formData.anoModelo ? Number(formData.anoModelo) : null,
                modelo_id: formData.modelo || null,
                origem_lead: formData.origemLead || null,
                veiculo_trabalho: !!formData.veiculoTrabalho,
                enviar_cotacao: !!formData.enviarCotacao,
                chaves: {
                    etapa: "quotation",
                    nome_contato: formData.nomeContato,
                    email: formData.email,
                    celular: formData.celular,
                    estado: formData.estado,
                    cidade: formData.cidade,
                },
            };

            const { error } = await supabase.from("negociacoes").insert(payload);
            if (error) throw error;

            toast.success("Negociação adicionada");
            setIsModalOpen(false);
            setFormData({
                cooperativa: "11375",
                tipoVeiculo: "0",
                placa: "",
                marca: "",
                anoModelo: "",
                modelo: "",
                nomeContato: "",
                email: "",
                celular: "",
                estado: "",
                cidade: "",
                origemLead: "0",
                subOrigemLead: "",
                veiculoTrabalho: false,
                enviarCotacao: false,
            });
            fetchCards();
        } catch (err: any) {
            console.error("Erro ao adicionar negociação", err);
            toast.error("Erro ao adicionar negociação");
        }
    };

    const handleFilterChange = <K extends keyof FilterData>(
        field: K,
        value: FilterData[K],
    ) => {
        setFilterData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFilterSubmit = () => {
        const activeFiltersCount = Object.values(filterData).filter((value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "boolean") return value;
            if (typeof value === "string") return value !== "0" && value !== "";
            return false;
        }).length;

        setActiveFilters(activeFiltersCount);
        setIsFilterModalOpen(false);
    };

    const clearFilters = () => {
        setFilterData({
            tipoData: "0",
            dataInicial: "",
            dataFinal: "",
            cooperativas: [],
            usuarios: [],
            origem: [],
            subOrigem: [],
            tagsAutomaticas: "0",
            cartoesArquivados: false,
            cotaçõesPagas: false,
            boletosNaoPagos: false,
            instalacaoRastreador: false,
            cartoesExpirados: false,
            cartoesAceitos: false,
            cartoesNaoAtendidos: false,
            ordenarAntigas: false,
        });
        setActiveFilters(0);
    };

    // DnD helpers
    const onDragStart = (ev: React.DragEvent, cardId: string) => {
        ev.dataTransfer.setData("text/plain", cardId);
    };

    const onDragOver = (ev: React.DragEvent) => {
        ev.preventDefault();
    };

    const persistStage = async (id: string, etapa: SaleCard["status"]) => {
        try {
            const { error } = await supabase
                .from("negociacoes")
                .update({ chaves: { etapa } })
                .eq("id", id);
            if (error) throw error;
        } catch (e) {
            toast.error("Falha ao mover negociação");
            throw e;
        }
    };

    const onDropTo = async (ev: React.DragEvent, status: SaleCard["status"]) => {
        ev.preventDefault();
        const id = ev.dataTransfer.getData("text/plain");
        if (!id) return;
        // Atualiza localmente
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
        try {
            await persistStage(id, status);
        } catch (e) {
            // rollback reload
            fetchCards();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-3xl font-bold text-gray-900">Funil de Vendas</h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Barra de pesquisa */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Código da Negociação"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>

                        {/* Botão de busca */}
                        <Button variant="outline">Buscar...</Button>

                        {/* Ícones */}
                        <Button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700">
                            <BarChart3 className="w-5 h-5" />
                        </Button>
                        <Button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700">
                            <Menu className="w-5 h-5" />
                        </Button>

                        {/* Modal de Filtros */}
                        <FilterModal
                            isOpen={isFilterModalOpen}
                            onOpenChange={setIsFilterModalOpen}
                            filterData={filterData}
                            onFilterChange={handleFilterChange}
                            onSubmit={handleFilterSubmit}
                            onClear={clearFilters}
                            activeFilters={activeFilters}
                        />

                        {/* Modal de Nova Negociação */}
                        <NewNegotiationModal
                            isOpen={isModalOpen}
                            onOpenChange={setIsModalOpen}
                            formData={formData}
                            onFormChange={handleFormChange}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            </div>

            {/* Kanban de Vendas */}
            <SalesKanban
                cards={cards}
                loading={loadingCards}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDropTo}
            />
        </div>
    );
}
