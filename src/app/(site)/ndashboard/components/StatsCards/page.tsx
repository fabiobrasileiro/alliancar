import { User } from '../../types'
import Cards from '../ui/cards'

interface StatsCardsProps {
  users: User[]
}

export default function StatsCards({ users }: StatsCardsProps) {
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.ativo).length,
    totalRevenue: users.reduce((sum, user) => sum + user.receita_total, 0),
    pendingRevenue: users.reduce((sum, user) => sum + user.receita_pendente, 0),
    totalPlates: users.reduce((sum, user) => sum + user.numero_placas, 0),
    averageCommission: users.reduce((sum, user) => sum + user.porcentagem_comissao, 0) / users.length
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total de Usuários */}

      <Cards title={'Total Usuários'}
        text={stats.totalUsers}
        subtitle={stats.activeUsers + " ativos"}
        path='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
        color="text-blue-600"
        className='border-blue-500'
        iconColor='bg-blue-100'

      />

      <Cards title={'Receita Total'}
        text={"R$" + stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        subtitle={"R$" + stats.pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + " pendentes"}
        path='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
        color="text-green-600"
        spanColor='text-orange-600'
        className='border-green-600'
        iconColor='bg-green-100'
      />

      <Cards title={'Total Placas'}
        text={stats.totalPlates}
        subtitle={"Média: " + (stats.totalPlates / stats.totalUsers).toFixed(1) + " por usuário"}
        path='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        color="text-purple-600"
        spanColor=''
        className='border-purple-500'
        iconColor='bg-purple-100'
      />

      <Cards title={'Comissão Média'}
        text={stats.totalPlates}
        subtitle={stats.averageCommission.toFixed(1) + " %"}
        path='M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z'
        color="text-yellow-600"
        spanColor=''
        className='border-yellow-500'
        iconColor='bg-yellow-100'
      />

    
    </div>
  )
}