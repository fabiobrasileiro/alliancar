"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Wallet, CreditCard, History, ArrowDownCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

// Interface atualizada com os novos campos da API
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

interface BankData {
  id: string;
  pix_address_key: string;
  operation_type: string;
  pix_address_key_type: string;
  ownerName: string;
  cpfCnpj: string;
  agency: string;
  account: string;
  accountDigit: string;
  bankAccountType: string;
}

interface Saque {
  id: string;
  valor: number;
  metodo: string;
  status: string;
  observacao: string;
  criado_em: string;
  processado_em: string | null;
  dados_banco: any;
}

export default function Saques() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [saques, setSaques] = useState<Saque[]>([]);
  const [valorSaque, setValorSaque] = useState("");
  const [metodo, setMetodo] = useState("PIX");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: afiliado, error: afiliadoError } = await supabase
        .from("afiliados")
        .select("id")
        .eq("auth_id", user?.id)
        .single();

      if (afiliadoError || !afiliado) {
        toast.error("Erro ao carregar dados do afiliado");
        return;
      }

      // Buscar dados da API do dashboard
      const response = await fetch(`/api/dashboard?afiliadoId=${afiliado.id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do dashboard');
      }

      const dashboardResponse = await response.json();
      
      if (dashboardResponse.success) {
        setDashboard(dashboardResponse.data);
      } else {
        throw new Error(dashboardResponse.error || 'Erro ao carregar dados');
      }

      // Buscar dados bancários
      const { data: bankData, error: bankError } = await supabase
        .from("afiliado_bank_data")
        .select("*")
        .eq("afiliado_id", afiliado.id)
        .single();

      if (bankError && bankError.code !== 'PGRST116') { // PGRST116 = no rows
        console.error("❌ Erro ao buscar dados bancários:", bankError);
      } else {
        setBankData(bankData);
      }

      // Buscar histórico de saques
      const { data: saquesData, error: saquesError } = await supabase
        .from("saques")
        .select("*")
        .eq("afiliado_id", afiliado.id)
        .order("criado_em", { ascending: false });

      if (saquesError) {
        console.error("❌ Erro ao buscar saques:", saquesError);
      } else {
        setSaques(saquesData || []);
      }

    } catch (error) {
      console.error("💥 Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSaque = async () => {
    if (!dashboard || !bankData) {
      toast.error("Dados não carregados. Tente novamente.");
      return;
    }

    if (!valorSaque) {
      toast.error("Digite o valor do saque");
      return;
    }

    const valor = parseFloat(valorSaque);
    const saldoDisponivel = dashboard.total_a_receber;

    if (valor > saldoDisponivel) {
      toast.error("Saldo insuficiente para o saque");
      return;
    }

    if (valor < 10) {
      toast.error("Valor mínimo para saque é R$ 10,00");
      return;
    }

    // Verificar se já existe saque pendente
    const saquesPendentes = saques.filter(s => s.status === 'pendente');
    if (saquesPendentes.length > 0) {
      toast.error("Você já tem um saque pendente. Aguarde o processamento.");
      return;
    }

    try {
      setSubmitting(true);

      const dadosBanco = {
        chave_pix: bankData.pix_address_key,
        tipo_chave: bankData.pix_address_key_type,
        nome_titular: bankData.ownerName,
        cpf_cnpj: bankData.cpfCnpj,
        agencia: bankData.agency,
        conta: `${bankData.account}-${bankData.accountDigit}`,
        tipo_conta: bankData.bankAccountType
      };

      const { error } = await supabase
        .from("saques")
        .insert([
          {
            afiliado_id: dashboard.afiliado_id,
            valor: valor,
            metodo: metodo,
            dados_banco: dadosBanco,
            status: "pendente",
            observacao: "Saque solicitado pelo afiliado"
          }
        ]);

      if (error) throw error;

      toast.success("Saque solicitado com sucesso!");
      setValorSaque("");
      await fetchData();

    } catch (error) {
      console.error("Erro ao solicitar saque:", error);
      toast.error("Erro ao solicitar saque");
    } finally {
      setSubmitting(false);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pago':
        return {
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          icon: CheckCircle,
          text: 'Pago'
        };
      case 'pendente':
        return {
          color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          icon: Clock,
          text: 'Pendente'
        };
      case 'cancelado':
        return {
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
          icon: XCircle,
          text: 'Cancelado'
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: Clock,
          text: status
        };
    }
  };

  const saldoDisponivel = dashboard?.total_a_receber || 0;
  const totalSacado = dashboard?.total_sacado || 0;
  const totalAcumulado = dashboard?.total_acumulado || 0;
  const totalPendenteSaque = dashboard?.total_pendente_saque || 0;

   if (loading) {
  //   return (
  //     <SidebarLayout>
  //       <div className="p-6 space-y-6">
  //         <div className="animate-pulse">
  //           <div className="h-8 bg-gray-700 rounded w-1/4 mb-2"></div>
  //           <div className="h-4 bg-gray-700 rounded w-1/2"></div>
  //         </div>
  //         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  //           {[1, 2, 3, 4].map(i => (
  //             <div key={i} className="bg-gray-800/50 rounded-lg p-6 animate-pulse">
  //               <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
  //               <div className="h-8 bg-gray-700 rounded w-3/4"></div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </SidebarLayout>
  //   );
   }

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Wallet className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Solicitar Saque</h1>
              <p className="text-gray-400">
                Gerencie seus saques e acompanhe o histórico
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-300">Comissão Total</p>
                  <p className="text-2xl font-bold text-white">
                    {formatarMoeda(totalAcumulado)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <History className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-orange-300">Total Sacado</p>
                  <p className="text-2xl font-bold text-white">
                    {formatarMoeda(totalSacado)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-300">Saques Pendentes</p>
                  <p className="text-2xl font-bold text-white">
                    {formatarMoeda(totalPendenteSaque)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-300">Saldo Disponível</p>
                  <p className="text-2xl font-bold text-white">
                    {formatarMoeda(saldoDisponivel)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Formulário de Saque */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5" />
                Solicitar Novo Saque
              </CardTitle>
              <CardDescription className="text-gray-400">
                Preencha os dados para solicitar seu saque
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="space-y-2">
                <Label htmlFor="valorSaque" className="text-white">
                  Valor do Saque
                </Label>
                <Input
                  id="valorSaque"
                  type="number"
                  placeholder="Digite o valor"
                  value={valorSaque}
                  onChange={(e) => setValorSaque(e.target.value)}
                  min="10"
                  max={saldoDisponivel}
                  step="0.01"
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400">
                  Valor mínimo: R$ 10,00 • Disponível: {formatarMoeda(saldoDisponivel)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodo" className="text-white">
                  Método de Pagamento
                </Label>
                <Select value={metodo} onValueChange={setMetodo}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="TED">TED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Informações Bancárias */}
              {bankData ? (
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">Dados bancários cadastrados</span>
                    </div>
                    <div className="text-sm text-green-300 space-y-1">
                      <div><strong>Nome:</strong> {bankData.ownerName}</div>
                      <div><strong>CPF/CNPJ:</strong> {bankData.cpfCnpj}</div>
                      <div><strong>Chave PIX:</strong> {bankData.pix_address_key}</div>
                      {bankData.agency && (
                        <div><strong>Agência/Conta:</strong> {bankData.agency} / {bankData.account}-{bankData.accountDigit}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-yellow-500/10 border-yellow-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm">
                        Dados bancários não cadastrados. Configure em Meu Perfil.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleSaque}
                disabled={!valorSaque || parseFloat(valorSaque) > saldoDisponivel || submitting || parseFloat(valorSaque) < 10 || !bankData}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  "Solicitar Saque"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Histórico de Saques */}
          <Card className="bg-gray-800/50 border-gray-700 px-5 pb-3">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Saques
              </CardTitle>
              <CardDescription className="text-gray-400">
                Acompanhe o status dos seus saques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {saques.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum saque realizado ainda</p>
                  </div>
                ) : (
                  saques.map((saque) => {
                    const statusConfig = getStatusConfig(saque.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div key={saque.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold text-white text-lg">
                              {formatarMoeda(saque.valor)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {saque.metodo} • {formatarData(saque.criado_em)}
                            </div>
                          </div>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.text}
                          </Badge>
                        </div>

                        {saque.observacao && (
                          <div className="text-sm text-gray-300 mt-2 p-2 bg-gray-700/50 rounded">
                            {saque.observacao}
                          </div>
                        )}

                        {saque.processado_em && (
                          <div className="text-xs text-gray-400 mt-2">
                            Processado em: {formatarData(saque.processado_em)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      
      </div>
    </SidebarLayout>
  );
}