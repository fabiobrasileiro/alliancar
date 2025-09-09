"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { 
  Atividade, 
  PriorityFilters, 
  TypeFilters, 
  Usuario, 
  NovaAtividade 
} from "./components/types";
import { AtividadeCard } from "./components/AtividadeCard";
import { FiltrosAtividades } from "./components/FiltrosAtividades";
import { ModalAtividade } from "./components/ModalAtividade";
import { EmptyState } from "./components/EmptyState";

const AtividadesPage: React.FC = () => {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [filteredAtividades, setFilteredAtividades] = useState<Atividade[]>([]);
  const [activeTab, setActiveTab] = useState<"atrasada" | "hoje" | "planejada" | "concluida">("hoje");
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
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [atividadeEditando, setAtividadeEditando] = useState<Atividade | null>(null);
  const { user } = useUser();
  const [afiliadoId, setAfiliadoId] = useState<string>("");

  const [novaAtividade, setNovaAtividade] = useState<NovaAtividade>({
    titulo: "",
    descricao: "",
    afiliado_id: "",
    prioridade: "Normal",
    tipo: "Ligar",
    prazo: new Date().toISOString().split("T")[0],
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  

  // Buscar afiliado_id do usuário autenticado
  useEffect(() => {
    const fetchAfiliadoId = async () => {
      if (!user?.id) return;

      try {
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
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    fetchAfiliadoId();
  }, [user, supabase]);

  // Buscar atividades do Supabase
  useEffect(() => {
    if (afiliadoId) {
      fetchAtividades();
      fetchUsuarios();
    }
  }, [afiliadoId, supabase]);

  const fetchUsuarios = async () => {
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
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const fetchAtividades = async () => {
    try {
      setLoading(true);

      let { data, error } = await supabase
        .from("atividades")
        .select("*")
        

      if (error) {
        console.error("Erro ao buscar atividades:", error);
        toast.error("Erro ao carregar atividades");
        return;
      }

      if (data) {
        const hoje = new Date().toISOString().split("T")[0];
        const atividadesComStatus = data.map((atividade) => {
          let status: Atividade["status"] = "planejada";

          if (atividade.prazo < hoje && atividade.status !== "concluida") {
            status = "atrasada";
          } else if (atividade.prazo === hoje && atividade.status !== "concluida") {
            status = "hoje";
          } else if (atividade.status === "concluida") {
            status = "concluida";
          }

          return { ...atividade, status };
        });

        setAtividades(atividadesComStatus);
        setFilteredAtividades(atividadesComStatus);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar atividades");
    } finally {
      setLoading(false);
    }
  };

  // Contar atividades por status para os badges
  const countByStatus = {
    atrasada: atividades.filter((a) => a.status === "atrasada").length,
    hoje: atividades.filter((a) => a.status === "hoje").length,
    planejada: atividades.filter((a) => a.status === "planejada").length,
    concluida: atividades.filter((a) => a.status === "concluida").length,
  };

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
          atividade.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo, se algum tipo estiver selecionado
    const selectedTypes = Object.keys(typeFilters).filter(
      (key) => typeFilters[key as keyof TypeFilters]
    );
    if (selectedTypes.length > 0) {
      result = result.filter((atividade) =>
        selectedTypes.includes(atividade.tipo)
      );
    }

    // Filtrar por prioridade, se alguma prioridade estiver selecionada
    const selectedPriorities = Object.keys(priorityFilters).filter(
      (key) => priorityFilters[key as keyof PriorityFilters]
    );
    if (selectedPriorities.length > 0) {
      result = result.filter((atividade) =>
        selectedPriorities.includes(atividade.prioridade)
      );
    }

    setFilteredAtividades(result);
  }, [atividades, activeTab, searchTerm, typeFilters, priorityFilters]);

  // Manipulador para alternar filtros de tipo
  const handleTypeFilterChange = (type: keyof TypeFilters): void => {
    setTypeFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Manipulador para alternar filtros de prioridade
  const handlePriorityFilterChange = (priority: keyof PriorityFilters): void => {
    setPriorityFilters((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  };

  // Limpar todos os filtros
  const clearAllFilters = (): void => {
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
  };

  // Contar quantos filtros estão ativos
  const activeFiltersCount: number = [
    searchTerm,
    ...Object.values(typeFilters),
    ...Object.values(priorityFilters),
  ].filter(Boolean).length;

  // Formatar data para exibição
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Abrir modal para edição
  const handleEdit = (atividade: Atividade) => {
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
  };

  // Concluir atividade
  const handleConcluir = async (id: number) => {
    try {
      const { error } = await supabase
        .from("atividades")
        .update({ 
          status: "concluida",
          concluida_em: new Date().toISOString()
        })
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
  };

  // Reabrir atividade (marcar como pendente)
  const handleReabrir = async (id: number) => {
    try {
      const { error } = await supabase
        .from("atividades")
        .update({ 
          status: "pendente",
          concluida_em: null
        })
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
  };

  // Salvar atividade (criação ou edição)
  const handleSaveAtividade = async () => {
    try {
      // Validar campos obrigatórios
      if (!novaAtividade.titulo || !novaAtividade.prazo) {
        toast.error("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      if (modalMode === "create") {
        // Criar nova atividade
        const { error } = await supabase.from("atividades").insert([
          {
            titulo: novaAtividade.titulo,
            descricao: novaAtividade.descricao,
            afiliado_id: novaAtividade.afiliado_id || afiliadoId,
            prazo: novaAtividade.prazo,
            prioridade: novaAtividade.prioridade,
            tipo: novaAtividade.tipo,
            status: "pendente",
          },
        ]);

        if (error) {
          throw error;
        }

        toast.success("Atividade criada com sucesso");
      } else {
        // Editar atividade existente
        if (!atividadeEditando) return;

        const { error } = await supabase
          .from("atividades")
          .update({
            titulo: novaAtividade.titulo,
            descricao: novaAtividade.descricao,
            afiliado_id: novaAtividade.afiliado_id,
            prazo: novaAtividade.prazo,
            prioridade: novaAtividade.prioridade,
            tipo: novaAtividade.tipo,
          })
          .eq("id", atividadeEditando.id);

        if (error) {
          throw error;
        }

        toast.success("Atividade atualizada com sucesso");
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
  };

  // Excluir atividade
  const handleExcluir = async (id: number) => {
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
  };
  

  // Buscar afiliado_id do usuário autenticado
  useEffect(() => {
    const fetchAfiliadoId = async () => {
      if (!user?.id) return;

      try {
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
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    fetchAfiliadoId();
  }, [user, supabase]);

  // Buscar atividades do Supabase
  useEffect(() => {
    if (afiliadoId) {
      fetchAtividades();
      fetchUsuarios();
    }
  }, [afiliadoId, supabase]);



  return (
    <>
      <div className="px-5 py-3">
        {/* Header */}
        <header className="flex flex-col flex-wrap">
          <h2 className="font-bold leading-tight m-0 text-slate-700 text-2xl">
            Atividades
          </h2>
          <header className="flex items-center justify-between flex-wrap">
            <nav className="flex items-center flex-wrap gap-2 max-[450px]:pr-8">
              <span className="text-slate-950 text-sm flex gap-2 items-center">
                <Link className="hover:opacity-70" href="/">
                  Home
                </Link>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
              <span className="text-sm text-jelly-bean-700">
                <Link className="hover:opacity-70" href="/crm/activity">
                  Atividades
                </Link>
              </span>
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
                className="text-sm px-5 h-9 bg-jelly-bean-900 hover:bg-jelly-bean-700"
              >
                + Nova Atividade
              </Button>
              <button
                className="font-base text-center justify-center cursor-pointer focus:outline-none disabled:cursor-not-allowed rounded-md p-1 bg-white flex items-center relative"
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-filter"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                {activeFiltersCount > 0 && (
                  <div className="flex items-center justify-center bg-red-500 text-white rounded-full w-4 h-4 text-[10px] absolute -top-1 -right-1">
                    {activeFiltersCount}
                  </div>
                )}
              </button>
            </div>
          </header>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 mt-8 items-start w-full">
          <div className="flex flex-col max-[1024px]:w-full lg:w-4/6">
            <Card className="w-full p-6 md:p-8">
              <div className="w-full block">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as any)}
                  className=""
                >
                  <TabsList className="w-full md:h-12 h-16 flex flex-wrap mb-14 md:mb-0">
                    <TabsTrigger value="atrasada">
                      Atrasadas
                      <Badge variant="red">{countByStatus.atrasada}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="hoje">
                      Para hoje
                      <Badge variant="blue">{countByStatus.hoje}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="planejada">
                      Planejadas
                      <Badge variant="gray">{countByStatus.planejada}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="concluida">
                      Concluídas
                      <Badge variant="green">{countByStatus.concluida}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  {loading ? (
                    <div className="flex justify-center items-center my-8">
                      <p>Carregando atividades...</p>
                    </div>
                  ) : (
                    <>
                      {(["atrasada", "hoje", "planejada", "concluida"] as const).map((status) => (
                        <TabsContent key={status} value={status}>
                          <div className="flex flex-col gap-4 mt-4">
                            {filteredAtividades.filter((a) => a.status === status).length > 0 ? (
                              filteredAtividades
                                .filter((a) => a.status === status)
                                .map((atividade) => (
                                  <AtividadeCard
                                    key={atividade.id}
                                    atividade={atividade}
                                    usuarios={usuarios}
                                    onEdit={handleEdit}
                                    onConcluir={handleConcluir}
                                    onReabrir={handleReabrir}
                                    onExcluir={handleExcluir}
                                  />
                                ))
                            ) : (
                              <EmptyState />
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </>
                  )}
                </Tabs>
              </div>
            </Card>
          </div>

          {showFilters && (
            <FiltrosAtividades
              searchTerm={searchTerm}
              typeFilters={typeFilters}
              priorityFilters={priorityFilters}
              onSearchChange={setSearchTerm}
              onTypeFilterChange={handleTypeFilterChange}
              onPriorityFilterChange={handlePriorityFilterChange}
              onClearFilters={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
            />
          )}
        </div>
      </div>

      <ModalAtividade
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNovaAtividade({
            titulo: "",
            descricao: "",
            afiliado_id: afiliadoId,
            prioridade: "Normal",
            tipo: "Ligar",
            prazo: new Date().toISOString().split("T")[0],
          });
        }}
        mode={modalMode}
        atividade={novaAtividade}
        usuarios={usuarios}
        onChange={(field, value) => setNovaAtividade(prev => ({ ...prev, [field]: value }))}
        onSave={handleSaveAtividade}
      />
    </>
  );
};

export default AtividadesPage;