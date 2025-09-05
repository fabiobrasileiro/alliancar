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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

type BadgeVariant = "default" | "blue" | "red" | "green" | "gray";

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

interface BancoData {
  id: string;
  banco: string;
  agencia: string;
  digito_agencia: string;
  conta: string;
  digito_conta: string;
  principal: boolean;
  pix: string
}

interface EnderecoData {
  id: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  estado: string;
  cidade: string;
  principal: boolean;
}

interface PerfilData {
  id: string;
  nome_completo: string;
  cpf_cnpj: string;
  auth_id: string;
}

interface SaquesData {
  id: string;
  associado_id: string;
  data: string;
  valor: number;
  metodo: string;
  referencia: string;
  observacao: string;
  status: string;
}

export default function ContaDeSaqueIugu() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [bancoPrincipal, setBancoPrincipal] = useState<BancoData | null>(null);
  const [enderecoPrincipal, setEnderecoPrincipal] = useState<EnderecoData | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [valorSaque, setValorSaque] = useState("");
  const [processingSaque, setProcessingSaque] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<string>("");
  const [contasBancarias, setContasBancarias] = useState<BancoData | null>(null);
  const [saques, setSaques] = useState<SaquesData[]>([]);
  const { user } = useUser();


  console.log('saques: ', saques)

  // Buscar dados ao carregar
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar dados em paralelo para melhor performance
      const [
        perfilResponse,
        bancosResponse,
        enderecosResponse,
        payoutsResponse,
        saquesResponse
      ] = await Promise.all([
        // Perfil do usuário
        supabase
          .from("perfis")
          .select("id, nome_completo, cpf_cnpj, auth_id")
          .eq("auth_id", user.id)
          .single(),

        // Contas bancárias
        supabase
          .from("contas_bancarias")
          .select("*")
          .eq("usuario_id", user.id)
          .single()
        ,

        // Endereços
        supabase
          .from("enderecos")
          .select("*")
          .eq("usuario_id", user.id)
          .single(),

        // Saques
        supabase
          .from("pagamentos")
          .select("*")
          .eq("associado_id", user.id),

        supabase
          .from("saques")
          .select("*")
          .eq("associado_id", user.id)
      ]);


      // Processar respostas
      if (perfilResponse.data) setPerfil(perfilResponse.data);

      if (bancosResponse.data) {
        setContasBancarias(bancosResponse.data);
      }

      if (enderecosResponse.data) setEnderecoPrincipal(enderecosResponse.data);

      if (payoutsResponse.data) {
        setPayouts(payoutsResponse.data);

        // calcular saldo disponível (apenas pendentes)
        const disponivel = payoutsResponse.data
          .filter(payout => payout.status === "A receber")
          .reduce((sum, payout) => sum + (payout.comissao), 0);

        setSaldoDisponivel(disponivel);
      }

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
    const statusMap: Record<string, BadgeVariant> = {
      "paid": "green",
      "approved": "blue",
      "pending": "gray",
      "rejected": "red",
      "processing": "blue"
    };
    return statusMap[status] || "default";
  };

  // Obter texto do status
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      "paid": "Pago",
      "approved": "Aprovado",
      "pending": "Pendente",
      "rejected": "Rejeitado",
      "processing": "Processando"
    };
    return statusMap[status] || status;
  };

  // Validar valor do saque
  const validarValorSaque = (valor: number): { valido: boolean; mensagem?: string } => {
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

  // Processar saque
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

      setProcessingSaque(true);

      // Buscar dados da conta selecionada
      if (!contasBancarias || contasBancarias.id !== contaSelecionada) {
        toast.error("Conta bancária não encontrada");
        return;
      }
      const conta = contasBancarias;

      // Criar novo saque com transaction
      const { data: payout, error } = await supabase
        .from("payouts")
        .insert({
          affiliate_id: perfil?.id,
          period_month: new Date().toISOString().slice(0, 7), // YYYY-MM
          total_cents: Math.round(valor * 100),
          status: "pending",
          payment_method: "pix", // ou "bank_transfer"
          external_ref: `SAQUE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          bank_data: conta, // Salvar dados da conta para auditoria
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Saque solicitado com sucesso! Processamento em até 3 dias úteis.");
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

  // Renderizar loading
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

          {/* Aba Conta de Saque */}
          <TabsContent value="conta">
            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Informações Pessoais</h3>
                  <p>
                    <strong>Nome:</strong> {perfil?.nome_completo || "Não informado"}
                    <br />
                    <strong>CPF/CNPJ:</strong> {perfil?.cpf_cnpj || "Não informado"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Endereço Principal</h3>
                  {enderecoPrincipal ? (
                    <p>
                      {enderecoPrincipal.endereco}, {enderecoPrincipal.numero}
                      {enderecoPrincipal.complemento && `, ${enderecoPrincipal.complemento}`}
                      <br />
                      {enderecoPrincipal.cidade} - {enderecoPrincipal.estado}
                      <br />
                      CEP: {enderecoPrincipal.cep}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Nenhum endereço cadastrado</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Conta Bancária Principal</h3>
                  {contasBancarias ? (
                    <p>
                      <strong>Banco:</strong> {contasBancarias.banco}
                      <br />
                      <strong>Agência:</strong> {contasBancarias.agencia}
                      {contasBancarias.digito_agencia && `-${contasBancarias.digito_agencia}`}
                      <br />
                      <strong>Conta:</strong> {contasBancarias.conta}
                      {contasBancarias.digito_conta && `-${contasBancarias.digito_conta}`}
                      <br />
                      <strong>Pix:</strong> {contasBancarias.pix}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma conta bancária cadastrada</p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">R$</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo disponível para saque</p>
                      <p className="text-lg font-semibold">{formatCurrency(saldoDisponivel)}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => (document.querySelector('[data-value="sacar"]') as HTMLElement)?.click()}
                    disabled={saldoDisponivel <= 0}
                  >
                    Solicitar Saque
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sacar */}
          <TabsContent value="sacar">
            <Card>
              <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Disponível para saque</p>
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
                     <label className="text-sm font-medium">Conta bancária para recebimento</label>
                    <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {contasBancarias ? (
                          <>
                            <SelectItem key={contasBancarias.id} value={contasBancarias.id}>
                              {contasBancarias.banco} - Ag: {contasBancarias.agencia} - CC: {contasBancarias.conta}
                              {contasBancarias.principal && " (Principal)"}
                            </SelectItem>
                          </>
                        ) : (
                          "Nenhuma conta bancária cadastrada"
                        )}
                      </SelectContent>
                    </Select>
                   </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor do saque (R$)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">R$</span>
                      <Input
                        type="text"
                        placeholder="0,00"
                        className="text-right"
                        value={valorSaque}
                        onChange={(e) => {
                          // Permitir apenas números e vírgula
                          const value = e.target.value.replace(/[^\d,]/g, "");
                          setValorSaque(value);
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleSaque}
                    disabled={processingSaque || saldoDisponivel <= 0}
                  >
                    {processingSaque ? "Processando..." : "Solicitar Saque"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Histórico */}
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
                      <TableHead>Referência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saques.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhum saque realizado
                        </TableCell>
                      </TableRow>
                    ) : (
                      saques.map((saque) => (
                        <TableRow key={saque.id}>
                          <TableCell>{formatDate(saque.data)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(saque.valor)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {saque.metodo}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(saque.status)}>
                              {getStatusText(saque.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {saque.referencia}
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