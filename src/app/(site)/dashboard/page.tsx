import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import DashboardAsaas from '@/components/DashboardAsaas';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Usuário não autenticado</p>
          <p className="text-gray-400 mt-2">Faça login novamente</p>
        </div>
      </div>
    );
  }

  const { data: perfilData, error: perfilError } = await supabase
    .from('afiliados')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (perfilError || !perfilData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Perfil não encontrado</p>
          <p className="text-gray-400 mt-2">Entre em contato com o suporte</p>
        </div>
      </div>
    );
  }

  let dashboardData = null;
  let dashboardUpdatedAt: string | null = null;
  try {
    const dashboardRes = await fetch(`/api/dashboard?afiliadoId=${perfilData.id}`, {
      cache: 'no-store'
    });
    if (dashboardRes.ok) {
      const dashboardJson = await dashboardRes.json();
      if (dashboardJson?.success) {
        dashboardData = dashboardJson.data ?? null;
        dashboardUpdatedAt = new Date().toISOString();
      }
    }
  } catch {
    // mantém dashboardData como null e deixa o client lidar
  }

  return (
    <DashboardAsaas
      afiliadoId={perfilData.id}
      perfilData={perfilData}
      initialData={dashboardData}
      initialUpdatedAt={dashboardUpdatedAt}
    />
  );
}