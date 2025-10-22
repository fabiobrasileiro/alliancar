import { Card, CardContent } from "@/components/ui/card";

interface OverviewCardsProps {
  valorAdesao: number;
  saldoPendente: number;
  vendasMes: number;
  ranking: number;
}

export default function OverviewCards({
  valorAdesao,
  saldoPendente,
  vendasMes,
  ranking,
}: OverviewCardsProps) {
  const cards = [
    {
      title: "COMISSÃO ADESÃO",
      value: valorAdesao,
      gradient: "from-primary-500 to-primary-400",
      textColor: "text-white",
    },
    {
      title: "COMISSÃO RECORRENTE", 
      value: saldoPendente,
      gradient: "from-sunshine-500 to-sunshine-400",
      textColor: "text-white",
    },
    {
      title: "TOTAL DE PLACAS/MÊS",
      value: vendasMes.toString(),
      gradient: "from-ocean-500 to-ocean-400", 
      textColor: "text-white",
    },
    {
      title: "RANKING ATUAL",
      value: `${ranking}° LUGAR`,
      gradient: "from-coral-500 to-coral-400",
      textColor: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card 
          key={index}
          className={`
            bg-gradient-to-br ${card.gradient} 
            shadow-glow border-0
            transition-all duration-300 
            hover:shadow-xl hover:scale-105
            min-h-[140px] flex items-center justify-center rounded-4xl
          `}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className={`text-lg font-bold uppercase tracking-wide ${card.textColor} opacity-90`}>
              {card.title}
            </div>
            <div className={`text-3xl font-bold ${card.textColor} font-mono`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}