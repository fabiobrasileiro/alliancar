'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import GoalsProgressAfiliado from './components/GoalsProgress';
import DashboardAsaas from '@/components/DashboardAsaas';

export default function DashboardPage() {
  const [perfilData, setPerfilData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  // 🔹 Carrega perfil do afiliado autenticado
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);

        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !authUser) {
          toast.error('Usuário não autenticado');
          return;
        }

        const { data: perfilResponse, error: perfilError } = await supabase
          .from('afiliados')
          .select('*')
          .eq('auth_id', authUser.id)
          .single();

        if (perfilError) {
          console.error('Erro ao buscar perfil:', perfilError);
          toast.error('Erro ao buscar perfil');
          return;
        }

        if (perfilResponse) {
          setPerfilData(perfilResponse);
          console.log("👤 Perfil carregado:", perfilResponse);
        }
      } catch (error) {
        console.error('Erro:', error);
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!perfilData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Perfil não encontrado</p>
          <p className="text-gray-400 mt-2">Entre em contato com o suporte</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardAsaas 
        afiliadoId={perfilData.id} 
        perfilData={perfilData} 
      />
      
   
    </>
  );
}