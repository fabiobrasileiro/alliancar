"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
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

interface Venda {
  id: string;
  data: string;
  afiliado_id: string;
  afiliado: {
    nome_completo: string;
  };
  placa: string;
  comissao: number;
  status: string;
  valor: number;
  data_criacao: string;
  data_atualizacao: string;
}

export default function MinhasVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>("");
  const [filtroDataFim, setFiltroDataFim] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");


  // Calcular totais
  const totalVendas = vendas.length;
  const totalValor = vendas.reduce((sum, venda) => sum + (venda.valor || 0), 0);
  const totalComissao = vendas.reduce(
    (sum, venda) => sum + (venda.comissao || 0),
    0,
  );
  const { user } = useUser();

  useEffect(() => {
    fetchVendas();
  }, [filtroDataInicio, filtroDataFim, filtroStatus]);

  const fetchVendas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter o usuário logado
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      // Buscar o afiliado baseado no auth_id do usuário
      const { data: afiliado, error: errorAfiliado } = await supabase
        .from("afiliados")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (errorAfiliado || !afiliado) {
        setError("Afiliado não encontrado");
        setLoading(false);
        return;
      }

      let query = supabase
        .from("pagamentos")
        .select(`*`)
        .eq("afiliado_id", user?.id);

      // Aplicar filtros de data
      if (filtroDataInicio) {
        query = query.gte("data", filtroDataInicio);
      }
      if (filtroDataFim) {
        query = query.lte("data", filtroDataFim);
      }
      if (filtroStatus && filtroStatus !== "todos") {
        query = query.eq("status", filtroStatus);
      }

      const { data: pagamentos, error } = await query;

      if (error) {
        console.error("Erro ao buscar pagamentos:", error);
        setError(error.message);
        return;
      }

      // Transformar os dados para o formato esperado
      const vendasFormatadas = pagamentos
        ? pagamentos.map((pagamento: any) => ({
            ...pagamento,
            afiliado: {
              nome_completo: pagamento.afiliados?.nome_completo || "N/A",
            },
          }))
        : [];

      setVendas(vendasFormatadas);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    try {
      return new Date(dataString).toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);
  };

  const formatarStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pendente: "Pendente",
      pago: "Pago",
      cancelado: "Cancelado",
      processando: "Processando",
      boleto_gerado: "Boleto Gerado",
      aguardando_liberacao: "Aguardando Liberação",
      a_receber: "A receber",
    };

    return statusMap[status.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Minhas Vendas</h2>
          <div className="text-center">Carregando vendas...</div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        {/* Título */}
        <h2 className="text-2xl font-semibold mb-6">Minhas Vendas</h2>

        {/* Filtros */}
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
              <span className="block mb-1 text-sm">Filtrar por status:</span>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="boleto_gerado">Boleto Gerado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="aguardando_liberacao">
                    Aguardando Liberação
                  </SelectItem>
                  <SelectItem value="a_receber">A receber</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchVendas} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Resumo */}
        <div className="mb-6">
          <p className="text-gray-700">
            &gt; Total <strong>{totalVendas}</strong> Vendas
          </p>
        </div>

        {/* Cards de totais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Valor Total</div>
            <div className="text-xl font-bold text-blue-600">
              {formatarMoeda(totalValor)}
            </div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Comissão Total</div>
            <div className="text-xl font-bold text-green-600">
              {formatarMoeda(totalComissao)}
            </div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Porcentagem da Comissão</div>
            <div className="text-xl font-bold text-purple-600">
              {totalValor > 0
                ? `${((totalComissao / totalValor) * 100).toFixed(1)}%`
                : "0%"}
            </div>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Associado</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-gray-500 py-4"
                    >
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>{formatarData(venda.data)}</TableCell>
                      <TableCell>
                        {venda.afiliado?.nome_completo || "N/A"}
                      </TableCell>
                      <TableCell>{venda.placa || "N/A"}</TableCell>
                      <TableCell>{formatarMoeda(venda.valor)}</TableCell>
                      <TableCell>{formatarMoeda(venda.comissao)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            venda.status === "pago"
                              ? "bg-green-100 text-green-800"
                              : venda.status === "cancelado"
                                ? "bg-red-100 text-red-800"
                                : venda.status === "aguardando_liberacao"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : venda.status === "a_receber"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {formatarStatus(venda.status)}
                        </span>
                      </TableCell>
                      <TableCell>{formatarData(venda.data_criacao)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Erro: {error}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
