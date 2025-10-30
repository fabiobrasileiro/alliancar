import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalsProgressAfiliadoProps {
  metaMensal: number;
  totalAssinaturas: number;
  totalPagamentos: number;
}

export default function GoalsProgressAfiliado({
  metaMensal,
  totalAssinaturas,
  totalPagamentos,
}: GoalsProgressAfiliadoProps) {

  const progresso = totalAssinaturas + totalPagamentos;
  const progressoPorcentagem = Math.min((progresso / metaMensal) * 100, 120);
  const vendasNecessarias = Math.max(metaMensal - progresso, 0);

  const formatar = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>🎯 Metas e Progresso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 px-9 mb-12">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{progressoPorcentagem.toFixed(0)}%</span>
          </div>

          <Progress value={progressoPorcentagem} className="h-2" />

          <div
            className={`${
              progressoPorcentagem >= 100 ? "bg-green-500" : "bg-blue-600"
            } p-4 rounded-lg mt-4`}
          >
            {progressoPorcentagem >= 100 ? (
              <p className="text-white font-medium">
                🏆 Parabéns! Você ultrapassou sua meta mensal com{" "}
                {formatar(progresso)}!
              </p>
            ) : (
              <p className="text-white font-medium">
                Faltam apenas {formatar(vendasNecessarias)} para bater sua meta
                mensal de {formatar(metaMensal)}.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
