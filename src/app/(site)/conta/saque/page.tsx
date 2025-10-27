"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  total_clientes: number;
  total_assinaturas: number;
  total_pagamentos: number;
  porcentagem_comissao: number;
  comissao_assinaturas: number;
  total_sacado: number;
  total_a_receber: number;
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
      console.log("🔍 Buscando dados do afiliado...");

      // Busca dados do afiliado
      const { data: afiliado, error: afiliadoError } = await supabase
        .from("afiliados")
        .select("id")
        .eq("auth_id", user?.id)
        .single();

      if (afiliadoError) {
        console.error("❌ Erro ao buscar afiliado:", afiliadoError);
        return;
      }

      if (!afiliado) {
        console.log("❌ Afiliado não encontrado");
        return;
      }

      console.log("✅ Afiliado encontrado:", afiliado.id);

      // Busca dashboard do afiliado
      const { data: dashboardData, error: dashboardError } = await supabase
        .from("afiliado_dashboard")
        .select("*")
        .eq("afiliado_id", afiliado.id)
        .single();

      if (dashboardError) {
        console.error("❌ Erro ao buscar dashboard:", dashboardError);
      } else {
        console.log("✅ Dashboard encontrado:", dashboardData);
        setDashboard(dashboardData);
      }

      // Busca dados bancários
      const { data: bankData, error: bankError } = await supabase
        .from("afiliado_bank_data")
        .select("*")
        .eq("afiliado_id", afiliado.id)
        .single();

      if (bankError) {
        console.error("❌ Erro ao buscar dados bancários:", bankError);
      } else {
        console.log("✅ Dados bancários encontrados:", bankData);
        setBankData(bankData);
      }

      // Busca histórico de saques
      const { data: saquesData, error: saquesError } = await supabase
        .from("saques")
        .select("*")
        .eq("afiliado_id", afiliado.id)
        .order("criado_em", { ascending: false });

      if (saquesError) {
        console.error("❌ Erro ao buscar saques:", saquesError);
      } else {
        console.log("✅ Saques encontrados:", saquesData?.length || 0);
        setSaques(saquesData || []);
      }

    } catch (error) {
      console.error("💥 Erro inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaque = async () => {
    console.log("🔄 Iniciando solicitação de saque...");
    
    if (!dashboard) {
      console.log("❌ Dashboard não carregado");
      alert("Dados não carregados. Tente novamente.");
      return;
    }

    if (!valorSaque) {
      console.log("❌ Valor não informado");
      alert("Digite o valor do saque");
      return;
    }

    if (!bankData) {
      console.log("❌ Dados bancários não encontrados");
      alert("Dados bancários não cadastrados");
      return;
    }

    const valor = parseFloat(valorSaque);
    const saldoDisponivel = dashboard.total_a_receber;

    console.log(`💰 Valor: R$ ${valor}, Saldo: R$ ${saldoDisponivel}`);

    if (valor > saldoDisponivel) {
      console.log("❌ Saldo insuficiente");
      alert("Saldo insuficiente para o saque");
      return;
    }

    if (valor < 10) {
      console.log("❌ Valor abaixo do mínimo");
      alert("Valor mínimo para saque é R$ 10,00");
      return;
    }

    try {
      setSubmitting(true);

      // Prepara dados do banco para salvar
      const dadosBanco = {
        chave_pix: bankData.pix_address_key,
        tipo_chave: bankData.pix_address_key_type,
        nome_titular: bankData.ownerName,
        cpf_cnpj: bankData.cpfCnpj,
        agencia: bankData.agency,
        conta: `${bankData.account}-${bankData.accountDigit}`,
        tipo_conta: bankData.bankAccountType
      };

      console.log("📝 Inserindo saque na tabela...");

      // Insere o saque
      const { data, error } = await supabase
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
        ])
        .select();

      if (error) {
        console.error("❌ Erro ao inserir saque:", error);
        throw error;
      }

      console.log("✅ Saque inserido com sucesso:", data);

      alert("Saque solicitado com sucesso!");
      setValorSaque("");
      
      // Recarrega os dados para atualizar o saldo e histórico
      console.log("🔄 Recarregando dados...");
      await fetchData();
      
    } catch (error) {
      console.error("💥 Erro ao solicitar saque:", error);
      alert("Erro ao solicitar saque. Tente novamente.");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'text-green-600 bg-green-100';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  const saldoDisponivel = dashboard?.total_a_receber || 0;
  const totalSacado = dashboard?.total_sacado || 0;
  const comissaoTotal = dashboard?.comissao_assinaturas || 0;

  if (loading) {
    return (
      <SidebarLayout>
        <div className="p-6">Carregando...</div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Solicitar Saque</h2>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Comissão</div>
            <div className="text-lg font-bold text-blue-600">
              {formatarMoeda(comissaoTotal)}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Total Sacado</div>
            <div className="text-lg font-bold text-orange-600">
              {formatarMoeda(totalSacado)}
            </div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="text-sm text-gray-600">Saldo Disponível</div>
            <div className="text-xl font-bold text-green-600">
              {formatarMoeda(saldoDisponivel)}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Saque */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Solicitar Novo Saque</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Valor do Saque</label>
                <Input
                  type="number"
                  placeholder="Digite o valor"
                  value={valorSaque}
                  onChange={(e) => setValorSaque(e.target.value)}
                  min="10"
                  max={saldoDisponivel}
                  step="0.01"
                />
                <div className="text-xs text-background0 mt-1">
                  Valor mínimo: R$ 10,00 • Disponível: {formatarMoeda(saldoDisponivel)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Método de Pagamento</label>
                <Select value={metodo} onValueChange={setMetodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="TED">TED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Informações Bancárias */}
              {bankData && (
                <div className="p-4 bg-background rounded-lg">
                  <h3 className="font-medium mb-2">Dados Cadastrados</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Nome:</strong> {bankData.ownerName}</div>
                    <div><strong>CPF/CNPJ:</strong> {bankData.cpfCnpj}</div>
                    <div><strong>Chave PIX:</strong> {bankData.pix_address_key}</div>
                    {bankData.agency && (
                      <div><strong>Agência/Conta:</strong> {bankData.agency} / {bankData.account}-{bankData.accountDigit}</div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSaque}
                disabled={!valorSaque || parseFloat(valorSaque) > saldoDisponivel || submitting || parseFloat(valorSaque) < 10}
                className="w-full"
              >
                {submitting ? "Processando..." : "Solicitar Saque"}
              </Button>
            </div>
          </Card>

          {/* Histórico de Saques */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Saques</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {saques.length === 0 ? (
                <div className="text-center text-background0 py-8">
                  Nenhum saque realizado ainda
                </div>
              ) : (
                saques.map((saque) => (
                  <div key={saque.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">
                          {formatarMoeda(saque.valor)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {saque.metodo} • {formatarData(saque.criado_em)}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(saque.status)}`}>
                        {getStatusText(saque.status)}
                      </span>
                    </div>
                    
                    {saque.observacao && (
                      <div className="text-sm text-gray-600 mt-2">
                        {saque.observacao}
                      </div>
                    )}

                    {saque.processado_em && (
                      <div className="text-xs text-background0 mt-1">
                        Processado em: {formatarData(saque.processado_em)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card className="p-6 mt-6">
          <h3 className="font-medium mb-4">Informações Importantes</h3>
          <ul className="text-sm space-y-2 text-gray-600">
            <li>• Saques são processados em até 2 dias úteis</li>
            <li>• O valor solicitado será deduzido automaticamente do seu saldo</li>
            <li>• Você será notificado quando o saque for processado</li>
            <li>• Certifique-se de que seus dados bancários estão corretos</li>
          </ul>
        </Card>
      </div>
    </SidebarLayout>
  );
}