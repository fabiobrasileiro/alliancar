import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import ContaClient, { DashboardData, Venda, AfiliadoInfo } from "./ContaClient";

const mapPaymentStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    PENDING: "Pendente",
    RECEIVED: "Recebido",
    CONFIRMED: "Confirmado",
    OVERDUE: "Atrasado",
    REFUNDED: "Estornado",
    CANCELLED: "Cancelado",
  };
  return statusMap[status] || status;
};

const mapSubscriptionStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    ACTIVE: "Ativa",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
    INACTIVE: "Inativa",
  };
  return statusMap[status] || status;
};

async function fetchDashboardData(afiliadoId: string): Promise<DashboardData | null> {
  try {
    // Usa apenas NEXT_PUBLIC_BASE_URL (definir na Vercel = URL do site em produção)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/dashboard?afiliadoId=${afiliadoId}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Erro ao buscar dashboard:', response.status);
      return null;
    }

    const dashboardResponse = await response.json();
    
    if (dashboardResponse.success) {
      return dashboardResponse.data;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    return null;
  }
}

async function fetchVendas(afiliadoId: string): Promise<Venda[]> {
  try {
    // Usa apenas NEXT_PUBLIC_BASE_URL (definir na Vercel = URL do site em produção)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Buscar pagamentos e assinaturas em paralelo
    const [paymentsResponse, subscriptionsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/asaas-data?afiliadoId=${afiliadoId}&tipo=payments`, {
        cache: 'no-store',
      }),
      fetch(`${baseUrl}/api/asaas-data?afiliadoId=${afiliadoId}&tipo=subscriptions`, {
        cache: 'no-store',
      }),
    ]);

    if (!paymentsResponse.ok || !subscriptionsResponse.ok) {
      console.error('Erro ao buscar vendas');
      return [];
    }

    const paymentsData = await paymentsResponse.json();
    const subscriptionsData = await subscriptionsResponse.json();
    
    const payments = paymentsData.data || [];
    const subscriptions = subscriptionsData.data || [];

    // Transformar pagamentos em vendas
    const vendasPagamentos: Venda[] = payments.map((payment: any) => ({
      id: payment.id,
      data_criacao: payment.dateCreated,
      tipo: 'pagamento' as const,
      status: mapPaymentStatus(payment.status),
      valor: payment.value,
      descricao: payment.description,
      cliente_nome: payment.customerName || 'Cliente',
      cliente_email: payment.customerEmail,
      externalReference: payment.externalReference
    }));

    // Transformar assinaturas em vendas
    const vendasAssinaturas: Venda[] = subscriptions.map((subscription: any) => ({
      id: subscription.id,
      data_criacao: subscription.dateCreated,
      tipo: 'assinatura' as const,
      status: mapSubscriptionStatus(subscription.status),
      valor: subscription.value,
      descricao: subscription.description,
      cliente_nome: subscription.customerName || 'Cliente',
      cliente_email: subscription.customerEmail,
      externalReference: subscription.externalReference
    }));

    // Combinar e ordenar por data
    const todasVendas = [...vendasPagamentos, ...vendasAssinaturas].sort((a, b) => 
      new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
    );

    return todasVendas;
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return [];
  }
}

export default async function MinhasVendas() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Usuário não autenticado</p>
          <p className="text-gray-400 mt-2">Faça login novamente</p>
        </div>
      </div>
    );
  }

  // Verificar se é admin
  const { data: afiliadoAuth } = await supabase
    .from("afiliados")
    .select("id, super_admin")
    .eq("auth_id", user.id)
    .single();

  const isAdmin = afiliadoAuth?.super_admin || false;

  // Buscar afiliados
  let afiliados: AfiliadoInfo[] = [];
  let selectedAfiliadoId = "";

  if (isAdmin) {
    // Admin: busca TODOS os afiliados
    const { data: afiliadosData } = await supabase
      .from("afiliados")
      .select("id, nome_completo, email, porcentagem_comissao, super_admin");

    if (afiliadosData && afiliadosData.length > 0) {
      afiliados = afiliadosData.map(a => ({
        id: a.id,
        nome_completo: a.nome_completo,
        email: a.email,
        porcentagem_comissao: a.porcentagem_comissao,
        super_admin: a.super_admin || false,
      }));
      selectedAfiliadoId = afiliadosData[0].id;
    }
  } else {
    // Afiliado normal: busca apenas seus dados
    const { data: afiliado } = await supabase
      .from("afiliados")
      .select("id, nome_completo, email, porcentagem_comissao, super_admin")
      .eq("auth_id", user.id)
      .single();

    if (afiliado) {
      afiliados = [{
        id: afiliado.id,
        nome_completo: afiliado.nome_completo,
        email: afiliado.email,
        porcentagem_comissao: afiliado.porcentagem_comissao,
        super_admin: afiliado.super_admin || false,
      }];
      selectedAfiliadoId = afiliado.id;
    }
  }

  // Se não encontrou afiliado, retornar erro
  if (!selectedAfiliadoId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Afiliado não encontrado</p>
          <p className="text-gray-400 mt-2">Entre em contato com o suporte</p>
        </div>
      </div>
    );
  }

  // Buscar dados iniciais em paralelo
  const [initialDashboard, initialVendas] = await Promise.all([
    fetchDashboardData(selectedAfiliadoId),
    fetchVendas(selectedAfiliadoId),
  ]);

  return (
    <ContaClient
      initialDashboard={initialDashboard}
      initialVendas={initialVendas}
      initialAfiliados={afiliados}
      initialSelectedAfiliadoId={selectedAfiliadoId}
      isAdmin={isAdmin}
    />
  );
}
