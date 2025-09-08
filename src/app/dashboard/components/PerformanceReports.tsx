import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Performance } from "./types";

interface PerformanceReportsProps {
  performance: Performance[];
}

export default function PerformanceReports({ performance }: PerformanceReportsProps) {
  console.log('Perfomance:',performance)
  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relatórios de Performance</CardTitle>
        <Button variant="outline">Ver Relatório Completo</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performance.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.data}</TableCell>
                <TableCell>{item.cliente}</TableCell>
                <TableCell>{item.valor}</TableCell>
                <TableCell>{item.comissao}</TableCell>
                <TableCell>
                  <Badge
                    className={item.status === "pago" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}