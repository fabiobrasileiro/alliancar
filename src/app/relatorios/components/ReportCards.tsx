import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Target, Trophy } from "lucide-react";
import { ReportSummary } from "./types";

interface ReportCardsProps {
  summary: ReportSummary | null;
  loading?: boolean;
}

export default function ReportCards({ summary, loading }: ReportCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-md border p-4 bg-white">
            <CardContent className="p-0">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card className="rounded-md border p-4 bg-white">
          <CardContent className="p-0 text-center">
            <p className="text-slate-500">Nenhum dado disponível</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Negociações criadas",
      value: summary.negociacoesCriadas,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Cotações criadas",
      value: summary.cotacoesCriadas,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Vendas concretizadas",
      value: summary.vendasConcretizadas,
      icon: Trophy,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total de comissões",
      value: summary.totalComissoes,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`rounded-md border p-4 bg-white hover:shadow-md transition-shadow ${card.bgColor}`}
          >
            <CardContent className="p-0">
              <div className="flex items-start justify-between">
                <div>
                  <strong className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </strong>
                  <p className="text-slate-600 text-sm mt-1">{card.title}</p>
                </div>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Card adicional com indicadores extras */}
      <Card className="col-span-full bg-gradient-to-r from-blue-50 to-indigo-50 border p-4">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  summary.metaCumprida ? "default" : ("secondary" as any)
                }
              >
                {summary.metaCumprida ? "Meta Atingida" : "Meta Pendente"}
              </Badge>
              {summary.rankingPosicao && (
                <Badge variant={"outline" as any}>
                  #{summary.rankingPosicao} no Ranking
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Total de pagamentos</p>
              <strong className="text-lg text-indigo-600">
                {summary.totalPagamentos}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
