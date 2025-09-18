import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RankingTop10 } from "./types";

interface RankingProps {
  rankingTop10: RankingTop10[];
  userName: string;
}

export default function Ranking({ rankingTop10, userName }: RankingProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Ranking Top 10</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankingTop10.map((afiliado) => (
            <div
              key={afiliado.posicao}
              className={`flex items-center justify-between p-2 rounded ${afiliado.nome.includes(userName) ? "bg-blue-50 border border-blue-200" : ""}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${
                    afiliado.posicao === 1
                      ? "bg-yellow-100 text-yellow-800"
                      : afiliado.posicao === 2
                        ? "bg-gray-100 text-gray-800"
                        : afiliado.posicao === 3
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {afiliado.posicao}
                </div>
                <span className="ml-2 text-sm">{afiliado.nome}</span>
              </div>
              <Badge>{afiliado.vendas} vendas</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
