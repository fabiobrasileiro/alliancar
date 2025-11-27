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
import { toast } from "sonner";

interface Saque {
  id: string;
  afiliado_id: string;
  valor: number;
  metodo: string;
  status: string;
  observacao: string;
  criado_em: string;
  processado_em: string | null;
  dados_banco: any;
  afiliado: {
    nome_completo: string;
    email: string;
  };
}

export default function AdminSaques() {
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  
  const supabase = createClient();
  const { user } = useUser();

  // Buscar todos os saques
  const fetchSaques = async () => {
    try {
      setLoading(true);
      
      // Verificar se é admin
      const { data: afiliado } = await supabase
        .from("afiliados")
        .select("super_admin")
        .eq("auth_id", user?.id)
        .single();

      if (!afiliado?.super_admin) {
        toast.error("Acesso não autorizado");
        return;
      }

      let query = supabase
        .from("saques")
        .select(`
          *,
          afiliado:afiliados(nome_completo, email)
        `)
        .order("criado_em", { ascending: false });

      // Aplicar filtro de status
      if (filtroStatus && filtroStatus !== "todos") {
        query = query.eq("status", filtroStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar saques:", error);
        toast.error("Erro ao carregar saques");
        return;
      }

      setSaques(data || []);
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro ao carregar saques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSaques();
    }
  }, [user, filtroStatus]);

  // Atualizar status do saque
  const atualizarStatusSaque = async (saqueId: string, novoStatus: string) => {
    try {
      setUpdating(saqueId);
      
      const { error } = await supabase
        .from("saques")
        .update({
          status: novoStatus,
          processado_em: novoStatus === "pago" ? new Date().toISOString() : null,
          observacao: novoStatus === "pago" 
            ? "Saque processado com sucesso" 
            : "Saque cancelado pelo administrador"
        })
        .eq("id", saqueId);

      if (error) {
        throw error;
      }

      toast.success(`Saque ${novoStatus === "pago" ? "pago" : "cancelado"} com sucesso!`);
      fetchSaques(); // Recarregar a lista
      
    } catch (error) {
      console.error("Erro ao atualizar saque:", error);
      toast.error("Erro ao atualizar saque");
    } finally {
      setUpdating(null);
    }
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Estatísticas
  const totais = {
    pendentes: saques.filter(s => s.status === 'pendente').length,
    pagos: saques.filter(s => s.status === 'pago').length,
    cancelados: saques.filter(s => s.status === 'cancelado').length,
    totalPendente: saques
      .filter(s => s.status === 'pendente')
      .reduce((sum, s) => sum + s.valor, 0),
    totalPago: saques
      .filter(s => s.status === 'pago')
      .reduce((sum, s) => sum + s.valor, 0)
  };

  return (
    <SidebarLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          Gerenciar Saques - Administração
        </h2>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center bg-bg">
            <div className="text-sm text-white">Saques Pendentes</div>
            <div className="text-xl font-bold text-yellow-500">
              {totais.pendentes}
            </div>
            <div className="text-xs text-white mt-1">
              {formatarMoeda(totais.totalPendente)}
            </div>
          </Card>
          
          <Card className="p-4 text-center bg-bg">
            <div className="text-sm text-white">Saques Pagos</div>
            <div className="text-xl font-bold text-green-500">
              {totais.pagos}
            </div>
            <div className="text-xs text-white mt-1">
              {formatarMoeda(totais.totalPago)}
            </div>
          </Card>
          
          <Card className="p-4 text-center bg-bg">
            <div className="text-sm text-white">Saques Cancelados</div>
            <div className="text-xl font-bold text-red-500">
              {totais.cancelados}
            </div>
          </Card>
          
          <Card className="p-4 text-center bg-bg">
            <div className="text-sm text-white">Total de Saques</div>
            <div className="text-xl font-bold text-blue-500">
              {saques.length}
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-6 bg-bg">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-64">
              <span className="block mb-2 text-sm text-white">Filtrar por Status:</span>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="bg-bg border-gray-600">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="pago">Pagos</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex items-end">
              <Button onClick={fetchSaques} variant="outline">
                Atualizar
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabela de Saques */}
        <Card className="bg-bg border-gray-700">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Data</TableHead>
                <TableHead className="text-white">Afiliado</TableHead>
                <TableHead className="text-white">Valor</TableHead>
                <TableHead className="text-white">Método</TableHead>
                <TableHead className="text-white">Dados Bancários</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-white py-8">
                    Carregando saques...
                  </TableCell>
                </TableRow>
              ) : saques.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-white py-8">
                    Nenhum saque encontrado
                  </TableCell>
                </TableRow>
              ) : (
                saques.map((saque) => (
                  <TableRow key={saque.id} className="border-gray-700">
                    <TableCell className="text-white">
                      {formatarData(saque.criado_em)}
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium">
                        {saque.afiliado?.nome_completo}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {saque.afiliado?.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-semibold">
                      {formatarMoeda(saque.valor)}
                    </TableCell>
                    <TableCell className="text-white">
                      {saque.metodo}
                    </TableCell>
                    <TableCell>
                      <div className="text-white text-sm">
                        <div><strong>Chave:</strong> {saque.dados_banco?.chave_pix}</div>
                        <div><strong>Tipo:</strong> {saque.dados_banco?.tipo_chave}</div>
                        <div><strong>Titular:</strong> {saque.dados_banco?.nome_titular}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(saque.status)}>
                        {getStatusText(saque.status)}
                      </Badge>
                      {saque.processado_em && (
                        <div className="text-gray-400 text-xs mt-1">
                          Em: {formatarData(saque.processado_em)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {saque.status === 'pendente' && (
                          <>
                            <Button
                              onClick={() => atualizarStatusSaque(saque.id, 'pago')}
                              disabled={updating === saque.id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {updating === saque.id ? "Processando..." : "Marcar como Pago"}
                            </Button>
                            <Button
                              onClick={() => atualizarStatusSaque(saque.id, 'cancelado')}
                              disabled={updating === saque.id}
                              size="sm"
                              variant="outline"
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        {saque.status === 'pago' && (
                          <span className="text-green-400 text-sm">Processado</span>
                        )}
                        {saque.status === 'cancelado' && (
                          <span className="text-red-400 text-sm">Cancelado</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Informações */}
        <Card className="p-6 mt-6 bg-bg border-gray-700">
          <h3 className="font-medium mb-4 text-white">Instruções</h3>
          <ul className="text-sm space-y-2 text-gray-300">
            <li>• <strong>Saques Pendentes:</strong> Aguardando processamento pelo administrador</li>
            <li>• <strong>Marcar como Pago:</strong> Atualiza o status e registra a data de processamento</li>
            <li>• <strong>Cancelar:</strong> Cancela a solicitação de saque</li>
            <li>• Os afiliados recebem notificações automáticas sobre as mudanças de status</li>
          </ul>
        </Card>
      </div>
    </SidebarLayout>
  );
}