"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
type BadgeVariant = "default" | "blue" | "red" | "green" | "gray";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Pagamento {
  id: string;
  data: number;
  placa: string;
  comissao: number;
  status: string;
  associado_id: string;
  associado_name: string;
  data_criacao: string;
  data_atualizacao: string;
  pagamentos: number;
}

export default function FinanceiroPage() {
  const supabase = createClient();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("todos");

  useEffect(() => {
    fetchPagamentos();
  }, [supabase]);

  //procurar usuarios
  const fetchPagamentos = async () => {
    try {
      setLoading(true);

      let { data: pagamentos, error } = await supabase
        .from("pagamentos")
        .select("*")
        .order("data", { ascending: false });

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao carregar usuários");
        return;
      }

      setPagamentos(pagamentos || []);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar atividades");
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems: SidebarItem[] = [
    { id: "painel", label: "Painel Financeiro", href: "/financeiro" },
    {
      id: "pagamentos",
      label: "Painel de Pagamentos",
      href: "/financeiro/pagamentos",
    },
    {
      id: "saque",
      label: "Contas de Saque",
      href: "/financeiro/contas-de-saque",
    },
    { id: "faturas", label: "Faturas Power CRM", href: "/financeiro/faturas" },
  ];

  // Buscar pagamentos do Supabase
  useEffect(() => {
    fetchPagamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar pagamentos
  const filteredPagamentos = pagamentos.filter((pagamento) => {
    if (selectedFilter === "todos") return true;
    return pagamento.status === selectedFilter;
  });

  // Calcular resumo financeiro
  const resumo = {
    total: pagamentos.reduce(
      (sum, p) => sum + (parseFloat(p.comissao?.toString()) || 0),
      0,
    ),
    pago: pagamentos
      .filter((p) => p.status === "pago")
      .reduce((sum, p) => sum + (parseFloat(p.comissao?.toString()) || 0), 0),
    aReceber: pagamentos
      .filter((p) => p.status === "a_receber")
      .reduce((sum, p) => sum + (parseFloat(p.comissao?.toString()) || 0), 0),
    pendente: pagamentos
      .filter((p) => p.status === "pendente")
      .reduce((sum, p) => sum + (parseFloat(p.comissao?.toString()) || 0), 0),
  };

  // Formatar valor para moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Obter cor do status
  const getStatusColor = (status: string): BadgeVariant => {
    switch (status) {
      case "pago":
        return "green";
      case "a_receber":
        return "blue";
      case "pendente":
        return "gray";
      case "cancelado":
        return "red";
      default:
        return "default";
    }
  };
  return (
    <h1>HI</h1>
    // <>
    //   <div className="block m-auto p-2 md:px-6 md:py-4">
    //     <div className="flex gap-6 items-start w-full">
    //       <Sidebar title="Financeiro" items={sidebarItems} />

    //       <section className="flex-1 min-w-0">
    //         <header className="flex flex-col flex-wrap">
    //           <h2 className="font-bold leading-tight m-0 text-slate-700 text-2xl">
    //             Painel Financeiro
    //           </h2>
    //         </header>

    //         {/* Cards de Resumo */}
    //         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
    //           <Card>
    //             <CardHeader className="pb-2">
    //               <CardTitle className="text-sm font-medium text-gray-600">
    //                 Total Geral
    //               </CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="text-2xl font-bold text-gray-900">
    //                 {loading ? "Carregando..." : formatCurrency(resumo.total)}
    //               </div>
    //             </CardContent>
    //           </Card>

    //           <Card>
    //             <CardHeader className="pb-2">
    //               <CardTitle className="text-sm font-medium text-green-600">
    //                 Pago
    //               </CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="text-2xl font-bold text-green-600">
    //                 {loading ? "Carregando..." : formatCurrency(resumo.pago)}
    //               </div>
    //             </CardContent>
    //           </Card>

    //           <Card>
    //             <CardHeader className="pb-2">
    //               <CardTitle className="text-sm font-medium text-blue-600">
    //                 A Receber
    //               </CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="text-2xl font-bold text-blue-600">
    //                 {loading
    //                   ? "Carregando..."
    //                   : formatCurrency(resumo.aReceber)}
    //               </div>
    //             </CardContent>
    //           </Card>

    //           <Card>
    //             <CardHeader className="pb-2">
    //               <CardTitle className="text-sm font-medium text-yellow-600">
    //                 Pendente
    //               </CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="text-2xl font-bold text-yellow-600">
    //                 {loading
    //                   ? "Carregando..."
    //                   : formatCurrency(resumo.pendente)}
    //               </div>
    //             </CardContent>
    //           </Card>
    //         </div>

    //         {/* Filtros */}
    //         <div className="mt-6 max-w-xs">
    //           <Select value={selectedFilter} onValueChange={setSelectedFilter}>
    //             <SelectTrigger className="w-full">
    //               <SelectValue placeholder="Filtrar por status" />
    //             </SelectTrigger>
    //             <SelectContent>
    //               <SelectItem value="todos">Todos</SelectItem>
    //               <SelectItem value="pago">Pago</SelectItem>
    //               <SelectItem value="a_receber">A Receber</SelectItem>
    //               <SelectItem value="pendente">Pendente</SelectItem>
    //               <SelectItem value="cancelado">Cancelado</SelectItem>
    //             </SelectContent>
    //           </Select>
    //         </div>

    //         {/* Tabela de Pagamentos */}
    //         <Card className="mt-6">
    //           <CardHeader>
    //             <CardTitle>
    //               Histórico de Pagamentos ({filteredPagamentos.length})
    //             </CardTitle>
    //           </CardHeader>
    //           <CardContent>
    //             {loading ? (
    //               <div className="text-center py-8">
    //                 Carregando pagamentos...
    //               </div>
    //             ) : (
    //               <Table>
    //                 <TableHeader>
    //                   <TableRow>
    //                     <TableHead>ID Pagamento</TableHead>
    //                     <TableHead>Data</TableHead>
    //                     <TableHead>Associado</TableHead>
    //                     <TableHead>Placa</TableHead>
    //                     <TableHead>Comissão</TableHead>
    //                     <TableHead>Status</TableHead>
    //                   </TableRow>
    //                 </TableHeader>
    //                 <TableBody>
    //                   {filteredPagamentos.length === 0 ? (
    //                     <TableRow>
    //                       <TableCell
    //                         colSpan={6}
    //                         className="text-center py-8 text-white"
    //                       >
    //                         Nenhum pagamento encontrado
    //                       </TableCell>
    //                     </TableRow>
    //                   ) : (
    //                     filteredPagamentos.map((pagamento) => (
    //                       <TableRow key={pagamento.id}>
    //                         <TableCell className="font-medium">
    //                           {pagamento.pagamentos}
    //                         </TableCell>
    //                         <TableCell>{formatDate(pagamento.data)}</TableCell>
    //                         <TableCell>{pagamento.associado_id}</TableCell>
    //                         <TableCell>{pagamento.placa}</TableCell>
    //                         <TableCell className="font-semibold">
    //                           {formatCurrency(
    //                             parseFloat(pagamento.comissao?.toString()) || 0,
    //                           )}
    //                         </TableCell>
    //                         <TableCell>
    //                           <Badge variant={getStatusColor(pagamento.status)}>
    //                             {pagamento.status
    //                               .replace("_", " ")
    //                               .toUpperCase()}
    //                           </Badge>
    //                         </TableCell>
    //                       </TableRow>
    //                     ))
    //                   )}
    //                 </TableBody>
    //               </Table>
    //             )}
    //           </CardContent>
    //         </Card>
    //       </section>
    //     </div>
    //   </div>
    // </>
  );
}
