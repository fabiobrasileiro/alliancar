import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { NegociacaoRow } from "./types";

interface ReportTableProps {
  negociacoes: NegociacaoRow[];
  loading?: boolean;
}

export default function ReportTable({ negociacoes, loading }: ReportTableProps) {
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
        <Button className="h-9 px-3 rounded-md border text-slate-700 hover:bg-slate-50">
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
                <TableRow key={index}>
                  <TableCell>{negociacao.cliente}</TableCell>
                  <TableCell>{negociacao.veiculo}</TableCell>
                  <TableCell>{negociacao.valor}</TableCell>
                  <TableCell>{negociacao.status}</TableCell>
                  <TableCell>{negociacao.criadaEm}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
