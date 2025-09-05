"use client";
import React, { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Atividade {
  id: number;
  created_at: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  responsavel_name: string;
  prazo: string;
  prioridade: "Alta" | "Normal" | "Baixa";
  tipo: "Ligar" | "Whatsapp" | "Email" | "Visita" | "Previsão de fechamento";
  status: "atrasada" | "hoje" | "planejada" | "concluida";
}

interface TypeFilters {
  Visita: boolean;
  Whatsapp: boolean;
  Ligar: boolean;
  Email: boolean;
  Previsão_fechamento: boolean;
}

interface PriorityFilters {
  Alta: boolean;
  Normal: boolean;
  Baixa: boolean;
}

interface Usuario {
  id: string;
  nome_completo: string;
}

const AtividadesPage: React.FC = () => {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [filteredAtividades, setFilteredAtividades] = useState<Atividade[]>([]);
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
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [atividadeEditando, setAtividadeEditando] = useState<Atividade | null>(
    null,
  );
  const [novaAtividade, setNovaAtividade] = useState({
    titulo: "",
    descricao: "",
    responsavel: "",
    responsavel_name: "",
    prioridade: "Normal" as "Alta" | "Normal" | "Baixa",
    tipo: "Ligar" as
      | "Ligar"
      | "Whatsapp"
      | "Email"
      | "Visita"
      | "Previsão de fechamento",
    prazo: new Date().toISOString().split("T")[0],
  });
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuarios, setselectedUsuarios] = useState<Usuario[]>([]);

  // Buscar usuarios do Supabase
  useEffect(() => {
    fetchProfile();
  }, [supabase]);

  //procurar usuarios
  const fetchProfile = async () => {
    try {
      setLoading(true);

      let { data: profile, error } = await supabase
        .from("profile")
        .select("nome_completo, id");

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao carregar usuários");
        return;
      }

      setUsuarios(profile || []);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar atividades");
    } finally {
      setLoading(false);
    }
  };

  // Buscar atividades do Supabase
  useEffect(() => {
    fetchAtividades();
  }, [supabase]);

  const fetchAtividades = async () => {
    try {
      setLoading(true);

      let { data, error } = await supabase
        .from("atividades")
        .select("*")
        .order("prazo", { ascending: true });

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
          } else if (
            atividade.prazo === hoje &&
            atividade.status !== "concluida"
          ) {
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
          atividade.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
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
      // Mapear prioridades do filtro para o formato do banco
      const priorityMap: Record<string, string> = {
        Alta: "Alta",
        Normal: "Normal",
        Baixa: "Baixa",
      };

      result = result.filter((atividade) =>
        selectedPriorities
          .map((p) => priorityMap[p])
          .includes(atividade.prioridade),
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
  const handlePriorityFilterChange = (
    priority: keyof PriorityFilters,
  ): void => {
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
      descricao: atividade.descricao,
      responsavel_name: atividade.responsavel_name,
      responsavel: atividade.responsavel,
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
        .update({ status: "concluida" })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Atividade concluída com sucesso");
      fetchAtividades(); // Recarregar a lista
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
        .update({ status: "pendente" })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Atividade reaberta com sucesso");
      fetchAtividades(); // Recarregar a lista
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
            responsavel: novaAtividade.responsavel,
            responsavel_name: novaAtividade.responsavel_name,
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
            responsavel: novaAtividade.responsavel,
            responsavel_name: novaAtividade.responsavel_name,
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
        responsavel: "",
        responsavel_name: "",
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
      fetchAtividades(); // Recarregar a lista
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
      toast.error("Erro ao excluir atividade");
    }
  };

  return (
    <>
      <div className="px-5 py-3">
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
                    responsavel: "",
                    responsavel_name: "",
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
                      {(
                        ["atrasada", "hoje", "planejada", "concluida"] as const
                      ).map((status) => (
                        <TabsContent key={status} value={status}>
                          <div className="flex flex-col gap-4 mt-4">
                            {filteredAtividades.filter(
                              (a) => a.status === status,
                            ).length > 0 ? (
                              filteredAtividades
                                .filter((a) => a.status === status)
                                .map((atividade) => (
                                  <Card key={atividade.id} className="p-4">
                                    <div className="flex justify-between items-start flex-wrap">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-jelly-bean-950">
                                          {atividade.titulo}
                                        </h4>
                                        <p className="text-sm text-jelly-bean-800 mt-1">
                                          {atividade.descricao}
                                        </p>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                          <span className="text-xs bg-jelly-bean-100 text-jelly-bean-800 px-2 py-1 rounded capitalize">
                                            Tipo: {atividade.tipo}
                                          </span>
                                          <span className="text-xs text-jelly-bean-800">
                                            Prazo: {formatDate(atividade.prazo)}
                                          </span>
                                          <span className="text-xs text-jelly-bean-800">
                                            Responsável:{" "}
                                            {atividade.responsavel_name}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex md:flex-col flex-row mt-4 md:mt-0 items-end gap-2">
                                        <Badge
                                          variant={
                                            atividade.prioridade === "Alta"
                                              ? "red"
                                              : atividade.prioridade ===
                                                  "Normal"
                                                ? "blue"
                                                : "gray"
                                          }
                                          className="capitalize"
                                        >
                                          {atividade.prioridade === "Alta"
                                            ? "Alta"
                                            : atividade.prioridade === "Normal"
                                              ? "Normal"
                                              : "Baixa"}
                                        </Badge>
                                        <div className="flex gap-2">
                                          {atividade.status !== "concluida" ? (
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleEdit(atividade)
                                                }
                                              >
                                                Editar
                                              </Button>
                                              <Button
                                                size="sm"
                                                onClick={() =>
                                                  handleConcluir(atividade.id)
                                                }
                                              >
                                                Concluir
                                              </Button>
                                            </>
                                          ) : (
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleReabrir(atividade.id)
                                                }
                                              >
                                                Reabrir
                                              </Button>
                                              <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() =>
                                                  handleExcluir(atividade.id)
                                                }
                                              >
                                                Excluir
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))
                            ) : (
                              <div className="flex flex-col gap-2 items-center my-8 w-full bg-slate-100 text-slate-500 p-8 rounded-md">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="80"
                                  height="80"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-inbox"
                                >
                                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                                </svg>
                                <p className="text-base text-slate-700 m-0">
                                  Nenhuma atividade encontrada
                                </p>
                              </div>
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

          {/* Filtros expandíveis */}
          {showFilters && (
            <Card className="p-4 w-full md:w-2/5  ">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filtros</h3>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Limpar Filtros
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="search" className="mb-2">
                    Buscar
                  </Label>
                  <Input
                    id="search"
                    placeholder="Buscar atividades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="mb-2">Tipo</Label>
                  <div className="space-y-2">
                    {Object.keys(typeFilters).map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={typeFilters[type as keyof TypeFilters]}
                          onChange={() =>
                            handleTypeFilterChange(type as keyof TypeFilters)
                          }
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="text-sm font-medium leading-none capitalize"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <Label className="mb-2">Prioridade</Label>
                  <div className="space-y-2">
                    {Object.keys(priorityFilters).map((priority) => (
                      <div
                        key={priority}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={
                            priorityFilters[priority as keyof PriorityFilters]
                          }
                          onChange={() =>
                            handlePriorityFilterChange(
                              priority as keyof PriorityFilters,
                            )
                          }
                        />
                        <label
                          htmlFor={`priority-${priority}`}
                          className="text-sm font-medium leading-none capitalize"
                        >
                          {priority}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Transition show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg bg-white">
                  {/* Cabeçalho do modal */}
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900 mb-4"
                        >
                          {modalMode === "create"
                            ? "Nova Atividade"
                            : "Editar Atividade"}
                        </Dialog.Title>

                        {/* Formulário do modal */}
                        <div className="mt-2 space-y-4">
                          {/* Campo Título */}
                          <div className="grid w-full items-center gap-1.5">
                            <Label
                              htmlFor="titulo"
                              className="text-sm font-medium"
                            >
                              Título *
                            </Label>
                            <Input
                              type="text"
                              id="titulo"
                              placeholder="Digite o título da atividade"
                              value={novaAtividade.titulo}
                              onChange={(e) =>
                                setNovaAtividade({
                                  ...novaAtividade,
                                  titulo: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          {/* Campo Descrição */}
                          <div className="grid w-full items-center gap-1.5">
                            <Label
                              htmlFor="descricao"
                              className="text-sm font-medium"
                            >
                              Descrição
                            </Label>
                            <textarea
                              id="descricao"
                              rows={3}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-jelly-bean-500 focus:ring-jelly-bean-500"
                              placeholder="Descreva a atividade..."
                              value={novaAtividade.descricao}
                              onChange={(e) =>
                                setNovaAtividade({
                                  ...novaAtividade,
                                  descricao: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* Campo Responsável */}
                          <div className="grid w-full items-center gap-1.5">
                            <Label
                              htmlFor="responsavel"
                              className="text-sm font-medium"
                            >
                              Responsável
                            </Label>
                            <select
                              id="responsavel"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-jelly-bean-500 focus:ring-jelly-bean-500"
                              value={novaAtividade.responsavel}
                              onChange={(e) => {
                                const selectedUser = usuarios.find(
                                  (u) => u.id === e.target.value,
                                );
                                setNovaAtividade({
                                  ...novaAtividade,
                                  responsavel: e.target.value,
                                  responsavel_name:
                                    selectedUser?.nome_completo || "",
                                });
                              }}
                            >
                              {usuarios?.map((usuario) => (
                                <option value={usuario.id}>
                                  {usuario.nome_completo}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Campo Prazo */}
                          <div className="grid w-full items-center gap-1.5">
                            <Label
                              htmlFor="prazo"
                              className="text-sm font-medium"
                            >
                              Prazo *
                            </Label>
                            <Input
                              type="date"
                              id="prazo"
                              value={novaAtividade.prazo}
                              onChange={(e) =>
                                setNovaAtividade({
                                  ...novaAtividade,
                                  prazo: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          {/* Campo Prioridade */}
                          <div className="grid w-full items-center gap-1.5">
                            <Label
                              htmlFor="prioridade"
                              className="text-sm font-medium"
                            >
                              Prioridade
                            </Label>
                            <select
                              id="prioridade"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-jelly-bean-500 focus:ring-jelly-bean-500"
                              value={novaAtividade.prioridade}
                              onChange={(e) =>
                                setNovaAtividade({
                                  ...novaAtividade,
                                  prioridade: e.target.value as
                                    | "Alta"
                                    | "Normal"
                                    | "Baixa",
                                })
                              }
                            >
                              <option value="Alta">Alta</option>
                              <option value="Normal">Normal</option>
                              <option value="Baixa">Baixa</option>
                            </select>
                          </div>

                          {/* Campo Tipo */}
                          <div className="grid w-full items-center gap-1.5">
                            <Label
                              htmlFor="tipo"
                              className="text-sm font-medium"
                            >
                              Tipo
                            </Label>
                            <select
                              id="tipo"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-jelly-bean-500 focus:ring-jelly-bean-500"
                              value={novaAtividade.tipo}
                              onChange={(e) =>
                                setNovaAtividade({
                                  ...novaAtividade,
                                  tipo: e.target.value as
                                    | "Ligar"
                                    | "Whatsapp"
                                    | "Email"
                                    | "Visita"
                                    | "Previsão de fechamento",
                                })
                              }
                            >
                              <option value="ligacao">Ligação</option>
                              <option value="tarefa">Tarefa</option>
                              <option value="reuniao">Reunião</option>
                              <option value="apresentacao">Apresentação</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do modal com botões */}
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-jelly-bean-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-jelly-bean-500 sm:ml-3 sm:w-auto"
                      onClick={handleSaveAtividade}
                    >
                      {modalMode === "create"
                        ? "Criar Atividade"
                        : "Salvar Alterações"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        setIsModalOpen(false);
                        setNovaAtividade({
                          titulo: "",
                          descricao: "",
                          responsavel: "",
                          responsavel_name: "",
                          prioridade: "Normal",
                          tipo: "Ligar",
                          prazo: new Date().toISOString().split("T")[0],
                        });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AtividadesPage;
