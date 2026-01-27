"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { AlertCircle, Calendar, CalendarClock, CheckCircle, Plus, Filter } from "lucide-react";
import {
  Atividade,
  PriorityFilters,
  TypeFilters,
  Usuario,
  NovaAtividade,
} from "./components/types";
import { AtividadeCard } from "./components/AtividadeCard";
import { FiltrosAtividades } from "./components/FiltrosAtividades";
import { ModalAtividade } from "./components/ModalAtividade";
import { EmptyState } from "./components/EmptyState";

interface AtividadesClientProps {
  initialAfiliadoId?: string | null;
  initialAtividades?: Atividade[];
  initialUsuarios?: Usuario[];
}

const AtividadesClient: React.FC<AtividadesClientProps> = ({
  initialAfiliadoId = null,
  initialAtividades = [],
  initialUsuarios = []
}) => {
  const [atividades, setAtividades] = useState<Atividade[]>(initialAtividades);
  const [filteredAtividades, setFilteredAtividades] = useState<Atividade[]>(initialAtividades);
  const [activeTab, setActiveTab] = useState<
    "atrasada" | "hoje" | "planejada" | "concluida"
  >("hoje");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilters, setTypeFilters] = useState<TypeFilters>({
    Ligar: false,
    Whatsapp: false,
    Email: false,
    Visita: false,
    Previsão_fechamento: false,
  });
  const [priorityFilters, setPriorityFilters] = useState<PriorityFilters>({
    Alta: false,
    Normal: false,
    Baixa: false,
  });
  const [loading, setLoading] = useState<boolean>(initialAtividades.length === 0);
  const supabase = useMemo(() => createClient(), []);
  const CACHE_TTL_MS = 60000;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [atividadeEditando, setAtividadeEditando] = useState<Atividade | null>(
    null,
  );
  const { user } = useUser();
  const [afiliadoId, setAfiliadoId] = useState<string>(initialAfiliadoId ?? "");

  const [novaAtividade, setNovaAtividade] = useState<NovaAtividade>({
    titulo: "",
    descricao: "",
    afiliado_id: "",
    prioridade: "Normal",
    tipo: "Ligar",
    prazo: new Date().toISOString().split("T")[0],
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);

  const getCachedAtividades = useCallback((id: string) => {
    if (typeof window === "undefined") return null;
    const cacheKey = `atividades_cache_${id}`;
    const dataKey = `atividades_data_${id}`;
    const cacheTime = sessionStorage.getItem(cacheKey);
    const cachedData = sessionStorage.getItem(dataKey);
    if (!cacheTime || !cachedData) return null;
    try {
      const timestamp = parseInt(cacheTime, 10);
      const isFresh = Date.now() - timestamp < CACHE_TTL_MS;
      const data = JSON.parse(cachedData) as Atividade[];
      return { data, isFresh };
    } catch {
      return null;
    }
  }, []);

  const saveCachedAtividades = useCallback((id: string, data: Atividade[]) => {
    if (typeof window === "undefined") return;
    const cacheKey = `atividades_cache_${id}`;
    const dataKey = `atividades_data_${id}`;
    sessionStorage.setItem(cacheKey, Date.now().toString());
    sessionStorage.setItem(dataKey, JSON.stringify(data));
  }, []);

  const getCachedUsuarios = useCallback(() => {
    if (typeof window === "undefined") return null;
    const cacheKey = "atividades_usuarios_cache";
    const dataKey = "atividades_usuarios_data";
    const cacheTime = sessionStorage.getItem(cacheKey);
    const cachedData = sessionStorage.getItem(dataKey);
    if (!cacheTime || !cachedData) return null;
    try {
      const timestamp = parseInt(cacheTime, 10);
      const isFresh = Date.now() - timestamp < CACHE_TTL_MS;
      const data = JSON.parse(cachedData) as Usuario[];
      return { data, isFresh };
    } catch {
      return null;
    }
  }, []);

  const saveCachedUsuarios = useCallback((data: Usuario[]) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("atividades_usuarios_cache", Date.now().toString());
    sessionStorage.setItem("atividades_usuarios_data", JSON.stringify(data));
  }, []);

  const fetchAfiliadoId = useCallback(async () => {
    if (!user?.id) return;
    try {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'atividades/page.tsx:fetchAfiliadoId:start',message:'atividades_afiliado_fetch_start',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'perf1',hypothesisId:'G'})}).catch(()=>{});
      console.log("[perf][G] atividades_afiliado_fetch_start", { userId: user.id });
      // #endregion
      const { data, error } = await supabase
        .from("afiliados")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar afiliado:", error);
        return;
      }

      if (data) {
        setAfiliadoId(data.id);
      }
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'atividades/page.tsx:fetchAfiliadoId:done',message:'atividades_afiliado_fetch_done',data:{hasId:!!data?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'perf1',hypothesisId:'G'})}).catch(()=>{});
      console.log("[perf][G] atividades_afiliado_fetch_done", { hasId: !!data?.id });
      // #endregion
    } catch (error) {
      console.error("Erro:", error);
    }
  }, [supabase, user?.id]);

  const fetchUsuarios = useCallback(async () => {
    const cached = getCachedUsuarios();
    if (cached?.data) {
      setUsuarios(cached.data);
      if (cached.isFresh) return;
    }
    try {
      const { data, error } = await supabase
        .from("afiliados")
        .select("id, nome_completo")
        .order("nome_completo");

      if (error) {
        console.error("Erro ao buscar afiliados:", error);
        return;
      }

      if (data) {
        setUsuarios(data);
        saveCachedUsuarios(data);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  }, [getCachedUsuarios, saveCachedUsuarios, supabase]);

  const fetchAtividades = useCallback(async () => {
    try {
      setLoading(true);

      if (!afiliadoId) return;
      const cached = getCachedAtividades(afiliadoId);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'atividades/page.tsx:fetchAtividades:start',message:'atividades_fetch_start',data:{afiliadoId,hasCache:!!cached?.data,isFresh:cached?.isFresh ?? null},timestamp:Date.now(),sessionId:'debug-session',runId:'perf1',hypothesisId:'G'})}).catch(()=>{});
      console.log("[perf][G] atividades_fetch_start", { afiliadoId, hasCache: !!cached?.data, isFresh: cached?.isFresh ?? null });
      // #endregion
      if (cached?.data) {
        setAtividades(cached.data);
        setFilteredAtividades(cached.data);
        if (cached.isFresh) {
          setLoading(false);
          return;
        }
      }

      let { data, error } = await supabase.from("atividades").select("*");

      if (error) {
        console.error("Erro ao buscar atividades:", error);
        toast.error("Erro ao carregar atividades");
        return;
      }

      if (data) {
        const hoje = new Date().toISOString().split("T")[0];
        const atividadesComStatus = data.map((atividade) => {
          let status: Atividade["status"] = "planejada";

          if (atividade.concluida) {
            status = "concluida";
          } else if (atividade.prazo < hoje) {
            status = "atrasada";
          } else if (atividade.prazo === hoje) {
            status = "hoje";
          }

          return {
            ...atividade,
            status,
          };
        });

        setAtividades(atividadesComStatus);
        setFilteredAtividades(atividadesComStatus);
        saveCachedAtividades(afiliadoId, atividadesComStatus);
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'atividades/page.tsx:fetchAtividades:done',message:'atividades_fetch_done',data:{count:atividadesComStatus.length},timestamp:Date.now(),sessionId:'debug-session',runId:'perf1',hypothesisId:'G'})}).catch(()=>{});
        console.log("[perf][G] atividades_fetch_done", { count: atividadesComStatus.length });
        // #endregion
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar atividades");
    } finally {
      setLoading(false);
    }
  }, [afiliadoId, getCachedAtividades, saveCachedAtividades, supabase]);

  // Contar atividades por status para os badges
  const countByStatus = useMemo(
    () => ({
      atrasada: atividades.filter((a) => a.status === "atrasada").length,
      hoje: atividades.filter((a) => a.status === "hoje").length,
      planejada: atividades.filter((a) => a.status === "planejada").length,
      concluida: atividades.filter((a) => a.status === "concluida").length,
    }),
    [atividades],
  );

  // Componente reutilizável para as tabs
  const renderTabsList = () => (
    <TabsList className="grid grid-cols-4 gap-2 bg-transparent">
      <TabsTrigger value="atrasada" className="relative bg-white text-gray-800 [&_svg]:text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-800 border border-gray-200">
        <AlertCircle className="w-4 h-4 mr-2 text-gray-800" />
        Atrasadas
        {countByStatus.atrasada > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white">
            {countByStatus.atrasada}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="hoje" className="relative bg-white text-gray-800 [&_svg]:text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-800 border border-gray-200">
        <Calendar className="w-4 h-4 mr-2 text-gray-800" />
        Hoje
        {countByStatus.hoje > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
            {countByStatus.hoje}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="planejada" className="relative bg-white text-gray-800 [&_svg]:text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-800 border border-gray-200">
        <CalendarClock className="w-4 h-4 mr-2 text-gray-800" />
        Planejadas
        {countByStatus.planejada > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-gray-500 text-white">
            {countByStatus.planejada}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="concluida" className="relative bg-white text-gray-800 [&_svg]:text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-800 border border-gray-200">
        <CheckCircle className="w-4 h-4 mr-2 text-gray-800" />
        Concluídas
        {countByStatus.concluida > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white">
            {countByStatus.concluida}
          </Badge>
        )}
      </TabsTrigger>
    </TabsList>
  );

  // Aplicar filtros quando qualquer filtro mudar
  useEffect(() => {
    let result = atividades;

    // Filtrar por aba ativa
    result = result.filter((atividade) => atividade.status === activeTab);

    // Filtrar por termo de busca
    if (searchTerm) {
      result = result.filter(
        (atividade) =>
          atividade.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          atividade.descricao?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por tipo, se algum tipo estiver selecionado
    const selectedTypes = Object.keys(typeFilters).filter(
      (key) => typeFilters[key as keyof TypeFilters],
    );
    if (selectedTypes.length > 0) {
      result = result.filter((atividade) =>
        selectedTypes.includes(atividade.tipo),
      );
    }

    // Filtrar por prioridade, se alguma prioridade estiver selecionada
    const selectedPriorities = Object.keys(priorityFilters).filter(
      (key) => priorityFilters[key as keyof PriorityFilters],
    );
    if (selectedPriorities.length > 0) {
      result = result.filter((atividade) =>
        selectedPriorities.includes(atividade.prioridade),
      );
    }

    setFilteredAtividades(result);
  }, [atividades, activeTab, searchTerm, typeFilters, priorityFilters]);

  // Manipulador para alternar filtros de tipo
  const handleTypeFilterChange = useCallback((type: keyof TypeFilters, checked: boolean): void => {
    setTypeFilters((prev) => ({
      ...prev,
      [type]: checked,
    }));
  }, []);

  // Manipulador para alternar filtros de prioridade
  const handlePriorityFilterChange = useCallback((
    priority: keyof PriorityFilters,
    checked: boolean,
  ): void => {
    setPriorityFilters((prev) => ({
      ...prev,
      [priority]: checked,
    }));
  }, []);

  // Limpar todos os filtros
  const clearAllFilters = useCallback((): void => {
    setSearchTerm("");
    setTypeFilters({
      Ligar: false,
      Whatsapp: false,
      Email: false,
      Visita: false,
      Previsão_fechamento: false,
    });
    setPriorityFilters({
      Alta: false,
      Normal: false,
      Baixa: false,
    });
  }, []);

  // Contar quantos filtros estão ativos
  const activeFiltersCount = useMemo(
    () =>
      [searchTerm, ...Object.values(typeFilters), ...Object.values(priorityFilters)].filter(
        Boolean,
      ).length,
    [priorityFilters, searchTerm, typeFilters],
  );

  // Formatar data para exibição
  const formatDate = useCallback(
    (dateString: string): string => new Date(dateString).toLocaleDateString("pt-BR"),
    [],
  );

  // Abrir modal para edição
  const handleEdit = useCallback((atividade: Atividade) => {
    setAtividadeEditando(atividade);
    setNovaAtividade({
      titulo: atividade.titulo,
      descricao: atividade.descricao || "",
      afiliado_id: atividade.afiliado_id,
      prioridade: atividade.prioridade,
      tipo: atividade.tipo,
      prazo: atividade.prazo,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  // Concluir atividade
  const handleConcluir = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from("atividades")
        .update({ concluida: true })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Atividade concluída com sucesso");
      fetchAtividades();
    } catch (error) {
      console.error("Erro ao concluir atividade:", error);
      toast.error("Erro ao concluir atividade");
    }
  }, [fetchAtividades, supabase]);

  // Reabrir atividade
  const handleReabrir = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from("atividades")
        .update({ concluida: false })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Atividade reaberta com sucesso");
      fetchAtividades();
    } catch (error) {
      console.error("Erro ao reabrir atividade:", error);
      toast.error("Erro ao reabrir atividade");
    }
  }, [fetchAtividades, supabase]);

  // Abrir modal de criação
  const handleOpenModal = useCallback(() => {
    setModalMode("create");
    setNovaAtividade({
      titulo: "",
      descricao: "",
      afiliado_id: afiliadoId,
      prioridade: "Normal",
      tipo: "Ligar",
      prazo: new Date().toISOString().split("T")[0],
    });
    setAtividadeEditando(null);
    setIsModalOpen(true);
  }, [afiliadoId]);

  // Salvar atividade
  const handleSaveAtividade = useCallback(async () => {
    try {
      if (!novaAtividade.titulo.trim()) {
        toast.error("O título é obrigatório");
        return;
      }

      if (modalMode === "edit" && atividadeEditando) {
        const { error } = await supabase
          .from("atividades")
          .update({
            titulo: novaAtividade.titulo,
            descricao: novaAtividade.descricao,
            prioridade: novaAtividade.prioridade,
            tipo: novaAtividade.tipo,
            prazo: novaAtividade.prazo,
          })
          .eq("id", atividadeEditando.id);

        if (error) {
          throw error;
        }

        toast.success("Atividade atualizada com sucesso");
      } else {
        const { error } = await supabase.from("atividades").insert([
          {
            titulo: novaAtividade.titulo,
            descricao: novaAtividade.descricao,
            afiliado_id: afiliadoId,
            prioridade: novaAtividade.prioridade,
            tipo: novaAtividade.tipo,
            prazo: novaAtividade.prazo,
            concluida: false,
          },
        ]);

        if (error) {
          throw error;
        }

        toast.success("Atividade criada com sucesso");
      }

      // Fechar modal e recarregar dados
      setIsModalOpen(false);
      setNovaAtividade({
        titulo: "",
        descricao: "",
        afiliado_id: "",
        prioridade: "Normal",
        tipo: "Ligar",
        prazo: new Date().toISOString().split("T")[0],
      });
      setAtividadeEditando(null);
      fetchAtividades();
    } catch (error) {
      console.error("Erro ao salvar atividade:", error);
      toast.error("Erro ao salvar atividade");
    }
  }, [atividadeEditando, afiliadoId, fetchAtividades, modalMode, novaAtividade, supabase]);

  // Excluir atividade
  const handleExcluir = useCallback(async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta atividade?")) {
      return;
    }

    try {
      const { error } = await supabase.from("atividades").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Atividade excluída com sucesso");
      fetchAtividades();
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
      toast.error("Erro ao excluir atividade");
    }
  }, [fetchAtividades, supabase]);

  useEffect(() => {
    if (initialAfiliadoId) return;
    fetchAfiliadoId();
  }, [fetchAfiliadoId, initialAfiliadoId]);

  useEffect(() => {
    if (afiliadoId) {
      if (!initialAtividades.length) {
        fetchAtividades();
      }
      if (!initialUsuarios.length) {
        fetchUsuarios();
      }
    }
  }, [afiliadoId, fetchAtividades, fetchUsuarios, initialAtividades.length, initialUsuarios.length]);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 py-3">
        {/* Header */}
        <header className="flex flex-col flex-wrap">
          <h2 className="font-bold leading-tight m-0 text-white text-2xl">
            Atividades
          </h2>
          <header className="flex items-center justify-between flex-wrap">
            <nav className="flex items-center flex-wrap gap-2 max-[450px]:pr-8">


            </nav>
            <div className="flex items-center justify-center gap-4 pl-2 flex-row-reverse flex-wrap mt-4 lg:flex-row lg:mt-0">
              <Button
                onClick={() => {
                  setModalMode("create");
                  setNovaAtividade({
                    titulo: "",
                    descricao: "",
                    afiliado_id: afiliadoId,
                    prioridade: "Normal",
                    tipo: "Ligar",
                    prazo: new Date().toISOString().split("T")[0],
                  });
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2">{activeFiltersCount}</Badge>
                )}
              </Button>
            </div>
          </header>
        </header>

        {/* Filtros */}
        {showFilters && (
          <FiltrosAtividades
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilters={typeFilters}
            onTypeFilterChange={handleTypeFilterChange}
            priorityFilters={priorityFilters}
            onPriorityFilterChange={handlePriorityFilterChange}
            onClearFilters={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
          />
        )}

        {/* Tabs */}
        <Tabs defaultValue="hoje" className="mt-6" value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          {filteredAtividades.length > 0 && renderTabsList()}

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center text-gray-400">Carregando atividades...</div>
            ) : filteredAtividades.length === 0 ? (
              <EmptyState>
                {renderTabsList()}
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAtividades.map((atividade) => (
                  <AtividadeCard
                    key={atividade.id}
                    atividade={atividade}
                    usuarios={usuarios}
                    onEdit={handleEdit}
                    onConcluir={handleConcluir}
                    onReabrir={handleReabrir}
                    onExcluir={handleExcluir}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ModalAtividade
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          atividade={novaAtividade}
          usuarios={usuarios}
          mode={modalMode}
          onChange={(field, value) => {
            setNovaAtividade((prev) => ({
              ...prev,
              [field]: value,
            }));
          }}
          onSave={handleSaveAtividade}
        />
      </div>
    </div>
  );
};

export default AtividadesClient;
