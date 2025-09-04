"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  BarChart3,
  Menu,
  Filter,
  Plus,
  Wifi,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  User,
  X,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface SaleCard {
  id: string;
  clientName: string;
  date: string;
  vehicle: string;
  price: string;
  status: "quotation" | "negotiation" | "inspection" | "ready" | "closed";
  tags: string[];
  hasTracker: boolean;
  isAccepted?: boolean;
  isExpired?: boolean;
  daysInStage: number;
  user: string;
  userAvatar?: string;
}

const mockData: SaleCard[] = [
  {
    id: "1",
    clientName: "Hug Hug",
    date: "28/08/2025 - 16:05",
    vehicle: "Fiat, Uno Mille 1.0 Fire/ F.Flex/ ECONOMY 4p 2005",
    price: "R$ 20,00",
    status: "quotation",
    tags: [],
    hasTracker: false,
    daysInStage: 4,
    user: "Hugo",
  },
  {
    id: "2",
    clientName: "Teste Power CRM",
    date: "28/08/2025 - 16:01",
    vehicle: "Fiat, ARGO 1.0 6V Flex 2020",
    price: "R$ 20,00",
    status: "quotation",
    tags: [],
    hasTracker: true,
    daysInStage: 4,
    user: "Hugo",
  },
  {
    id: "3",
    clientName: "Teste Power CRM",
    date: "28/08/2025 - 15:59",
    vehicle: "Fiat, ARGO 1.0 6V Flex 2020",
    price: "R$ 20,00",
    status: "quotation",
    tags: ["Aceita"],
    hasTracker: true,
    isAccepted: true,
    daysInStage: 4,
    user: "Hugo",
  },
  {
    id: "4",
    clientName: "Jurandir",
    date: "28/08/2025 - 14:27",
    vehicle: "JQF3E40 - Fiat, Uno Mille 1.0 Fire/ F.Flex/ ECONOMY 4p 2005",
    price: "R$ 250,00 + R$ 150,00",
    status: "negotiation",
    tags: [],
    hasTracker: false,
    daysInStage: 4,
    user: "Hugo",
  },
  {
    id: "5",
    clientName: "Marilia",
    date: "26/08/2025 - 10:31",
    vehicle: "SYW5103 - Fiat, Strada Freedom 1.3 Flex 8V CD 2024",
    price: "R$ 0,00",
    status: "negotiation",
    tags: [],
    hasTracker: false,
    daysInStage: 6,
    user: "Rodrigo",
  },
  {
    id: "6",
    clientName: "Teste",
    date: "18/08/2025 - 13:54",
    vehicle: "PLA-5961 - Honda, HR-V LX 1.8 Flexone 16V 5p Aut. 2018",
    price: "R$ 500,00",
    status: "negotiation",
    tags: [],
    hasTracker: false,
    daysInStage: 14,
    user: "Hugo",
  },
];

const columns = [
  {
    id: "quotation",
    title: "Cotações recebidas",
    count: mockData.filter((card) => card.status === "quotation").length,
    color: "bg-blue-50",
  },
  {
    id: "negotiation",
    title: "Em negociação",
    count: mockData.filter((card) => card.status === "negotiation").length,
    color: "bg-orange-50",
  },
  {
    id: "inspection",
    title: "Vistorias",
    count: 0,
    color: "bg-purple-50",
  },
  {
    id: "ready",
    title: "Liberadas para cadastro",
    count: 0,
    color: "bg-green-50",
  },
  {
    id: "closed",
    title: "Vendas concretizadas",
    count: 0,
    color: "bg-emerald-50",
  },
];

// Estados do modal
interface NewNegotiationForm {
  cooperativa: string;
  tipoVeiculo: string;
  placa: string;
  marca: string;
  anoModelo: string;
  modelo: string;
  nomeContato: string;
  email: string;
  celular: string;
  estado: string;
  cidade: string;
  origemLead: string;
  subOrigemLead: string;
  veiculoTrabalho: boolean;
  enviarCotacao: boolean;
}

export default function VendasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState(3);
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

  // Estados dos filtros
  const [filterData, setFilterData] = useState({
    tipoData: "0",
    dataInicial: "",
    dataFinal: "",
    cooperativas: [] as string[],
    usuarios: [] as string[],
    origem: [] as string[],
    subOrigem: [] as string[],
    tagsAutomaticas: "0",
    // Filtros de checkbox
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

  const getCardsForColumn = (status: string) => {
    return cards.filter((card) => card.status === status);
  };

  const handleFormChange = (
    field: keyof NewNegotiationForm,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFilterChange = (field: keyof typeof filterData, value: any) => {
    setFilterData((prev) => ({
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

  const handleFilterSubmit = () => {
    console.log("Filtros aplicados:", filterData);
    // Aqui você implementaria a lógica para aplicar os filtros
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

  const renderCard = (card: SaleCard) => (
    <Card
      key={card.id}
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <CardContent className="p-4">
        {/* Header com indicadores de temperatura */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step <= 2
                    ? "bg-yellow-400"
                    : step <= 4
                      ? "bg-orange-400"
                      : step <= 6
                        ? "bg-red-400"
                        : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {card.hasTracker && (
              <Badge variant="gray" className="text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Rastreador
              </Badge>
            )}
            {card.isAccepted && (
              <Badge variant="green" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Aceita
              </Badge>
            )}
            {card.isExpired && (
              <Badge variant="red" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Expirada
              </Badge>
            )}
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {card.clientName}
            </span>
            <span className="text-xs text-gray-500">• {card.date}</span>
          </div>
          <p className="text-sm text-gray-700 font-medium">{card.vehicle}</p>
          <div className="text-sm font-bold text-green-600">{card.price}</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">
                Sem atividade pendente
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Indicador de dias */}
            <div className="flex space-x-1">
              {[1, 2, 3].map((day) => (
                <div
                  key={day}
                  className={`w-2 h-2 rounded-full ${
                    day <= card.daysInStage ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            {/* Avatar do usuário */}
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            {/* Botão de ações */}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
            <h1 className="text-3xl font-bold text-gray-900">
              Funil de Vendas
            </h1>
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

            {/* Filtros */}
            <Dialog
              open={isFilterModalOpen}
              onOpenChange={setIsFilterModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtrar</span>
                  <Badge variant="gray" className="ml-2">
                    {activeFilters}
                  </Badge>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-8">
                <DialogHeader className="pb-6">
                  <DialogTitle className="flex items-center justify-between text-2xl font-bold">
                    <span>Filtros</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFilterModalOpen(false)}
                      className="h-10 w-10 hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-8">
                  {/* Filtros de Data */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b-2 border-blue-200 pb-3 text-blue-800">
                      📅 Filtros de Data
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-2">
                        <Label
                          htmlFor="tipoData"
                          className="text-base font-medium mb-3 block"
                        >
                          Tipo de data
                        </Label>
                        <Select
                          value={filterData.tipoData}
                          onValueChange={(value) =>
                            handleFilterChange("tipoData", value)
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Data de criação</SelectItem>
                            <SelectItem value="13">
                              Data de atualização
                            </SelectItem>
                            <SelectItem value="10">
                              Data de pagamento
                            </SelectItem>
                            <SelectItem value="11">
                              Data de cadastro SGA
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="dataInicial"
                          className="text-base font-medium mb-3 block"
                        >
                          Data inicial
                        </Label>
                        <Input
                          id="dataInicial"
                          type="date"
                          value={filterData.dataInicial}
                          onChange={(e) =>
                            handleFilterChange("dataInicial", e.target.value)
                          }
                          className="h-12 text-base"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="dataFinal"
                          className="text-base font-medium mb-3 block"
                        >
                          Data final
                        </Label>
                        <Input
                          id="dataFinal"
                          type="date"
                          value={filterData.dataFinal}
                          onChange={(e) =>
                            handleFilterChange("dataFinal", e.target.value)
                          }
                          className="h-12 text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filtros de Seleção Múltipla */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Filtros de Seleção
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="cooperativas">Cooperativas</Label>
                        <Select
                          value={filterData.cooperativas[0] || ""}
                          onValueChange={(value) =>
                            handleFilterChange("cooperativas", [value])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="11375">
                              ALLIANCAR CLUB
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="usuarios">Usuários</Label>
                        <Select
                          value={filterData.usuarios[0] || ""}
                          onValueChange={(value) =>
                            handleFilterChange("usuarios", [value])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="102447">
                              Suporte PowerCRM
                            </SelectItem>
                            <SelectItem value="104079">Daniel</SelectItem>
                            <SelectItem value="123998">
                              Marcel Araújo
                            </SelectItem>
                            <SelectItem value="124886">
                              Allan Fernandes de Almeida
                            </SelectItem>
                            <SelectItem value="124939">
                              Ricardo Henrique Brandao Andrade
                            </SelectItem>
                            <SelectItem value="124977">Sousa</SelectItem>
                            <SelectItem value="124980">
                              Rodrigo Ruvenat dos Santos Calixto
                            </SelectItem>
                            <SelectItem value="125000">Cardoso</SelectItem>
                            <SelectItem value="132055">Teste Teste</SelectItem>
                            <SelectItem value="133236">
                              Caio Henrique Pereira Santos
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="origem">Origem</Label>
                        <Select
                          value={filterData.origem[0] || ""}
                          onValueChange={(value) =>
                            handleFilterChange("origem", [value])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="14584">Facebook</SelectItem>
                            <SelectItem value="14585">Google</SelectItem>
                            <SelectItem value="14586">Indicação</SelectItem>
                            <SelectItem value="14587">Instagram</SelectItem>
                            <SelectItem value="18180">Marcel</SelectItem>
                            <SelectItem value="14840">Presencial</SelectItem>
                            <SelectItem value="14588">Site</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="subOrigem">Sub origem</Label>
                        <Select
                          value={filterData.subOrigem[0] || "none"}
                          onValueChange={(value) =>
                            handleFilterChange(
                              "subOrigem",
                              value === "none" ? [] : [value],
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="tagsAutomaticas">
                          Tags automáticas
                        </Label>
                        <Select
                          value={filterData.tagsAutomaticas}
                          onValueChange={(value) =>
                            handleFilterChange("tagsAutomaticas", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Selecione</SelectItem>
                            <SelectItem value="5">
                              Mostrar cotações do website
                            </SelectItem>
                            <SelectItem value="6">
                              Mostrar cotações de hotlink
                            </SelectItem>
                            <SelectItem value="7">
                              Mostrar cotações da pipeline
                            </SelectItem>
                            <SelectItem value="8">
                              Mostrar cotações de listas importadas
                            </SelectItem>
                            <SelectItem value="9">
                              Mostrar cotações de afiliados
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Filtros de Checkbox */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Filtros Específicos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cartoesArquivados"
                          checked={filterData.cartoesArquivados}
                          onChange={(e) =>
                            handleFilterChange(
                              "cartoesArquivados",
                              e.target.checked,
                            )
                          }
                        />
                        <Label htmlFor="cartoesArquivados" className="text-sm">
                          Mostrar apenas cartões arquivados
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cotaçõesPagas"
                          checked={filterData.cotaçõesPagas}
                          onChange={(e) =>
                            handleFilterChange(
                              "cotaçõesPagas",
                              e.target.checked,
                            )
                          }
                        />
                        <Label htmlFor="cotaçõesPagas" className="text-sm">
                          Mostrar apenas cotações pagas
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="boletosNaoPagos"
                          checked={filterData.boletosNaoPagos}
                          onChange={(e) =>
                            handleFilterChange(
                              "boletosNaoPagos",
                              e.target.checked,
                            )
                          }
                        />
                        <Label htmlFor="boletosNaoPagos" className="text-sm">
                          Mostrar boletos gerados e não pagos
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="instalacaoRastreador"
                          checked={filterData.instalacaoRastreador}
                          onChange={(e) =>
                            handleFilterChange(
                              "instalacaoRastreador",
                              e.target.checked,
                            )
                          }
                        />
                        <Label
                          htmlFor="instalacaoRastreador"
                          className="text-sm"
                        >
                          Instalação de Rastreador
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cartoesExpirados"
                          checked={filterData.cartoesExpirados}
                          onChange={(e) =>
                            handleFilterChange(
                              "cartoesExpirados",
                              e.target.checked,
                            )
                          }
                        />
                        <Label htmlFor="cartoesExpirados" className="text-sm">
                          Mostrar apenas cartões expirados
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cartoesAceitos"
                          checked={filterData.cartoesAceitos}
                          onChange={(e) =>
                            handleFilterChange(
                              "cartoesAceitos",
                              e.target.checked,
                            )
                          }
                        />
                        <Label htmlFor="cartoesAceitos" className="text-sm">
                          Mostrar apenas cartões aceitos
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cartoesNaoAtendidos"
                          checked={filterData.cartoesNaoAtendidos}
                          onChange={(e) =>
                            handleFilterChange(
                              "cartoesNaoAtendidos",
                              e.target.checked,
                            )
                          }
                        />
                        <Label
                          htmlFor="cartoesNaoAtendidos"
                          className="text-sm"
                        >
                          Mostrar apenas cartões não atendidos
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ordenarAntigas"
                          checked={filterData.ordenarAntigas}
                          onChange={(e) =>
                            handleFilterChange(
                              "ordenarAntigas",
                              e.target.checked,
                            )
                          }
                        />
                        <Label htmlFor="ordenarAntigas" className="text-sm">
                          Ordenar cartões pelas mais antigas
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsFilterModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleFilterSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Nova Negociação */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Negociação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-8">
                <DialogHeader className="pb-6">
                  <DialogTitle className="flex items-center justify-between text-2xl font-bold">
                    <span>➕ Nova Negociação</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsModalOpen(false)}
                      className="h-10 w-10 hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  className="space-y-8"
                >
                  {/* Dados do Veículo */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b-2 border-blue-200 pb-3 text-blue-800">
                      🚗 Dados do Veículo
                    </h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div>
                        <Label
                          htmlFor="cooperativa"
                          className="text-base font-medium mb-3 block"
                        >
                          Cooperativa *
                        </Label>
                        <Select
                          value={formData.cooperativa}
                          onValueChange={(value) =>
                            handleFormChange("cooperativa", value)
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="11375">
                              ALLIANCAR CLUB
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="tipoVeiculo"
                          className="text-base font-medium mb-3 block"
                        >
                          Tipo de veículo *
                        </Label>
                        <Select
                          value={formData.tipoVeiculo}
                          onValueChange={(value) =>
                            handleFormChange("tipoVeiculo", value)
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">
                              Carro/utilitário pequeno
                            </SelectItem>
                            <SelectItem value="1">Moto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="placa"
                          className="text-base font-medium mb-3 block"
                        >
                          Placa *
                        </Label>
                        <Input
                          id="placa"
                          type="text"
                          value={formData.placa}
                          onChange={(e) =>
                            handleFormChange(
                              "placa",
                              e.target.value.toUpperCase(),
                            )
                          }
                          placeholder="ABC-1234"
                          className="h-12 text-base font-mono"
                          maxLength={8}
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="marca"
                          className="text-base font-medium mb-3 block"
                        >
                          Marca *
                        </Label>
                        <Select
                          value={formData.marca}
                          onValueChange={(value) =>
                            handleFormChange("marca", value)
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fiat">Fiat</SelectItem>
                            <SelectItem value="chevrolet">Chevrolet</SelectItem>
                            <SelectItem value="volkswagen">
                              Volkswagen
                            </SelectItem>
                            <SelectItem value="ford">Ford</SelectItem>
                            <SelectItem value="honda">Honda</SelectItem>
                            <SelectItem value="toyota">Toyota</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="anoModelo"
                          className="text-base font-medium mb-3 block"
                        >
                          Ano modelo *
                        </Label>
                        <Select
                          value={formData.anoModelo}
                          onValueChange={(value) =>
                            handleFormChange("anoModelo", value)
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 26 }, (_, i) => 2025 - i).map(
                              (year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="modelo"
                          className="text-base font-medium mb-3 block"
                        >
                          Modelo *
                        </Label>
                        <Select
                          value={formData.modelo}
                          onValueChange={(value) =>
                            handleFormChange("modelo", value)
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="palio">Palio</SelectItem>
                            <SelectItem value="gol">Gol</SelectItem>
                            <SelectItem value="onix">Onix</SelectItem>
                            <SelectItem value="ka">Ka</SelectItem>
                            <SelectItem value="civic">Civic</SelectItem>
                            <SelectItem value="corolla">Corolla</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Cliente */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b-2 border-green-200 pb-3 text-green-800">
                      👤 Dados do Cliente
                    </h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div>
                        <Label
                          htmlFor="nomeContato"
                          className="text-base font-medium mb-3 block"
                        >
                          Nome para contato *
                        </Label>
                        <Input
                          id="nomeContato"
                          type="text"
                          value={formData.nomeContato}
                          onChange={(e) =>
                            handleFormChange("nomeContato", e.target.value)
                          }
                          placeholder="Nome completo"
                          className="h-12 text-base"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="email"
                          className="text-base font-medium mb-3 block"
                        >
                          E-mail
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleFormChange("email", e.target.value)
                          }
                          placeholder="email@exemplo.com"
                          className="h-12 text-base"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="celular"
                          className="text-base font-medium mb-3 block"
                        >
                          Celular
                        </Label>
                        <Input
                          id="celular"
                          type="tel"
                          value={formData.celular}
                          onChange={(e) =>
                            handleFormChange("celular", e.target.value)
                          }
                          placeholder="(11) 99999-9999"
                          className="h-12 text-base"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="estado"
                          className="text-base font-medium mb-3 block"
                        >
                          Estado
                        </Label>
                        <Select
                          value={formData.estado}
                          onValueChange={(value) =>
                            handleFormChange("estado", value)
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sp">São Paulo</SelectItem>
                            <SelectItem value="rj">Rio de Janeiro</SelectItem>
                            <SelectItem value="mg">Minas Gerais</SelectItem>
                            <SelectItem value="rs">
                              Rio Grande do Sul
                            </SelectItem>
                            <SelectItem value="pr">Paraná</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="cidade"
                          className="text-base font-medium mb-3 block"
                        >
                          Cidade
                        </Label>
                        <Input
                          id="cidade"
                          type="text"
                          value={formData.cidade}
                          onChange={(e) =>
                            handleFormChange("cidade", e.target.value)
                          }
                          placeholder="Nome da cidade"
                          className="h-12 text-base"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="origemLead"
                          className="text-base font-medium mb-3 block"
                        >
                          Origem do lead
                        </Label>
                        <Select
                          value={formData.origemLead}
                          onValueChange={(value) =>
                            handleFormChange("origemLead", value)
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Selecione</SelectItem>
                            <SelectItem value="14584">Facebook</SelectItem>
                            <SelectItem value="14585">Google</SelectItem>
                            <SelectItem value="14586">Indicação</SelectItem>
                            <SelectItem value="14587">Instagram</SelectItem>
                            <SelectItem value="14840">Presencial</SelectItem>
                            <SelectItem value="14588">Site</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Opções Adicionais */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b-2 border-purple-200 pb-3 text-purple-800">
                      ⚙️ Opções Adicionais
                    </h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id="veiculoTrabalho"
                          checked={formData.veiculoTrabalho}
                          onChange={(e) =>
                            handleFormChange(
                              "veiculoTrabalho",
                              e.target.checked,
                            )
                          }
                          className="w-5 h-5"
                        />
                        <Label
                          htmlFor="veiculoTrabalho"
                          className="text-base cursor-pointer"
                        >
                          Veículo de trabalho (Táxi/Uber)?
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id="enviarCotacao"
                          checked={formData.enviarCotacao}
                          onChange={(e) =>
                            handleFormChange("enviarCotacao", e.target.checked)
                          }
                          className="w-5 h-5"
                        />
                        <Label
                          htmlFor="enviarCotacao"
                          className="text-base cursor-pointer"
                        >
                          Enviar cotação por e-mail
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end space-x-4 pt-8 border-t-2 border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="h-12 px-8 text-base font-medium"
                    >
                      ❌ Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="h-12 px-8 text-base font-medium bg-green-600 hover:bg-green-700 shadow-lg"
                    >
                      ✅ Criar Negociação
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Pipeline de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`${column.color} rounded-lg p-4`}
            onDragOver={onDragOver}
            onDrop={(ev) => onDropTo(ev, column.id as SaleCard["status"])}
          >
            {/* Header da coluna */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <p className="text-sm text-gray-600">
                  {column.count === 0
                    ? "nenhuma encontrada"
                    : `${column.count} encontrada${column.count !== 1 ? "s" : ""}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* Cards da coluna */}
            <div className="space-y-3">
              {getCardsForColumn(column.id).map(renderCard)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
