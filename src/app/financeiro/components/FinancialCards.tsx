import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "./types";

interface FinancialCardsProps {
  summary: FinancialSummary;
}

export default function FinancialCards({ summary }: FinancialCardsProps) {
  const cards = [
    {
      title: "Saldo Total",
      value: summary.saldoTotal,
      icon: "💰",
      color: "text-green-600",
    },
    {
      title: "Saldo Disponível",
      value: summary.saldoDisponivel,
      icon: "✅",
      color: "text-blue-600",
    },
    {
      title: "Saldo Pendente",
      value: summary.saldoPendente,
      icon: "⏳",
      color: "text-orange-600",
    },
    {
      title: "Total de Transações",
      value: summary.totalTransacoes.toString(),
      icon: "📊",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <span className="text-2xl">{card.icon}</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
