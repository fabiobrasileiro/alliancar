"use client";
import { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface AdminSaquesClientProps {
  initialSaques: Saque[];
}

export default function AdminSaquesClient({ initialSaques }: AdminSaquesClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const [saques, setSaques] = useState<Saque[]>(initialSaques);
  const [loading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("");

  const filteredSaques = useMemo(() => {
    if (!filtroStatus || filtroStatus === "todos") return saques;
    return saques.filter((s) => s.status === filtroStatus);
  }, [saques, filtroStatus]);

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
      setSaques((prev) =>
        prev.map((s) =>
          s.id === saqueId
            ? { ...s, status: novoStatus, processado_em: novoStatus === "pago" ? new Date().toISOString() : null }
            : s
        )
      );
      router.refresh();
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center bg-bg">
            <div className="text-sm text-white">Saques Pendentes</div>
            <div className="text-2xl font-bold text-yellow-400">{totais.pendentes}</div>
          </Card>
          <Card className="p-4 text-center bg-bg">
            <div className="text-sm text-white">Saques Pagos</div>
            <div className="text-2xl font-bold text-green-400">{totais.pagos}</div>
          </Card>
          <Card className="p-4 text-center bg-bg">
            <div className="text-sm text-white">Saques Cancelados</div>
            <div className="text-2xl font-bold text-red-400">{totais.cancelados}</div>
          </Card>
          <Card className="p-4 text-center bg-bg">
            <div className="text-sm text-white">Total Pendente</div>
            <div className="text-2xl font-bold text-yellow-400">{formatarMoeda(totais.totalPendente)}</div>
          </Card>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-bg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : (
                filteredSaques.map((saque) => (
                  <TableRow key={saque.id}>
                    <TableCell>
                      <div className="font-medium">{saque.afiliado?.nome_completo}</div>
                      <div className="text-sm text-gray-500">{saque.afiliado?.email}</div>
                    </TableCell>
                    <TableCell>{formatarMoeda(saque.valor)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(saque.status)}>
                        {getStatusText(saque.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatarData(saque.criado_em)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updating === saque.id || saque.status === "pago"}
                          onClick={() => atualizarStatusSaque(saque.id, "pago")}
                        >
                          Pagar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          disabled={updating === saque.id || saque.status === "cancelado"}
                          onClick={() => atualizarStatusSaque(saque.id, "cancelado")}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </SidebarLayout>
  );
}
