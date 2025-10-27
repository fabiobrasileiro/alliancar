"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
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

interface DashboardData {
  afiliado_id: string;
  nome_completo: string;
  email: string;
  porcentagem_comissao: number;
  ativo: boolean;
  total_clientes: number;
  total_assinaturas: number;
  valor_assinaturas: number;
  total_pagamentos: number;
  valor_pagamentos: number;
  comissao_assinaturas: number;
  comissao_pagamentos: number;
  comissao_total: number;
}

interface Venda {
  id: string;
  data_criacao: string;
  placa_veiculo: string;
  valor_adesao: number;
  tipo: string;
  status: string;
}

export default function MinhasVendas() {
  const [dashboard, setDashboard] = useState<DashboardData[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [afiliadoSelecionado, setAfiliadoSelecionado] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      checkAdmin();
      fetchDashboard();
    }
  }, [user]);

  useEffect(() => {
    if (user && afiliadoSelecionado) {
      fetchVendas();
    }
  }, [user, afiliadoSelecionado, filtroDataInicio, filtroDataFim, filtroStatus]);

  const checkAdmin = async () => {
    const { data: afiliado } = await supabase
      .from("afiliados")
      .select("super_admin")
      .eq("auth_id", user?.id)
      .single();
    
    setIsAdmin(afiliado?.super_admin || false);
  };

  const fetchDashboard = async () => {
    try {
      if (isAdmin) {
        // Admin: busca TODOS os afiliados
        const { data: dashboardData, error: dashboardError } = await supabase
          .from("financeiro_dashboard")
          .select("*");

        if (dashboardError) {
          console.error("Erro ao buscar dashboard:", dashboardError);
          return;
        }

        setDashboard(dashboardData || []);
        // Seleciona o primeiro afiliado por padrão
        if (dashboardData && dashboardData.length > 0) {
          setAfiliadoSelecionado(dashboardData[0].afiliado_id);
        }
      } else {
        // Afiliado normal: busca apenas seus dados
        const { data: afiliado } = await supabase
          .from("afiliados")
          .select("id")
          .eq("auth_id", user?.id)
          .single();

        if (!afiliado) return;

        const { data: dashboardData, error: dashboardError } = await supabase
          .from("financeiro_dashboard")
          .select("*")
          .eq("afiliado_id", afiliado.id)
          .single();

        if (dashboardError) {
          console.error("Erro ao buscar dashboard:", dashboardError);
          return;
        }

        setDashboard([dashboardData]);
        setAfiliadoSelecionado(afiliado.id);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
  };

  const fetchVendas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Busca o form_link do afiliado selecionado
      const { data: afiliado } = await supabase
        .from("afiliados")
        .select("form_link, porcentagem_comissao")
        .eq("id", afiliadoSelecionado)
        .single();

      if (!afiliado?.form_link) {
        setVendas([]);
        return;
      }

      let query = supabase
        .from("formularios")
        .select("id, data_criacao, placa_veiculo, valor_adesao, status, tipo")
        .eq("codigo_formulario", afiliado.form_link);

      if (filtroDataInicio) query = query.gte("data_criacao", filtroDataInicio);
      if (filtroDataFim) query = query.lte("data_criacao", filtroDataFim);
      if (filtroStatus && filtroStatus !== "todos")
        query = query.eq("status", filtroStatus);

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar formulários:", error);
        setError(error.message);
        return;
      }

      setVendas((data as Venda[]) || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  const formatarMoeda = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  const afiliadoAtual = dashboard.find(a => a.afiliado_id === afiliadoSelecionado);
  const comissaoPercentual = afiliadoAtual?.porcentagem_comissao || 0;
  const totalValor = vendas.reduce((sum, v) => sum + (v.valor_adesao || 0), 0);
  const totalComissao = totalValor * comissaoPercentual;

  // Totais gerais para admin
  const totaisGerais = {
    totalClientes: dashboard.reduce((sum, a) => sum + a.total_clientes, 0),
    totalAssinaturas: dashboard.reduce((sum, a) => sum + a.total_assinaturas, 0),
    totalComissao: dashboard.reduce((sum, a) => sum + a.comissao_total, 0),
    totalAfiliados: dashboard.length
  };

  return (
    <SidebarLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          {isAdmin ? "Dashboard Financeiro - Todos os Afiliados" : "Minhas Vendas"}
        </h2>

        {/* Seletor de Afiliado (só para admin) */}
        {isAdmin && dashboard.length > 0 && (
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Selecionar Afiliado:</span>
              <Select value={afiliadoSelecionado} onValueChange={setAfiliadoSelecionado}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecione um afiliado" />
                </SelectTrigger>
                <SelectContent>
                  {dashboard.map((afiliado) => (
                    <SelectItem key={afiliado.afiliado_id} value={afiliado.afiliado_id}>
                      {afiliado.nome_completo} ({afiliado.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}

        {/* Cards do Dashboard Geral (Admin) */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-sm text-gray-600">Total Afiliados</div>
              <div className="text-xl font-bold text-blue-600">
                {totaisGerais.totalAfiliados}
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-sm text-gray-600">Total Clientes</div>
              <div className="text-xl font-bold text-green-600">
                {totaisGerais.totalClientes}
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-sm text-gray-600">Total Assinaturas</div>
              <div className="text-xl font-bold text-purple-600">
                {totaisGerais.totalAssinaturas}
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-sm text-gray-600">Comissão Total</div>
              <div className="text-xl font-bold text-orange-600">
                {formatarMoeda(totaisGerais.totalComissao)}
              </div>
            </Card>
          </div>
        )}

        {/* Cards do Afiliado Selecionado */}
        {afiliadoAtual && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-sm text-gray-600">Clientes</div>
              <div className="text-xl font-bold text-blue-600">
                {afiliadoAtual.total_clientes}
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-sm text-gray-600">Assinaturas</div>
              <div className="text-xl font-bold text-green-600">
                {afiliadoAtual.total_assinaturas}
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-sm text-gray-600">Valor Assinaturas</div>
              <div className="text-xl font-bold text-purple-600">
                {formatarMoeda(afiliadoAtual.valor_assinaturas)}
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-sm text-gray-600">Comissão</div>
              <div className="text-xl font-bold text-orange-600">
                {formatarMoeda(afiliadoAtual.comissao_total)}
              </div>
            </Card>
          </div>
        )}

        {/* Resto do código permanece igual (filtros, tabela de vendas, etc.) */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="block mb-1 text-sm">De:</span>
              <Input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />
            </div>
            <div>
              <span className="block mb-1 text-sm">Até:</span>
              <Input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
            <div>
              <span className="block mb-1 text-sm">Status:</span>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchVendas} className="w-full">
                Aplicar
              </Button>
            </div>
          </div>
        </Card>

        {/* totais das vendas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Valor Total Vendas</div>
            <div className="text-xl font-bold text-a1">
              {formatarMoeda(totalValor)}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Comissão Total Vendas</div>
            <div className="text-xl font-bold text-a2">
              {formatarMoeda(totalComissao)}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Porcentagem</div>
            <div className="text-xl font-bold text-purple-400">
              {totalValor > 0
                ? `${(comissaoPercentual * 100).toFixed(0)}%`
                : "0%"}
            </div>
          </Card>
        </div>


        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Erro: {error}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}