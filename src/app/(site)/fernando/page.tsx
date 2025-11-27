"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { Badge } from "@/components/ui/badge";
import { Filter, Calendar, RefreshCw, Search, DollarSign, User, Building } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Saque {
  id: string;
  afiliado_id: string;
  valor: number;
  metodo: string;
  dados_banco: any;
  status: 'pendente' | 'pago' | 'estornado';
  observacao: string | null;
  criado_em: string;
  processado_em: string | null;
  afiliado?: {
    nome_completo: string;
    email: string;
    cnpj: string;
  };
}

interface FiltrosSaques {
  dataInicio: string;
  dataFim: string;
  status: string;
  metodo: string;
  search: string;
}

export default function GerenciarSaques() {
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosSaques>({
    dataInicio: "",
    dataFim: "",
    status: "todos",
    metodo: "todos",
    search: ""
  });

  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchSaques();
    }
  }, [user]);

  const fetchSaques = async () => {
    try {
      setLoading(true);
      
      // Primeiro verifica se o usuário é do tipo fernando
      const { data: afiliado, error: afiliadoError } = await supabase
        .from("afiliados")
        .select("id, tipo")
        .eq("auth_id", user?.id)
        .single();

      if (afiliadoError) {
        throw afiliadoError;
      }

      if (afiliado?.tipo !== 'fernando') {
        toast.error("Acesso não autorizado");
        return;
      }

      // Buscar saques e afiliados separadamente
      let saquesQuery = supabase
        .from("saques")
        .select("*")
        .order('criado_em', { ascending: false });

      // Aplica filtros aos saques
      if (filtros.dataInicio) {
        saquesQuery = saquesQuery.gte('criado_em', `${filtros.dataInicio}T00:00:00`);
      }

      if (filtros.dataFim) {
        saquesQuery = saquesQuery.lte('criado_em', `${filtros.dataFim}T23:59:59`);
      }

      if (filtros.status && filtros.status !== "todos") {
        saquesQuery = saquesQuery.eq('status', filtros.status);
      }

      if (filtros.metodo && filtros.metodo !== "todos") {
        saquesQuery = saquesQuery.eq('metodo', filtros.metodo);
      }

      const { data: saquesData, error: saquesError } = await saquesQuery;

      if (saquesError) {
        throw saquesError;
      }

      if (!saquesData || saquesData.length === 0) {
        setSaques([]);
        return;
      }

      // Buscar informações dos afiliados
      const afiliadoIds = [...new Set(saquesData.map(saque => saque.afiliado_id))];
      
      const { data: afiliadosData, error: afiliadosError } = await supabase
        .from("afiliados")
        .select("id, nome_completo, email, cnpj")
        .in("id", afiliadoIds);

      if (afiliadosError) {
        throw afiliadosError;
      }

      // Combinar os dados
      let saquesComAfiliados = saquesData.map(saque => {
        const afiliado = afiliadosData?.find(af => af.id === saque.afiliado_id);
        
        return {
          ...saque,
          afiliado: afiliado ? {
            nome_completo: afiliado.nome_completo,
            email: afiliado.email,
            cnpj: afiliado.cnpj
          } : undefined
        };
      });

      // Aplicar filtro de pesquisa se existir
      if (filtros.search) {
        const searchLower = filtros.search.toLowerCase();
        saquesComAfiliados = saquesComAfiliados.filter(saque => 
          saque.afiliado && (
            saque.afiliado.nome_completo.toLowerCase().includes(searchLower) ||
            saque.afiliado.email.toLowerCase().includes(searchLower) ||
            saque.afiliado.cnpj.toLowerCase().includes(searchLower)
          )
        );
      }

      setSaques(saquesComAfiliados);
    } catch (error: any) {
      console.error("Erro ao buscar saques:", error);
      toast.error("Erro ao carregar saques");
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusSaque = async (saqueId: string, novoStatus: 'pendente' | 'pago' | 'estornado') => {
    try {
      setAtualizandoStatus(saqueId);
      
      const updates = {
        status: novoStatus,
        processado_em: novoStatus === 'pago' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from("saques")
        .update(updates)
        .eq("id", saqueId);

      if (error) {
        throw error;
      }

      toast.success(`Status atualizado para ${mapStatusParaTexto(novoStatus)}`);
      
      // Atualiza a lista local
      setSaques(prev => prev.map(saque => 
        saque.id === saqueId 
          ? { ...saque, ...updates }
          : saque
      ));
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setAtualizandoStatus(null);
    }
  };

  const mapStatusParaTexto = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pendente': 'Pendente',
      'pago': 'Pago',
      'estornado': 'Estornado'
    };
    return statusMap[status] || status;
  };

  const mapMetodoParaTexto = (metodo: string) => {
    const metodoMap: { [key: string]: string } = {
      'pix': 'PIX',
      'ted': 'TED',
      'doc': 'DOC'
    };
    return metodoMap[metodo] || metodo;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'pendente') {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Pendente</Badge>;
    } else if (statusLower === 'pago') {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Pago</Badge>;
    } else if (statusLower === 'estornado') {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Estornado</Badge>;
    } else {
      return <Badge variant="default">{status}</Badge>;
    }
  };

  const getMetodoBadge = (metodo: string) => {
    const metodoLower = metodo.toLowerCase();
    
    if (metodoLower === 'pix') {
      return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">PIX</Badge>;
    } else if (metodoLower === 'ted') {
      return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">TED</Badge>;
    } else if (metodoLower === 'doc') {
      return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">DOC</Badge>;
    } else {
      return <Badge variant="default">{metodo}</Badge>;
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const handleFiltroChange = (key: keyof FiltrosSaques, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: "",
      dataFim: "",
      status: "todos",
      metodo: "todos",
      search: ""
    });
  };

  // Estatísticas
  const totalSaques = saques.length;
  const totalPendentes = saques.filter(s => s.status === 'pendente').length;
  const totalPagos = saques.filter(s => s.status === 'pago').length;
  const totalEstornados = saques.filter(s => s.status === 'estornado').length;
  const valorTotalPendente = saques
    .filter(s => s.status === 'pendente')
    .reduce((sum, s) => sum + s.valor, 0);

  // Use effect para buscar quando os filtros mudam
  useEffect(() => {
    if (user) {
      fetchSaques();
    }
  }, [filtros.status, filtros.metodo]); // Busca automaticamente quando status ou metodo mudam

  if (loading && saques.length === 0) {
    return (
      <SidebarLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gerenciar Saques</h1>
                <p className="text-gray-400">
                  Gerencie e acompanhe todos os saques dos afiliados
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={fetchSaques}
            variant="outline"
            className="border-gray-600 hover:bg-gray-700 "
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-300">Total de Saques</p>
                  <p className="text-2xl font-bold text-white">{totalSaques}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-yellow-300">Pendentes</p>
                  <p className="text-2xl font-bold text-white">{totalPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-300">Pagos</p>
                  <p className="text-2xl font-bold text-white">{totalPagos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-300">Estornados</p>
                  <p className="text-2xl font-bold text-white">{totalEstornados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-orange-300">Valor Pendente</p>
                  <p className="text-2xl font-bold text-white">{formatarMoeda(valorTotalPendente)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-gray-800/50 border-gray-700 ">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 px-5 mb-5">
              {/* Pesquisa */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="search" className="text-white text-sm">
                  <Search className="w-4 h-4 inline mr-1" />
                  Pesquisar:
                </Label>
                <Input
                  id="search"
                  placeholder="Nome, email ou CNPJ..."
                  value={filtros.search}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              {/* Data Início */}
              <div className="space-y-2">
                <Label htmlFor="dataInicio" className="text-white text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  De:
                </Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              {/* Data Fim */}
              <div className="space-y-2">
                <Label htmlFor="dataFim" className="text-white text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Até:
                </Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white text-sm">
                  Status:
                </Label>
                <Select 
                  value={filtros.status} 
                  onValueChange={(value) => handleFiltroChange('status', value)}
                >
                  <SelectTrigger id="status" className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="estornado">Estornado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Método */}
              <div className="space-y-2">
                <Label htmlFor="metodo" className="text-white text-sm">
                  Método:
                </Label>
                <Select 
                  value={filtros.metodo} 
                  onValueChange={(value) => handleFiltroChange('metodo', value)}
                >
                  <SelectTrigger id="metodo" className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="ted">TED</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botões */}
              <div className="flex items-end gap-2">
                <Button 
                  onClick={fetchSaques}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Aplicar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={limparFiltros}
                  className="flex-1"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Saques */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Todos os Saques</CardTitle>
            <CardDescription className="text-gray-400">
              {saques.length} {saques.length === 1 ? 'saque encontrado' : 'saques encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-white font-medium">Data</TableHead>
                    <TableHead className="text-white font-medium">Afiliado</TableHead>
                    <TableHead className="text-white font-medium">Valor</TableHead>
                    <TableHead className="text-white font-medium">Método</TableHead>
                    <TableHead className="text-white font-medium">Status</TableHead>
                    <TableHead className="text-white font-medium">Observação</TableHead>
                    <TableHead className="text-white font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell colSpan={7} className="text-center text-white py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Carregando saques...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : saques.length === 0 ? (
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell colSpan={7} className="text-center text-white py-8">
                        <DollarSign className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">Nenhum saque encontrado</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {Object.values(filtros).some(val => val && val !== "todos") 
                            ? "Tente ajustar os filtros" 
                            : "Os saques aparecerão aqui"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    saques.map((saque) => (
                      <TableRow key={saque.id} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="text-white font-medium">
                          {formatarData(saque.criado_em)}
                        </TableCell>
                        <TableCell>
                          {saque.afiliado ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-white font-semibold">
                                  {saque.afiliado.nome_completo}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400 text-sm">
                                  {saque.afiliado.cnpj}
                                </span>
                              </div>
                              <div className="text-gray-400 text-sm">
                                {saque.afiliado.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Afiliado não encontrado</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white font-semibold text-lg">
                          {formatarMoeda(saque.valor)}
                        </TableCell>
                        <TableCell>
                          {getMetodoBadge(saque.metodo)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(saque.status)}
                        </TableCell>
                        <TableCell className="text-white text-sm max-w-xs truncate">
                          {saque.observacao || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Select
                              value={saque.status}
                              onValueChange={(value: 'pendente' | 'pago' | 'estornado') => 
                                atualizarStatusSaque(saque.id, value)
                              }
                              disabled={atualizandoStatus === saque.id}
                            >
                              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="pago">Pago</SelectItem>
                                <SelectItem value="estornado">Estornado</SelectItem>
                              </SelectContent>
                            </Select>
                            {atualizandoStatus === saque.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}