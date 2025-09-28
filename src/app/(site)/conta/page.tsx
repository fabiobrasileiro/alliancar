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

interface Venda {
  id: string;
  data_criacao: string;
  placa_veiculo: string;
  valor_adesao: number;
  tipo: string;
  status: string;
}

export default function MinhasVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [comissaoPercentual, setComissaoPercentual] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchAfiliado(); // busca % comissão
      fetchVendas();
    }
  }, [user, filtroDataInicio, filtroDataFim, filtroStatus]);

  const fetchAfiliado = async () => {
    const { data, error } = await supabase
      .from("afiliados")
      .select("porcentagem_comissao,form_link")
      .eq("auth_id", user?.id)
      .single();
    if (!error && data) {
      setComissaoPercentual(Number(data.porcentagem_comissao));
    }
  };

  const fetchVendas = async () => {
    try {
      setLoading(true);
      setError(null);

      // pega o form_link do afiliado logado
      const { data: afiliado } = await supabase
        .from("afiliados")
        .select("form_link,porcentagem_comissao")
        .eq("auth_id", user?.id)
        .single();

      let query = supabase
        .from("formularios")
        .select("id,data_criacao,placa_veiculo,valor_adesao,status, tipo")
        .eq("codigo_formulario", afiliado?.form_link);

      if (filtroDataInicio) query = query.gte("data_criacao", filtroDataInicio);
      if (filtroDataFim) query = query.lte("data_criacao", filtroDataFim );
      if (filtroStatus && filtroStatus !== "todos")
        query = query.eq("status", filtroStatus);

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar formulários:", error);
        setError(error.message);
        return;
      }

      setComissaoPercentual(Number(afiliado?.porcentagem_comissao || 0));
      setVendas((data as Venda[]) || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  };
  console.log(vendas)

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

  const totalValor = vendas.reduce((sum, v) => sum + (v.valor_adesao || 0), 0);
  const totalComissao = totalValor * comissaoPercentual;


  return (
    <SidebarLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Minhas Vendas</h2>

        {/* filtros */}
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

        {/* totais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Valor Total</div>
            <div className="text-xl font-bold text-blue-600">
              {formatarMoeda(totalValor)}
            </div>
          </Card>
          {/* <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Comissão Total</div>
            <div className="text-xl font-bold text-green-600">
              {formatarMoeda(totalComissao)}
            </div>
          </Card> */}
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Porcentagem</div>
            <div className="text-xl font-bold text-purple-600">
              {totalValor > 0
                ? `${((comissaoPercentual) * 100).toFixed(0)}%`
                : "0%"}
            </div>
          </Card>
        </div>

        {/* tabela */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500 py-4"
                    >
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  vendas.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{formatarData(v.data_criacao)}</TableCell>
                      <TableCell>{v.placa_veiculo || "N/A"}</TableCell>
                      <TableCell>{formatarMoeda(v.valor_adesao)}</TableCell>
                      <TableCell>
                        {v.tipo === "adesao"
                          ? formatarMoeda(v.valor_adesao) 
                          : formatarMoeda(v.valor_adesao * comissaoPercentual)} 
                      </TableCell>

                      <TableCell>{v.tipo}</TableCell>
                      <TableCell>{v.status}</TableCell>
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
