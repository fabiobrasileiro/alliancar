import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewCardsProps {
  saldoDisponivel: string;
  saldoPendente: string;
  vendasMes: number;
  ranking: number;
}

export default function OverviewCards({
  saldoDisponivel,
  saldoPendente,
  vendasMes,
  ranking,
}: OverviewCardsProps) {
  const cards = [
    {
      title: "Comissão Adesão",
      value: saldoDisponivel,
      icon: "💰",
      color: "text-green-500",
    },
    {
      title: "Comissão Recorrente",
      value: saldoPendente,
      icon: "💰",
      color: "text-blue-500",
    },
    {
      title: "Total de Placas/Mês",
      value: vendasMes.toString(),
      icon: "📊",
      color: "text-purple-500",
    },
    {
      title: "Ranking Atual",
      value: `Posição ${ranking}`,
      icon: "🏆",
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <span className={card.color}>{card.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold px-8 mb-5">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
