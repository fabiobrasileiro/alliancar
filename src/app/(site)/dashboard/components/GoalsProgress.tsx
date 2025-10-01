import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalsProgressProps {
  metaMensal: number;
  progresso: number;
  vendasNecessarias: number;
  progressoPorcentagem: number;
}

export default function GoalsProgress({
  metaMensal,
  progresso,
  vendasNecessarias,
  progressoPorcentagem

}: GoalsProgressProps) {

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Metas e Progresso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 px-9 mb-12">
          <div>
            <Progress value={progressoPorcentagem} className="h-2" />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">
              Faltam apenas {vendasNecessarias} vendas para bater sua meta
              mensal 🎯
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
