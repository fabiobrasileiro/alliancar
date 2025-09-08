import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportSummary } from "./types";

interface ReportCardsProps {
  summary: ReportSummary;
}

export default function ReportCards({ summary }: ReportCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      <Card className="rounded-md border p-4 bg-white">
        <CardContent className="p-0">
          <strong className="text-2xl">{summary.negociacoesCriadas}</strong>
          <p className="text-slate-600">Negociações criadas</p>
        </CardContent>
      </Card>
      
      <Card className="rounded-md border p-4 bg-white">
        <CardContent className="p-0">
          <strong className="text-2xl text-blue-600">{summary.cotacoesCriadas}</strong>
          <p className="text-slate-600">Cotações criadas</p>
        </CardContent>
      </Card>
      
      <Card className="rounded-md border p-4 bg-white">
        <CardContent className="p-0">
          <strong className="text-2xl text-red-600">{summary.negociacoesArquivadas}</strong>
          <p className="text-slate-600">Negociações arquivadas</p>
        </CardContent>
      </Card>
      
      <Card className="rounded-md border p-4 bg-white">
        <CardContent className="p-0">
          <strong className="text-2xl text-green-600">{summary.vendasConcretizadas}</strong>
          <p className="text-slate-600">Vendas concretizadas</p>
        </CardContent>
      </Card>
    </div>
  );
}
