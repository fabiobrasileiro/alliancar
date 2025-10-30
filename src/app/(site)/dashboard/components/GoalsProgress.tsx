import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalsProgressAfiliadoProps {
  metaPlacas: number;         // meta em número de placas
  totalPlacas: number;        // placas atuais do afiliado
}

const FAIXAS = [
  { min: 0, max: 49, percent: 3, estimate: "±R$ 220 a.m" },
  { min: 50, max: 99, percent: 5, estimate: "±R$ 750 a.m" },
  { min: 100, max: 199, percent: 7, estimate: "±R$ 2.100 a.m" },
  { min: 200, max: 349, percent: 9, estimate: "±R$ 4.200 a.m" },
  { min: 350, max: 499, percent: 12, estimate: "±R$ 9.000 a.m" },
  { min: 500, max: Infinity, percent: 15, estimate: "±R$ 15.000+ a.m" },
];

function findFaixa(placas: number) {
  return FAIXAS.find((f) => placas >= f.min && placas <= f.max) ?? FAIXAS[0];
}

export default function GoalsProgressAfiliado({
  metaPlacas,
  totalPlacas,
}: GoalsProgressAfiliadoProps) {
  const progresso = totalPlacas;
  // porcentagem do progresso em relação à meta de placas
  const progressoPorcentagem = Math.min((progresso / Math.max(metaPlacas, 1)) * 100, 120);
  const placasNecessarias = Math.max(metaPlacas - progresso, 0);

  const faixaAtual = findFaixa(progresso);

  return (
    <Card className="mb-8 bg-bg py-4 border-0 text-white">
      <CardHeader>
        <CardTitle className="text-white">Metas e Progresso</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 px-9 mb-12">
          <div className="flex justify-between text-sm text-white mb-2">
            <span>Progresso (placas)</span>
            <span>{progressoPorcentagem.toFixed(0)}%</span>
          </div>

          {/* Passamos a porcentagem para o componente Progress (0..100) */}
          <Progress value={progressoPorcentagem} className="h-2" />

          <div
            className={`${
              progressoPorcentagem >= 100 ? "bg-green-a2" : "bg-a1"
            } p-4 rounded-lg mt-4`}
          >
            {progressoPorcentagem >= 100 ? (
              <p className="text-white font-medium">
                🏆 Parabéns! Você atingiu sua meta de{" "}
                <strong>{metaPlacas}</strong> placas (total atual:{" "}
                <strong>{progresso}</strong> placas).
              </p>
            ) : (
              <p className="text-white font-medium">
                Faltam <strong>{placasNecessarias}</strong> placas para bater a
                meta de <strong>{metaPlacas}</strong>.
              </p>
            )}

            {/* Informação da faixa atual: % e estimativa R$/mês */}
            <div className="mt-3 text-sm">
              <p>
                Faixa atual: <strong>{faixaAtual.min}–{faixaAtual.max === Infinity ? "∞" : faixaAtual.max} placas</strong>
              </p>
              <p>
                Comissão: <strong>{faixaAtual.percent}%</strong> — estimativa:
                <strong> {faixaAtual.estimate}</strong>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
