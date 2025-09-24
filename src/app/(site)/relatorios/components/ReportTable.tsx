import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet } from "lucide-react";
import { NegociacaoRow } from "./types";

interface ReportTableProps {
  negociacoes: NegociacaoRow[];
  loading?: boolean;
  onExportCSV?: () => void;
}

export default function ReportTable({
  negociacoes,
  loading,
  onExportCSV,
}: ReportTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-md border bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-700">Últimas negociações</h3>
        <Button
          onClick={onExportCSV}
          disabled={negociacoes.length === 0}
          variant="outline"
          className="h-9 px-3 rounded-md border text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Cliente</TableHead>
              <TableHead className="min-w-[220px]">Veículo</TableHead>
              <TableHead className="min-w-[120px]">Valor</TableHead>
              <TableHead className="min-w-[140px]">Status</TableHead>
              <TableHead className="min-w-[140px]">Criada em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {negociacoes.length > 0 ? (
              negociacoes.map((negociacao, index) => (
                <TableRow
                  key={negociacao.id || index}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="font-medium">
                    {negociacao.cliente}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{negociacao.veiculo}</span>
                      {negociacao.placa && (
                        <span className="text-xs text-gray-500">
                          {negociacao.placa}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      {negociacao.valor}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(negociacao.status) as any}
                      className="text-xs"
                    >
                      {negociacao.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {negociacao.criadaEm}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  Nenhuma negociação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

// Função helper para determinar a variante do badge baseada no status
function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "venda concretizada":
    case "concretizada":
      return "default";
    case "em negociação":
    case "negociação":
      return "outline";
    case "arquivada":
    case "cancelada":
      return "secondary"; // Mudado para secondary em vez de destructive
    case "cotação recebida":
    case "recebida":
      return "secondary";
    default:
      return "outline";
  }
}
