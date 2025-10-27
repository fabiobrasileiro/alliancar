import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from "./types";

interface ReportChartsProps {
  chartData: ChartData | null;
  loading?: boolean;
}

export default function ReportCharts({
  chartData,
  loading,
}: ReportChartsProps) {
  if (loading) {
    return (
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="rounded-md border bg-white">
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-64 bg-gray-100 rounded"></div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>
    );
  }

  return (
    <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gráfico de Vendas por Status */}
      <Card className="rounded-md border bg-white">
        <CardHeader>
          <CardTitle className="text-slate-700">Vendas por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            {chartData?.vendas_por_status &&
            chartData.vendas_por_status.length > 0 ? (
              <StatusPieChart data={chartData.vendas_por_status} />
            ) : (
              <p className="text-slate-500">Nenhum dado de vendas disponível</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Negociações por Mês */}
      <Card className="rounded-md border bg-white">
        <CardHeader>
          <CardTitle className="text-slate-700">Negociações por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            {chartData?.negociacoes_por_mes &&
            chartData.negociacoes_por_mes.length > 0 ? (
              <BarChart data={chartData.negociacoes_por_mes} />
            ) : (
              <p className="text-slate-500">Nenhum dado mensal disponível</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Comissões por Mês */}
      <Card className="rounded-md border bg-white">
        <CardHeader>
          <CardTitle className="text-slate-700">Comissões por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            {chartData?.comissoes_por_mes &&
            chartData.comissoes_por_mes.length > 0 ? (
              <LineChart data={chartData.comissoes_por_mes} />
            ) : (
              <p className="text-slate-500">
                Nenhum dado de comissões disponível
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Afiliados */}
      <Card className="rounded-md border bg-white">
        <CardHeader>
          <CardTitle className="text-slate-700">Top 10 Afiliados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto">
            {chartData?.top_afiliados && chartData.top_afiliados.length > 0 ? (
              <RankingList data={chartData.top_afiliados} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">
                  Nenhum dado de ranking disponível
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Componente de Gráfico de Pizza simples com CSS
function StatusPieChart({
  data,
}: {
  data: Array<{ status: string; count: number; color: string }>;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-48 h-48 mb-4">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const circumference = 2 * Math.PI * 80;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = data
              .slice(0, index)
              .reduce(
                (acc, prevItem) =>
                  acc - (prevItem.count / total) * circumference,
                0,
              );

            return (
              <circle
                key={index}
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span>
              {item.status}: {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Gráfico de Barras simples
function BarChart({
  data,
}: {
  data: Array<{ mes: string; negociacoes: number; vendas: number }>;
}) {
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.negociacoes, item.vendas)),
  );

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 flex items-end justify-around gap-2 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1 flex-1">
            <div className="flex gap-1 items-end h-32">
              <div
                className="bg-blue-500 rounded-t min-w-[12px]"
                style={{ height: `${(item.negociacoes / maxValue) * 100}%` }}
                title={`Negociações: ${item.negociacoes}`}
              ></div>
              <div
                className="bg-green-500 rounded-t min-w-[12px]"
                style={{ height: `${(item.vendas / maxValue) * 100}%` }}
                title={`Vendas: ${item.vendas}`}
              ></div>
            </div>
            <span className="text-xs text-gray-600">{item.mes}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Negociações</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Vendas</span>
        </div>
      </div>
    </div>
  );
}

// Componente de Gráfico de Linha simples
function LineChart({ data }: { data: Array<{ mes: string; valor: number }> }) {
  const maxValue = Math.max(...data.map((item) => item.valor));
  const minValue = Math.min(...data.map((item) => item.valor));
  const range = maxValue - minValue;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 relative">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          {data.map((item, index) => {
            if (index === 0) return null;
            const prevItem = data[index - 1];
            const x1 = (index - 1) * (400 / (data.length - 1));
            const x2 = index * (400 / (data.length - 1));
            const y1 = 180 - ((prevItem.valor - minValue) / range) * 160;
            const y2 = 180 - ((item.valor - minValue) / range) * 160;

            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#8b5cf6"
                strokeWidth="2"
              />
            );
          })}
          {data.map((item, index) => {
            const x = index * (400 / (data.length - 1));
            const y = 180 - ((item.valor - minValue) / range) * 160;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#8b5cf6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-around text-xs text-gray-600">
        {data.map((item, index) => (
          <span key={index}>{item.mes}</span>
        ))}
      </div>
    </div>
  );
}

// Lista de Ranking
function RankingList({
  data,
}: {
  data: Array<{ nome: string; vendas: number; posicao: number }>;
}) {
  return (
    <div className="space-y-3">
      {data.map((afiliado, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-gray-100"
        >
          <div className="flex items-center gap-3">
            <div
              className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
              ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-blue-500"}
            `}
            >
              {afiliado.posicao}
            </div>
            <span className="font-medium text-sm">{afiliado.nome}</span>
          </div>
          <span className="text-sm text-gray-600">
            {afiliado.vendas} vendas
          </span>
        </div>
      ))}
    </div>
  );
}
