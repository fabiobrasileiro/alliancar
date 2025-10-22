import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceAfiliado } from '../types';

interface PerformanceChartProps {
  data: PerformanceAfiliado[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.slice(0, 10).map(item => ({
    nome: item.afiliado_nome,
    recebido: item.valor_total_recebido,
    clientes: item.total_clientes,
    conversao: item.taxa_conversao_percent
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Afiliados</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                'Valor Recebido'
              ]}
            />
            <Bar dataKey="recebido" fill="#3b82f6" name="Valor Recebido" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}