import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function MinhasMetas() {

interface Meta {
    nome: string
    dataInicial: string
    dataFinal: string
    tipo: string
    total: number
    concluido: number
    recompensa: string
    status: string
}

const metas: Meta[] = [
    {
      nome: "Meta 1",
      dataInicial: "2024-01-01",
      dataFinal: "2024-03-31",
      tipo: "Vendas",
      total: 100,
      concluido: 75,
      recompensa: "Bônus de R$500",
      status: "Em andamento",
    },
    {
      nome: "Meta 2",
      dataInicial: "2024-02-01",
      dataFinal: "2024-04-30",
      tipo: "Novos Clientes",
      total: 50,
      concluido: 50,
      recompensa: "Viagem",
      status: "Concluído",
    },
    {
      nome: "Meta 3",
      dataInicial: "2024-03-01",
      dataFinal: "2024-06-30",
      tipo: "Faturamento",
      total: 20000,
      concluido: 15000,
      recompensa: "Tablet",
      status: "Em andamento",
    },
] // Aqui você vai trazer os dados da API futuramente

  return (
    <div className="p-6">
      <Card className="p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Minhas Metas</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Meta</TableHead>
                <TableHead className="min-w-[150px]">Data Inicial</TableHead>
                <TableHead className="min-w-[150px]">Data Final</TableHead>
                <TableHead className="min-w-[180px]">Tipo</TableHead>
                <TableHead className="min-w-[180px]">Total</TableHead>
                <TableHead className="min-w-[180px]">Concluído</TableHead>
                <TableHead className="min-w-[180px]">Recompensa</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    Não há dados para exibir
                  </TableCell>
                </TableRow>
              ) : (
                metas.map((meta, index) => (
                  <TableRow key={index}>
                    <TableCell>{meta.nome}</TableCell>
                    <TableCell>{meta.dataInicial}</TableCell>
                    <TableCell>{meta.dataFinal}</TableCell>
                    <TableCell>{meta.tipo}</TableCell>
                    <TableCell>{meta.total}</TableCell>
                    <TableCell>{meta.concluido}</TableCell>
                    <TableCell>{meta.recompensa}</TableCell>
                    <TableCell>{meta.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação futuramente */}
        <div className="flex justify-center mt-4" id="pagination-container">
          {/* aqui pode entrar um componente de paginação */}
        </div>
      </Card>
    </div>
  )
}
