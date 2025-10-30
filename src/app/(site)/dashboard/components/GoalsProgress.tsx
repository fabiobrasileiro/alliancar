import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalsProgressAfiliadoProps {
  totalPlacas: number; // aqui você passa dashboardData.total_clientes
}

const FAIXAS = [
  { min: 0, max: 49, percent: 3, estimate: "±R$ 220 a.m" },
  { min: 50, max: 99, percent: 5, estimate: "±R$ 750 a.m" },
  { min: 100, max: 199, percent: 7, estimate: "±R$ 2.100 a.m" },
  { min: 200, max: 349, percent: 9, estimate: "±R$ 4.200 a.m" },
  { min: 350, max: 499, percent: 12, estimate: "±R$ 9.000 a.m" },
  { min: 500, max: Infinity, percent: 15, estimate: "±R$ 15.000+ a.m" },
];

function findFaixaIndex(placas: number) {
  return FAIXAS.findIndex((f) => placas >= f.min && placas <= f.max);
}

export default function GoalsProgressAfiliado({ totalPlacas }: GoalsProgressAfiliadoProps) {
  const placas = totalPlacas || 0;
  const idx = findFaixaIndex(placas);
  const faixaAtual = FAIXAS[Math.max(idx, 0)];
  const proximaFaixa = idx >= 0 && idx < FAIXAS.length - 1 ? FAIXAS[idx + 1] : null;

  // Se houver próxima faixa, calcular quanto falta para alcançá-la
  const faltaParaProxima = proximaFaixa
    ? Math.max(proximaFaixa.min - placas, 0)
    : 0;

  // Progresso relativo dentro da faixa atual (0..100)
  let progressoRelativo = 0;
  if (proximaFaixa) {
    const faixaWidth = proximaFaixa.min - faixaAtual.min;
    progressoRelativo = faixaWidth > 0
      ? ((placas - faixaAtual.min) / faixaWidth) * 100
      : 100;
  } else {
    // última faixa -> 100%
    progressoRelativo = 100;
  }
  // limitar 0..100
  progressoRelativo = Math.min(Math.max(progressoRelativo, 0), 100);

  return (
    <Card className="mb-8 bg-bg py-4 border-0 text-white">
      <CardHeader>
        <CardTitle className="text-white">Progresso e Metas</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 px-6">
          <div>
            <Progress value={progressoRelativo} className="h-2" />
          </div>

          {proximaFaixa && (
            <div className="mt-3 text-white/90 bg-a1 px-16 py-4 rounded-lg">
              <h2 className="text-2xl font-bold">
                Para passar para a próxima fase ({proximaFaixa.min} — {proximaFaixa.max === Infinity ? "∞" : proximaFaixa.max} placas)
                você precisa de <strong>{faltaParaProxima}</strong> placas a mais.
              </h2>
              <p className="mt-1">
                Próxima comissão: <strong>{proximaFaixa.percent}%</strong> — estimativa: <strong>{proximaFaixa.estimate}</strong>
              </p>
            </div>
          )}

          {!proximaFaixa && (
            <div className="mt-3 text-sm text-white/90">
              <p>Você já atingiu a maior faixa (máxima comissão).</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
