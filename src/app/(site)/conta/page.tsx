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
import { Users, TrendingUp, DollarSign, Package, Filter, Calendar, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DashboardData {
  afiliado_id: string;
  total_clientes: number;
  pagamentos_a_receber: number;
  mensalidades_a_receber: number;
  total_bruto: number;
  total_sacado: number;
  total_pendente_saque: number;
  total_a_receber: number;
  total_acumulado: number;
  detalhes: {
    clientes: number;
    pagamentos_confirmados: number;
    assinaturas_ativas: number;
    valor_total_mensalidades: number;
    total_saques: number;
    saques_pagos: number;
    saques_pendentes: number;
  };
}

interface Venda {
  id: string;
  data_criacao: string;
  tipo: 'pagamento' | 'assinatura';
  status: string;
  valor: number;
  descricao?: string;
  cliente_nome?: string;
  cliente_email?: string;
  externalReference?: string;
}

interface AfiliadoInfo {
  id: string;
  nome_completo: string;
  email: string;
  porcentagem_comissao: number;
  super_admin: boolean;
}

export default function MinhasVendas() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [afiliados, setAfiliados] = useState<AfiliadoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVendas, setLoadingVendas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [afiliadoSelecionado, setAfiliadoSelecionado] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const supabase = createClient();
  const { user } = useUser();

  // Mapear status do Asaas para português - AGORA DEFINIDAS CORRETAMENTE
  const mapPaymentStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'RECEIVED': 'Recebido',
      'CONFIRMED': 'Confirmado',
      'OVERDUE': 'Atrasado',
      'REFUNDED': 'Estornado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const mapSubscriptionStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Ativa',
      'EXPIRED': 'Expirada',
      'CANCELLED': 'Cancelada',
      'INACTIVE': 'Inativa'
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    if (user) {
      checkAdmin();
    }
  }, [user]);

  useEffect(() => {
    if (user && isAdmin !== null) {
      fetchAfiliados();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && afiliadoSelecionado) {
      fetchDashboardData();
      fetchVendas();
    }
  }, [user, afiliadoSelecionado, filtroDataInicio, filtroDataFim, filtroStatus, filtroTipo]);

  const checkAdmin = async () => {
    try {
      const { data: afiliado } = await supabase
        .from("afiliados")
        .select("super_admin")
        .eq("auth_id", user?.id)
        .single();
      
      setIsAdmin(afiliado?.super_admin || false);
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      setIsAdmin(false);
    }
  };

  const fetchAfiliados = async () => {
    try {
      if (isAdmin) {
        // Admin: busca TODOS os afiliados
        const { data: afiliadosData, error: afiliadosError } = await supabase
          .from("afiliados")
          .select("id, nome_completo, email, porcentagem_comissao, super_admin");

        if (afiliadosError) {
          throw afiliadosError;
        }

        setAfiliados(afiliadosData || []);
        if (afiliadosData && afiliadosData.length > 0) {
          setAfiliadoSelecionado(afiliadosData[0].id);
        }
      } else {
        // Afiliado normal: busca apenas seus dados
        const { data: afiliado, error: afiliadoError } = await supabase
          .from("afiliados")
          .select("id, nome_completo, email, porcentagem_comissao, super_admin")
          .eq("auth_id", user?.id)
          .single();

        if (afiliadoError) {
          throw afiliadoError;
        }

        if (afiliado) {
          setAfiliados([afiliado]);
          setAfiliadoSelecionado(afiliado.id);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar afiliados:", error);
      toast.error("Erro ao carregar dados dos afiliados");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/dashboard?afiliadoId=${afiliadoSelecionado}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do dashboard');
      }

      const dashboardResponse = await response.json();
      
      if (dashboardResponse.success) {
        setDashboard(dashboardResponse.data);
      } else {
        throw new Error(dashboardResponse.error || 'Erro ao carregar dados');
      }
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      setError("Erro ao carregar dados financeiros");
    } finally {
      // Garantir que o loading seja sempre resetado
      setLoading(false);
    }
  };

  const fetchVendas = async () => {
    if (!afiliadoSelecionado) return;

    try {
      setLoadingVendas(true);
      setError(null);

      console.log("🔄 Buscando vendas para afiliado:", afiliadoSelecionado);

      // Buscar pagamentos do Asaas
      const paymentsResponse = await fetch(
        `/api/asaas-proxy?endpoint=payments&externalReference=${afiliadoSelecionado}`
      );

      if (!paymentsResponse.ok) {
        throw new Error('Erro ao buscar pagamentos do Asaas');
      }

      const paymentsData = await paymentsResponse.json();
      const payments = paymentsData.data || [];

      console.log("📄 Pagamentos encontrados:", payments.length);

      // Buscar assinaturas do Asaas
      const subscriptionsResponse = await fetch(
        `/api/asaas-proxy?endpoint=subscriptions&externalReference=${afiliadoSelecionado}`
      );

      if (!subscriptionsResponse.ok) {
        throw new Error('Erro ao buscar assinaturas do Asaas');
      }

      const subscriptionsData = await subscriptionsResponse.json();
      const subscriptions = subscriptionsData.data || [];

      console.log("📋 Assinaturas encontradas:", subscriptions.length);

      // Transformar pagamentos em vendas - CORRIGIDO: removido this.
      const vendasPagamentos: Venda[] = payments.map((payment: any) => ({
        id: payment.id,
        data_criacao: payment.dateCreated,
        tipo: 'pagamento',
        status: mapPaymentStatus(payment.status),
        valor: payment.value,
        descricao: payment.description,
        cliente_nome: payment.customerName || 'Cliente',
        cliente_email: payment.customerEmail,
        externalReference: payment.externalReference
      }));

      // Transformar assinaturas em vendas - CORRIGIDO: removido this.
      const vendasAssinaturas: Venda[] = subscriptions.map((subscription: any) => ({
        id: subscription.id,
        data_criacao: subscription.dateCreated,
        tipo: 'assinatura',
        status: mapSubscriptionStatus(subscription.status),
        valor: subscription.value,
        descricao: subscription.description,
        cliente_nome: subscription.customerName || 'Cliente',
        cliente_email: subscription.customerEmail,
        externalReference: subscription.externalReference
      }));

      // Combinar e ordenar por data
      const todasVendas = [...vendasPagamentos, ...vendasAssinaturas].sort((a, b) => 
        new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
      );

      console.log("💰 Total de vendas combinadas:", todasVendas.length);

      // Aplicar filtros
      let vendasFiltradas = todasVendas;

      if (filtroDataInicio) {
        vendasFiltradas = vendasFiltradas.filter(venda => 
          new Date(venda.data_criacao) >= new Date(filtroDataInicio)
        );
      }

      if (filtroDataFim) {
        vendasFiltradas = vendasFiltradas.filter(venda => 
          new Date(venda.data_criacao) <= new Date(filtroDataFim + 'T23:59:59')
        );
      }

      if (filtroStatus && filtroStatus !== "todos") {
        vendasFiltradas = vendasFiltradas.filter(venda => 
          venda.status.toLowerCase() === filtroStatus.toLowerCase()
        );
      }

      if (filtroTipo && filtroTipo !== "todos") {
        vendasFiltradas = vendasFiltradas.filter(venda => venda.tipo === filtroTipo);
      }

      setVendas(vendasFiltradas);
      console.log("✅ Vendas carregadas com sucesso:", vendasFiltradas.length);

    } catch (err: any) {
      console.error("❌ Erro ao buscar vendas:", err);
      setError(err.message || "Erro ao carregar vendas do Asaas");
      toast.error("Erro ao carregar vendas");
    } finally {
      setLoadingVendas(false);
      setLoading(false);
    }
  };

  const formatarData = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("pt-BR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Data inválida";
    }
  };

  const formatarMoeda = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('pendente') || statusLower.includes('pending')) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">{status}</Badge>;
    } else if (statusLower.includes('recebido') || statusLower.includes('confirmed') || statusLower.includes('active') || statusLower.includes('ativa')) {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">{status}</Badge>;
    } else if (statusLower.includes('cancelado') || statusLower.includes('cancelled') || statusLower.includes('inativa')) {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">{status}</Badge>;
    } else if (statusLower.includes('atrasado') || statusLower.includes('overdue') || statusLower.includes('expirada')) {
      return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">{status}</Badge>;
    } else {
      return <Badge variant="blue" className="border-gray-600 text-gray-300">{status}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    if (tipo === 'pagamento') {
      return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Pagamento</Badge>;
    } else {
      return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Assinatura</Badge>;
    }
  };

  const afiliadoAtual = afiliados.find(a => a.id === afiliadoSelecionado);
  const comissaoPercentual = afiliadoAtual?.porcentagem_comissao || 0.03;

  // Calcular totais baseados nas vendas filtradas
  const totalValorVendas = vendas.reduce((sum, v) => sum + (v.valor || 0), 0);
  const totalComissao = totalValorVendas * comissaoPercentual;

  // Totais gerais para admin
  const totaisGerais = {
    totalAfiliados: afiliados.length,
    totalClientes: dashboard?.total_clientes || 0,
    totalAssinaturas: dashboard?.detalhes.assinaturas_ativas || 0,
    totalComissao: dashboard?.total_acumulado || 0
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchVendas();
    toast.success("Dados atualizados com sucesso!");
  };

  if (loading && !dashboard) {
    return (
      <SidebarLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
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
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isAdmin ? "Dashboard Financeiro" : "Minhas Vendas"}
                </h1>
                <p className="text-gray-400">
                  {isAdmin ? "Visão geral de todos os afiliados" : "Acompanhe suas vendas e comissões"}
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-gray-600 hover:bg-gray-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Seletor de Afiliado (só para admin) */}
        {isAdmin && afiliados.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-gray-400" />
                <Label htmlFor="afiliado-select" className="text-white text-sm font-medium">
                  Selecionar Afiliado:
                </Label>
                <Select value={afiliadoSelecionado} onValueChange={setAfiliadoSelecionado}>
                  <SelectTrigger id="afiliado-select" className="w-64 bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione um afiliado" />
                  </SelectTrigger>
                  <SelectContent>
                    {afiliados.map((afiliado) => (
                      <SelectItem key={afiliado.id} value={afiliado.id}>
                        {afiliado.nome_completo} ({afiliado.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards do Dashboard Geral (Admin) */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Total Afiliados</p>
                    <p className="text-2xl font-bold text-white">{totaisGerais.totalAfiliados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Package className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-green-300">Total Clientes</p>
                    <p className="text-2xl font-bold text-white">{totaisGerais.totalClientes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-300">Assinaturas Ativas</p>
                    <p className="text-2xl font-bold text-white">{totaisGerais.totalAssinaturas}</p>
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
                    <p className="text-sm text-orange-300">Comissão Total</p>
                    <p className="text-2xl font-bold text-white">{formatarMoeda(totaisGerais.totalComissao)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cards do Afiliado Selecionado */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Clientes</p>
                    <p className="text-2xl font-bold text-white">{dashboard.total_clientes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-green-300">Assinaturas Ativas</p>
                    <p className="text-2xl font-bold text-white">{dashboard.detalhes.assinaturas_ativas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-300">Valor Mensalidades</p>
                    <p className="text-2xl font-bold text-white">{formatarMoeda(dashboard.detalhes.valor_total_mensalidades)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Package className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-300">Comissão 3%</p>
                    <p className="text-2xl font-bold text-white">{formatarMoeda(dashboard.mensalidades_a_receber)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio" className="text-white text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  De:
                </Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim" className="text-white text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Até:
                </Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white text-sm">
                  Status:
                </Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger id="status" className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="recebido">Recebido</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-white text-sm">
                  Tipo:
                </Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger id="tipo" className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pagamento">Pagamentos</SelectItem>
                    <SelectItem value="assinatura">Assinaturas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={fetchVendas} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Aplicar Filtros
                </Button>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFiltroDataInicio("");
                    setFiltroDataFim("");
                    setFiltroStatus("");
                    setFiltroTipo("");
                  }}
                  className="w-full border-gray-600 hover:bg-gray-700 text-white"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totais das vendas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-blue-300">Valor Total Vendas</p>
              <p className="text-2xl font-bold text-white">{formatarMoeda(totalValorVendas)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-green-300">Comissão Total</p>
              <p className="text-2xl font-bold text-white">{formatarMoeda(totalComissao)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-purple-300">Porcentagem</p>
              <p className="text-2xl font-bold text-white">
                {totalValorVendas > 0 ? `${(comissaoPercentual * 100).toFixed(1)}%` : "0%"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Vendas */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {isAdmin ? `Vendas - ${afiliadoAtual?.nome_completo || 'Afiliado'}` : 'Minhas Vendas'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {vendas.length} {vendas.length === 1 ? 'venda encontrada' : 'vendas encontradas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-white font-medium">Data</TableHead>
                    <TableHead className="text-white font-medium">Cliente</TableHead>
                    <TableHead className="text-white font-medium">Valor</TableHead>
                    <TableHead className="text-white font-medium">Tipo</TableHead>
                    <TableHead className="text-white font-medium">Status</TableHead>
                    <TableHead className="text-white font-medium">Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingVendas ? (
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell colSpan={6} className="text-center text-white py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Carregando vendas...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : vendas.length === 0 ? (
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell colSpan={6} className="text-center text-white py-8">
                        <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">Nenhuma venda encontrada</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {filtroDataInicio || filtroDataFim || filtroStatus || filtroTipo
                            ? "Tente ajustar os filtros" 
                            : "Suas vendas aparecerão aqui"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendas.map((venda) => (
                      <TableRow key={venda.id} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="text-white font-medium">
                          {formatarData(venda.data_criacao)}
                        </TableCell>
                        <TableCell className="text-white">
                          <div>
                            <div className="font-semibold">{venda.cliente_nome}</div>
                            <div className="text-sm text-gray-400">{venda.cliente_email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          {formatarMoeda(venda.valor)}
                        </TableCell>
                        <TableCell>
                          {getTipoBadge(venda.tipo)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(venda.status)}
                        </TableCell>
                        <TableCell className="text-white text-sm">
                          {venda.descricao || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-300">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Erro: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}