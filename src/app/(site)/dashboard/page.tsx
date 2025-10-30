'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import GoalsProgressAfiliado from './components/GoalsProgress';

interface DashboardData {
  afiliado_id: string;
  total_clientes: number;
  total_assinaturas: number;
  comissao_assinaturas: number;
  total_pagamentos: number;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfilData, setPerfilData] = useState<any>(null);
  const { user, perfil } = useUser();
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
          console.log(perfilResponse)
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

  // 🔹 Carrega dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!perfilData) return;

      try {
        setLoading(true);

        let query = supabase.from('afiliado_dashboard').select('*');

        // 🔸 Se não for super_admin, filtra pelo afiliado_id
        if (!perfilData.super_admin) {
          query = query.eq('afiliado_id', perfilData.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        setDashboardData(data || []);
      } catch (err) {
        console.error('Erro:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase, perfilData]);

  // 🔹 Loading

  // 🔹 Erro
  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-navbar1 flex items-center justify-center">
  //       <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
  //         <p className="text-red-800 font-semibold">Erro</p>
  //         <p className="text-red-600 mt-2">{error}</p>
  //       </div>
  //     </div>
  //   );
  // }

  // // 🔹 Nenhum dado
  // if (!dashboardData || dashboardData.length === 0) {
  //   return (
  //     <div className="min-h-screen bg-navbar1 flex items-center justify-center">
  //       <div className="bg-bg border  rounded-lg p-6">
  //         <p className="text-yellow-800">Nenhum dado encontrado</p>
  //       </div>
  //     </div>
  //   );
  // }

  // 🔹 Soma total de todos afiliados (ou único afiliado)
  const totalClientes = dashboardData.reduce((acc, cur) => acc + (cur.total_clientes || 0), 0);
  const totalAssinaturas = dashboardData.reduce((acc, cur) => acc + (cur.comissao_assinaturas || 0), 0);
  const totalPagamentos = dashboardData.reduce((acc, cur) => acc + (cur.total_pagamentos || 0), 0);

  const cards = [
    {
      title: 'Total de Clientes',
      value: totalClientes.toLocaleString('pt-BR'),
      icon: Users,
      color: 'bg-a1',
      textColor: 'text-white',
      bgColor: 'bg-blue-50',
      description: 'Clientes ativos no sistema'
    },
    {
      title: 'Valor em Assinaturas',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAssinaturas),
      icon: TrendingUp,
      color: 'bg-a2',
      textColor: 'text-white',
      bgColor: 'bg-green-50',
      description: 'Soma de todas as assinaturas ativas'
    },
    {
      title: 'Valor em Pagamentos',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPagamentos),
      icon: DollarSign,
      color: 'bg-a3',
      textColor: 'text-white',
      bgColor: 'bg-purple-50',
      description: 'Total de pagamentos confirmados'
    }
  ];

  const ranking = [...dashboardData].sort((a, b) =>
    (b.total_pagamentos + b.total_assinaturas) - (a.total_pagamentos + a.total_assinaturas)
  );
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {perfilData?.super_admin ? 'Dashboard Geral' : `Bem vindo ${perfilData?.nome_completo ?? perfil?.nome_completo ?? 'Afiliado'}`}
          </h1>
          <p className='text-white'>
            {perfilData?.super_admin
              ? 'Visão geral do desempenho de todos os afiliados'
              : 'Visão geral do seu desempenho financeiro'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={` bg-bg rounded-xl p-6 shadow-sm  hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={`text-sm font-medium ${card.textColor}`}>{card.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                  <p className="text-xs text-white mt-1">{card.description}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-bg rounded-xl shadow-sm p-6 ">
          <h2 className="text-xl font-semibold text-white mb-4">Resumo Financeiro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-white">Ticket Médio por Cliente</p>
              <p className="text-lg font-semibold text-white">
                {totalClientes > 0
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    totalAssinaturas / totalClientes
                  )
                  : 'R$ 0,00'}
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-white">Potencial Total</p>
              <p className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  totalAssinaturas + totalPagamentos
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Ranking de Afiliados */}
        {perfilData?.super_admin && (
          <div className="bg-bg rounded-xl shadow-sm border    p-6 mt-10 mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              🏆 Ranking dos Afiliados
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full border  text-sm">
                <thead className="bg-navbar1">
                  <tr className='text-white'>
                    <th className="text-left px-4 py-2 border-b">Posição</th>
                    <th className="text-left px-4 py-2 border-b">Afiliado</th>
                    <th className="text-right px-4 py-2 border-b">Clientes</th>
                    <th className="text-right px-4 py-2 border-b">Assinaturas</th>
                    <th className="text-right px-4 py-2 border-b">Pagamentos</th>
                    <th className="text-right px-4 py-2 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((afiliado, index) => (
                    <tr key={afiliado.afiliado_id} className="hover:bg-navbar1">
                      <td className="px-4 py-2 border-b font-medium text-white">
                        {index + 1}º
                      </td>
                      <td className="px-4 py-2 border-b text-white">
                        {afiliado.afiliado_id}
                      </td>
                      <td className="px-4 py-2 border-b text-right text-white">{afiliado.total_clientes}</td>
                      <td className="px-4 py-2 border-b text-right text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(afiliado.total_assinaturas)}
                      </td>
                      <td className="px-4 py-2 border-b text-right text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(afiliado.total_pagamentos)}
                      </td>
                      <td className="px-4 py-2 border-b text-right font-semibold text-white ">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(afiliado.total_assinaturas + afiliado.total_pagamentos)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!perfilData?.super_admin && (
          <div className="mt-10">
            <GoalsProgressAfiliado totalPlacas={totalClientes} />
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
