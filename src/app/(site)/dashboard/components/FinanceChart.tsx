import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RelatorioFinanceiro } from '../types';

interface FinanceChartProps {
  data: RelatorioFinanceiro[];
}

export default function FinanceChart({ data }: FinanceChartProps) {
  const chartData = data.map(item => ({
    mes: new Date(item.mes_ano).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
    recebido: item.valor_recebido,
    pendente: item.valor_pendente,
    taxa: item.taxa_sucesso_percent
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Financeira</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                'Valor'
              ]}
            />
            <Line type="monotone" dataKey="recebido" stroke="#10b981" strokeWidth={2} name="Recebido" />
            <Line type="monotone" dataKey="pendente" stroke="#f59e0b" strokeWidth={2} name="Pendente" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}