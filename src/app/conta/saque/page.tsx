"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
type BadgeVariant = "default" | "blue" | "red" | "green" | "gray";
import Image from "next/image";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Payout {
  id: string;
  affiliate_id: string;
  period_month: string;
  total_cents: number;
  status: string;
  payment_method: string;
  external_ref: string;
  created_at: string;
  paid_at: string | null;
}

interface ProfileData {
  id: string;
  nome_completo: string;
  cpf_cnpj: string;
  banco: string;
  agencia: string;
  conta: string;
}

export default function ContaDeSaqueIugu() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [valorSaque, setValorSaque] = useState("");
  const [processingSaque, setProcessingSaque] = useState(false);

  // Buscar dados ao carregar
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar usuário autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
      } else {
        setProfile(profileData);
      }

      // Buscar payouts do usuário
      const { data: payoutsData, error: payoutsError } = await supabase
        .from("payouts")
        .select("*")
        .eq("affiliate_id", profileData?.id || user.id)
        .order("created_at", { ascending: false });

      if (payoutsError) {
        console.error("Erro ao buscar saques:", payoutsError);
      } else {
        setPayouts(payoutsData || []);

        // Calcular saldo disponível (payouts pendentes)
        const disponivel = (payoutsData || []).reduce((sum, payout) => {
          if (payout.status === "pending" || payout.status === "approved") {
            return sum + payout.total_cents / 100;
          }
          return sum;
        }, 0);
        setSaldoDisponivel(disponivel);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
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
      case "paid":
        return "green";
      case "approved":
        return "blue";
      case "pending":
        return "gray";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  // Processar saque
  const handleSaque = async () => {
    const valor = parseFloat(valorSaque.replace(",", "."));

    if (!valor || valor <= 0) {
      toast.error("Por favor, informe um valor válido");
      return;
    }

    if (valor > saldoDisponivel) {
      toast.error("Valor maior que o saldo disponível");
      return;
    }

    try {
      setProcessingSaque(true);

      // Criar novo payout
      const { error } = await supabase.from("payouts").insert({
        affiliate_id: profile?.id,
        period_month: new Date().toISOString().split("T")[0],
        total_cents: Math.round(valor * 100),
        status: "pending",
        payment_method: "bank_transfer",
        external_ref: `SAQUE-${Date.now()}`,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      toast.success("Saque solicitado com sucesso!");
      setValorSaque("");
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao solicitar saque:", error);
      toast.error("Erro ao solicitar saque");
    } finally {
      setProcessingSaque(false);
    }
  };
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Conta de Saque Iugu</h2>

        <Tabs defaultValue="conta" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conta">Conta de Saque</TabsTrigger>
            <TabsTrigger value="sacar">Sacar</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Saques</TabsTrigger>
          </TabsList>

          {/* Aba Conta de Saque */}
          <TabsContent value="conta">
            <Card>
              <CardContent className="space-y-4 p-6">
                <p>
                  Beneficiário da Conta de Saque:{" "}
                  <strong>
                    {loading ? "Carregando..." : profile?.nome_completo || "-"}
                  </strong>
                  <br />
                  CPF/CNPJ:{" "}
                  <strong>
                    {loading ? "Carregando..." : profile?.cpf_cnpj || "-"}
                  </strong>
                  <br />
                  Conta Iugu: <strong>-</strong>
                </p>
                <hr />
                <div>
                  <strong>Dados para Saque:</strong>
                  <br />
                  Banco:{" "}
                  <span>
                    {loading ? "Carregando..." : profile?.banco || "-"}
                  </span>
                  <br />
                  Agência:{" "}
                  <span>
                    {loading ? "Carregando..." : profile?.agencia || "-"}
                  </span>
                  <br />
                  Conta:{" "}
                  <span>
                    {loading ? "Carregando..." : profile?.conta || "-"}
                  </span>
                  <br />
                  Tipo de Conta: <span>Conta Corrente</span>
                </div>

                <Button className="w-56 hidden">Alterar conta</Button>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-4">
                    <Image
                      width={150}
                      height={150}
                      src="/"
                      alt="Saldo"
                      className="w-12 h-12"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Saldo total disponível
                      </p>
                      <p className="text-lg font-semibold">
                        {loading
                          ? "Carregando..."
                          : formatCurrency(saldoDisponivel)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      A receber (parcelado)
                    </p>
                    <p className="font-medium">R$ 0,00</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Image
                    width={150}
                    height={150}
                    src="/"
                    alt="Dúvidas"
                    className="w-5 h-5 mt-1"
                  />
                  <p className="text-sm text-muted-foreground">
                    <strong>Vendas parceladas</strong> em cartão de crédito
                    serão liberadas a cada 30 dias de acordo com o número de
                    parcelas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sacar */}
          <TabsContent value="sacar">
            <Card>
              <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Disponível para saque
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {loading
                      ? "Carregando..."
                      : formatCurrency(saldoDisponivel)}
                  </p>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Detalhes do saque:</p>
                    <p>
                      Tarifa de saque:{" "}
                      <strong className="text-foreground">R$ 1,99</strong>
                    </p>
                    <p>Os pagamentos serão realizados em até 3 dias úteis.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">
                    O saque será realizado para a conta bancária principal
                  </label>
                  <div>
                    <label className="text-sm font-medium">
                      Valor do saque
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">R$</span>
                      <Input
                        type="text"
                        placeholder="0,00"
                        className="text-right"
                        value={valorSaque}
                        onChange={(e) => setValorSaque(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-56 bg-green-600 hover:bg-green-700"
                    onClick={handleSaque}
                    disabled={processingSaque || loading || !saldoDisponivel}
                  >
                    {processingSaque ? "Processando..." : "Efetuar Saque"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="historico">
            <Card>
              <CardContent className="p-6">
                <p className="mb-4">
                  &gt; Total <strong>{payouts.length}</strong> registros
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data do pedido</TableHead>
                      <TableHead>Efetivado em</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : payouts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Não há dados para exibir
                        </TableCell>
                      </TableRow>
                    ) : (
                      payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>{formatDate(payout.created_at)}</TableCell>
                          <TableCell>
                            {payout.paid_at ? formatDate(payout.paid_at) : "-"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payout.total_cents / 100)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(payout.status)}>
                              {payout.status === "paid"
                                ? "Pago"
                                : payout.status === "approved"
                                  ? "Aprovado"
                                  : payout.status === "pending"
                                    ? "Pendente"
                                    : payout.status === "rejected"
                                      ? "Rejeitado"
                                      : payout.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Ver detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}
