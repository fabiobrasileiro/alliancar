import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalsProgressAfiliadoProps {
  totalPlacas: number; // passe dashboardData.total_clientes
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

  // META FIXA: 500 placas = 100%
  const META_PLACAS = 500;

  // progresso global relativo à meta fixa (0..100)
  const progressoGlobal = Math.min((placas / META_PLACAS) * 100, 100);

  // faixa atual / próxima faixa (mantive pra informação extra)
  const idx = findFaixaIndex(placas);
  const faixaAtual = FAIXAS[Math.max(idx, 0)];
  const proximaFaixa = idx >= 0 && idx < FAIXAS.length - 1 ? FAIXAS[idx + 1] : null;

  // quanto falta para entrar na próxima faixa (se existir)
  const faltaParaProxima = proximaFaixa ? Math.max(proximaFaixa.min - placas, 0) : 0;

  // formata plural
  const placaLabel = (n: number) => (n === 1 ? "placa" : "placas");

  return (
    <Card className="mb-8 bg-bg py-4 border-0 text-white">
      <CardHeader>
        <CardTitle className="text-white">Progresso e Metas</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 px-6">
          {/* Cabeçalho com número de placas e % relativo a 500 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Suas placas</p>
              <p className="text-2xl font-bold text-white">{placas}</p>
            </div>
            <div className="text-right">
              {/* <p className="text-sm text-white">Meta fixa</p>
              {/* <p className="font-medium text-white">{META_PLACAS} placas = 100%</p>
              <p className="text-xs text-white/80">{progressoGlobal.toFixed(0)}%</p> */}
            </div>
          </div>

          {/* Barra de progresso (em relação a 500) */}
          <div>
            <div className="flex justify-between text-sm text-white mb-2">
              <span>Progresso</span>
              <span>{progressoGlobal.toFixed(0)}%</span>
            </div>

            <Progress value={progressoGlobal} className="h-2" />
          </div>

          {/* Informação sobre falta para entrar na próxima fase */}
          <div className="mt-3 text-white/90 bg-a1 px-6 py-4 rounded-lg">
            {proximaFaixa ? (
              faltaParaProxima > 0 ? (
                <h2 className="text-lg font-semibold">
                  Falta(m) <strong>{faltaParaProxima}</strong> {placaLabel(faltaParaProxima)} para entrar na próxima fase (
                  {proximaFaixa.min} — {proximaFaixa.max === Infinity ? "∞" : proximaFaixa.max} placas).
                </h2>
              ) : (
                <h2 className="text-lg font-semibold">
                  🎉 Você já entrou na próxima fase ({proximaFaixa.min} — {proximaFaixa.max === Infinity ? "∞" : proximaFaixa.max} placas)!
                </h2>
              )
            ) : (
              <h2 className="text-lg font-semibold">Você já atingiu a maior faixa (máxima comissão).</h2>
            )}

            {/* Faixa atual / próxima faixa (informação adicional) */}
            <div className="mt-2 text-sm">
              <p>
                Faixa atual: <strong>{faixaAtual.min} — {faixaAtual.max === Infinity ? "∞" : faixaAtual.max} placas</strong> — {faixaAtual.percent}% ({faixaAtual.estimate})
              </p>
              {proximaFaixa && (
                <p className="mt-1">
                  Próxima faixa: <strong>{proximaFaixa.min} — {proximaFaixa.max === Infinity ? "∞" : proximaFaixa.max} placas</strong> — {proximaFaixa.percent}% ({proximaFaixa.estimate})
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
