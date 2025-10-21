import { AfiliadoDashboard } from '../types';
import { Badge } from './Badge';

interface AfiliadosTableProps {
  data: AfiliadoDashboard[];
}

export default function AfiliadosTable({ data }: AfiliadosTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO_E_EM_DIA': return 'green';
      case 'ATIVO_COM_PENDENCIA': return 'yellow';
      case 'INATIVO': return 'gray';
      case 'EXPIRADO': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Afiliado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assinatura
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Próximo Vencimento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.afiliado_nome}</div>
                  <div className="text-sm text-gray-500">{item.afiliado_email}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.customer_nome}</div>
                <div className="text-sm text-gray-500">{item.customer_telefone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.subscription_tipo}</div>
                <div className="text-sm text-gray-500 capitalize">{item.subscription_status.toLowerCase()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge 
                  color={getStatusColor(item.status_consolidado)}
                  text={item.status_consolidado.replace(/_/g, ' ')}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(item.subscription_valor)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(item.subscription_proximo_vencimento).toLocaleDateString('pt-BR')}
                </div>
                <div className={`text-sm ${
                  item.dias_ate_vencimento < 0 ? 'text-red-600' : 
                  item.dias_ate_vencimento < 7 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {item.dias_ate_vencimento} dias
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-4">
                  Detalhes
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}