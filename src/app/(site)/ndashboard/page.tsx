'use client'
import { supabase } from '@/lib/supabase'
import { User, Performance, RankingTop10, GoalsData } from './types'

import StatsCards from './components/StatsCards/page'
import Filters from './components/Filters/page'
import UserTable from './components/UserTable/page'
import GoalsProgress from './components/goalsProgress/page'
import PerformanceReports from './components/performanceReports/page'
import Ranking from './components/ranking/page'

// Fetch dos dados principais
async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('dashboard') 
      .select('*')
    
    if (error) {
      console.error('Error fetching users:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

// Fetch dos dados de performance
async function getPerformance(): Promise<Performance[]> {
  try {
    const { data, error } = await supabase
      .from('performance') // substitua pelo nome da sua tabela de performance
      .select('*')
      .order('data', { ascending: false })
    
    if (error) {
      console.error('Error fetching performance:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

// Fetch do ranking
async function getRanking(): Promise<RankingTop10[]> {
  try {
    const { data, error } = await supabase
      .from('ranking') // substitua pelo nome da sua view/tabela de ranking
      .select('*')
      .order('posicao', { ascending: true })
      .limit(10)
    
    if (error) {
      console.error('Error fetching ranking:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

// Dados de metas (pode vir do Supabase ou ser calculado)
function getGoalsData(users: User[]): GoalsData {
  const totalMeta = users.reduce((sum, user) => sum + user.meta, 0)
  const totalProgresso = users.reduce((sum, user) => sum + user.receita_total, 0)
  const progressoPorcentagem = totalMeta > 0 ? (totalProgresso / totalMeta) * 100 : 0
  const vendasNecessarias = Math.ceil((totalMeta - totalProgresso) / 1000) // ajuste conforme sua lógica

  return {
    metaMensal: totalMeta,
    progresso: totalProgresso,
    vendasNecessarias,
    progressoPorcentagem: Math.min(progressoPorcentagem, 100)
  }
}

export default async function DashboardPage() {
  const [users, performance, ranking] = await Promise.all([
    getUsers(),
    getPerformance(),
    getRanking()
  ])

  const goalsData = getGoalsData(users)
  const userName = "Seu Nome" // Substitua pela lógica de autenticação

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Geral</h1>
          <p className="text-gray-600 mt-2">
            Gerencie e acompanhe o desempenho dos usuários do sistema
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total de {users.length} usuários encontrados
          </p>
        </div>

        {/* Progresso de Metas */}
        <GoalsProgress {...goalsData} />

        {/* Stats Cards */}
        <StatsCards users={users} />

        {/* Ranking Top 10 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <PerformanceReports performance={performance} />
          </div>
          <div>
            <Ranking rankingTop10={ranking} userName={userName} />
          </div>
        </div>

        {/* Filtros e Tabela de Usuários */}
        <Filters onFilterChange={(filters: any) => {
          // Lógica de filtro será implementada no client component
          console.log('Filters changed:', filters)
        }} />

        <UserTable users={users} />
      </div>
    </div>
  )
}