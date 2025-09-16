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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

type BadgeVariant = "default" | "blue" | "red" | "green" | "gray";

interface Payout {
  id: string;
  afiliado_id: string;
  valor: number;
  descricao: string;
  mes_referencia: string;
  status: string;
  data: string;
  criado_em: string;
  atualizado_em: string;
}

interface BancoData {
  id: string;
  banco: string;
  agencia: string;
  digito_agencia: string;
  conta: string;
  digito_conta: string;
  principal: boolean;
  pix: string;
  afiliado_id: string;
}

interface EnderecoData {
  id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  estado: string;
  cidade: string;
  bairro: string;
  principal: boolean;
  afiliado_id: string;
}

interface PerfilData {
  id: string;
  nome_completo: string;
  cpf_cnpj: string;
  auth_id: string;
  receita_pendente: number;
}

interface SaquesData {
  id: string;
  afiliado_id: string;
  valor: number;
  metodo: string;
  status: string;
  observacao: string;
  criado_em: string;
  processado_em: string | null;
}

export default function ContaDeSaqueIugu() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [enderecoPrincipal, setEnderecoPrincipal] =
    useState<EnderecoData | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [valorSaque, setValorSaque] = useState("");
  const [processingSaque, setProcessingSaque] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<string>("");
  const [contasBancarias, setContasBancarias] = useState<BancoData[]>([]);
  const [saques, setSaques] = useState<SaquesData[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !authUser) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar perfil do afiliado
      const { data: perfilData, error: perfilError } = await supabase
        .from("afiliados")
        .select("id, nome_completo, cpf_cnpj, auth_id, receita_pendente")
        .eq("auth_id", authUser.id)
        .single();

      if (perfilError) {
        console.error("Erro ao buscar perfil:", perfilError);
        toast.error("Erro ao carregar perfil");
        return;
      }

      if (!perfilData) {
        toast.error("Perfil não encontrado");
        return;
      }

      setPerfil(perfilData);
      setSaldoDisponivel(perfilData.receita_pendente || 0);

      // Buscar outros dados em paralelo
      const [
        bancosResponse,
        enderecosResponse,
        payoutsResponse,
        saquesResponse,
      ] = await Promise.all([
        supabase
          .from("contas_bancarias")
          .select("*")
          .eq("afiliado_id", user?.id),

        supabase
          .from("enderecos")
          .select("*")
          .eq("afiliado_id", user?.id)
          .eq("principal", true)
          .single(),

        supabase
          .from("comissoes")
          .select("*")
          .eq("afiliado_id", perfilData.id)
          .eq("status", "pendente"),

        supabase
          .from("saques")
          .select("*")
          .eq("afiliado_id", user?.id)
          .order("criado_em", { ascending: false }),
      ]);

      // Processar contas bancárias
      if (bancosResponse.data) {
        setContasBancarias(bancosResponse.data);
        const contaPrincipal = bancosResponse.data.find(
          (conta) => conta.principal,
        );
        if (contaPrincipal) {
          setContaSelecionada(contaPrincipal.id);
        } else if (bancosResponse.data.length > 0) {
          setContaSelecionada(bancosResponse.data[0].id);
        }
      }

      // Processar endereço
      if (enderecosResponse.data) {
        setEnderecoPrincipal(enderecosResponse.data);
      }

      // Processar comissões (payouts)
      if (payoutsResponse.data) {
        setPayouts(payoutsResponse.data);
      }

      // Processar saques
      if (saquesResponse.data) {
        setSaques(saquesResponse.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string): BadgeVariant => {
    const statusMap: Record<string, BadgeVariant> = {
      pago: "green",
      aprovado: "blue",
      pendente: "gray",
      rejeitado: "red",
      processando: "blue",
      concluido: "green",
    };
    return statusMap[status.toLowerCase()] || "default";
  };

  const validarValorSaque = (
    valor: number,
  ): { valido: boolean; mensagem?: string } => {
    if (!valor || valor <= 0) {
      return { valido: false, mensagem: "Valor deve ser maior que zero" };
    }

    if (valor > saldoDisponivel) {
      return { valido: false, mensagem: "Saldo insuficiente" };
    }

    if (valor < 10) {
      return { valido: false, mensagem: "Valor mínimo: R$ 10,00" };
    }

    return { valido: true };
  };

  const handleSaque = async () => {
    try {
      const valor = parseFloat(valorSaque.replace(/\./g, "").replace(",", "."));

      const validacao = validarValorSaque(valor);
      if (!validacao.valido) {
        toast.error(validacao.mensagem);
        return;
      }

      if (!contaSelecionada) {
        toast.error("Selecione uma conta bancária");
        return;
      }

      if (!perfil) {
        toast.error("Perfil não encontrado");
        return;
      }

      setProcessingSaque(true);

      const conta = contasBancarias.find((c) => c.id === contaSelecionada);
      if (!conta) {
        toast.error("Conta bancária não encontrada");
        return;
      }

      // Criar saque
      const { error } = await supabase.from("saques").insert({
        afiliado_id: user?.id,
        valor: valor,
        metodo: "pix",
        status: "processando",
        observacao: `Saque para ${conta.banco} - Ag: ${conta.agencia} - CC: ${conta.conta}`,
      });

      if (error) {
        console.error("Erro ao criar saque:", error);
        throw error;
      }

      // Atualizar saldo pendente do afiliado
      const { error: updateError } = await supabase
        .from("afiliados")
        .update({
          receita_pendente: (perfil.receita_pendente || 0) - valor,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", perfil.id);

      if (updateError) {
        console.error("Erro ao atualizar saldo:", updateError);
      }

      toast.success(
        "Saque solicitado com sucesso! Processamento em até 3 dias úteis.",
      );
      setValorSaque("");

      // Recarregar dados
      await fetchData();
    } catch (error: any) {
      console.error("Erro ao solicitar saque:", error);
      toast.error(error.message || "Erro ao solicitar saque");
    } finally {
      setProcessingSaque(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="space-y-6 p-5">
          <h2 className="text-2xl font-semibold">Conta de Saque</h2>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando dados...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 p-5">
        <h2 className="text-2xl font-semibold">Conta de Saque</h2>

        <Tabs defaultValue="conta" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conta">Conta de Saque</TabsTrigger>
            <TabsTrigger value="sacar">Sacar</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Saques</TabsTrigger>
          </TabsList>

          <TabsContent value="conta">
            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Informações Pessoais</h3>
                  <p>
                    <strong>Nome:</strong>{" "}
                    {perfil?.nome_completo || "Não informado"}
                    <br />
                    <strong>CPF/CNPJ:</strong>{" "}
                    {perfil?.cpf_cnpj || "Não informado"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Endereço Principal</h3>
                  {enderecoPrincipal ? (
                    <p>
                      {enderecoPrincipal.logradouro}, {enderecoPrincipal.numero}
                      {enderecoPrincipal.complemento &&
                        `, ${enderecoPrincipal.complemento}`}
                      <br />
                      {enderecoPrincipal.bairro &&
                        `${enderecoPrincipal.bairro}, `}
                      {enderecoPrincipal.cidade} - {enderecoPrincipal.estado}
                      <br />
                      CEP: {enderecoPrincipal.cep}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhum endereço cadastrado
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Conta Bancária Principal</h3>
                  {contasBancarias.length > 0 ? (
                    contasBancarias
                      .filter((conta) => conta.principal)
                      .map((conta) => (
                        <p key={conta.id}>
                          <strong>Banco:</strong> {conta.banco}
                          <br />
                          <strong>Agência:</strong> {conta.agencia}
                          {conta.digito_agencia && `-${conta.digito_agencia}`}
                          <br />
                          <strong>Conta:</strong> {conta.conta}
                          {conta.digito_conta && `-${conta.digito_conta}`}
                          <br />
                          <strong>Pix:</strong> {conta.pix || "Não informado"}
                        </p>
                      ))
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhuma conta bancária cadastrada
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">R$</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Saldo disponível para saque
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(saldoDisponivel)}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      (
                        document.querySelector(
                          '[data-value="sacar"]',
                        ) as HTMLElement
                      )?.click()
                    }
                    disabled={saldoDisponivel <= 0}
                  >
                    Solicitar Saque
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sacar">
            <Card>
              <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Disponível para saque
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(saldoDisponivel)}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">Informações importantes:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Valor mínimo: R$ 10,00</li>
                      <li>Taxa de saque: R$ 1,99</li>
                      <li>Processamento em até 3 dias úteis</li>
                      <li>Verifique seus dados bancários antes de solicitar</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium">
                        Conta bancária para recebimento
                      </label>
                      <Select
                        value={contaSelecionada}
                        onValueChange={setContaSelecionada}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {contasBancarias.length > 0 ? (
                            contasBancarias.map((conta) => (
                              <SelectItem key={conta.id} value={conta.id}>
                                {conta.banco} - Ag: {conta.agencia} - CC:{" "}
                                {conta.conta}
                                {conta.principal && " (Principal)"}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-account" disabled>
                              Nenhuma conta bancária cadastrada
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Valor do saque (R$)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">R$</span>
                      <Input
                        type="text"
                        placeholder="0,00"
                        className="text-right"
                        value={valorSaque}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d,]/g, "");
                          setValorSaque(value);
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleSaque}
                    disabled={
                      processingSaque ||
                      saldoDisponivel <= 0 ||
                      !contaSelecionada
                    }
                  >
                    {processingSaque ? "Processando..." : "Solicitar Saque"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <p>
                    Total <strong>{saques.length}</strong> saques
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saques.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhum saque realizado
                        </TableCell>
                      </TableRow>
                    ) : (
                      saques.map((saque) => (
                        <TableRow key={saque.id}>
                          <TableCell>{formatDate(saque.criado_em)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(saque.valor)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {saque.metodo}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(saque.status)}>
                              {saque.status}
                            </Badge>
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
