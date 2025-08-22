"use client"
import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Venda {
  pagamento: string
  data: string
  associado: string
  placa: string
  comissao: string
  status: string
}

export default function MinhasVendas() {
  const [vendas] = useState<Venda[]>([]) // dados futuros da API

  return (
    <div className="p-6">
      {/* Banner Hinova Pay */}
      <Card className="flex items-center mb-6">
        <Image 
          src="/assets/external/images/hinova-pay.jpeg"
          alt="Hinova Pay"
          width={150}
          height={90}
          className="w-[150px] ml-4"
        />
        <Image width={150} height={150} src="/assets/external/images/hinova-pay.jpeg" alt="Hinova Pay" className="w-[150px] ml-4" />
        <div className="mx-4 border-l h-16" />
        <div className="flex-1">
          <p className="text-lg font-semibold">
            Abra sua conta na Hinova Pay e receba comissões direto em sua conta digital.
          </p>
        </div>
        <Button className="mr-4">Abrir Conta</Button>
      </Card>

      {/* Título */}
      <h2 className="text-2xl font-semibold mb-6">Minhas Vendas</h2>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="block mb-1 text-sm">De:</span>
            <Input type="date" defaultValue="2025-08-01" id="filterDateFrom" />
          </div>
          <div>
            <span className="block mb-1 text-sm">Até:</span>
            <Input type="date" defaultValue="2025-08-31" id="filterDateTo" />
          </div>
          <div>
            <span className="block mb-1 text-sm">Filtrar por:</span>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Boleto Gerado</SelectItem>
                <SelectItem value="2">Cancelado</SelectItem>
                <SelectItem value="3">Aguardando Liberação</SelectItem>
                <SelectItem value="4">A receber</SelectItem>
                <SelectItem value="5">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Resumo */}
      <div className="mb-6">
        <p className="text-gray-700">&gt; Total <strong id="totalSalesCounter">{vendas.length}</strong> Vendas</p>
      </div>

      <Card className="p-4 mb-6 flex justify-between items-center">
        <span>Total</span>
        <span className="text-xl font-bold text-blue-600" id="totalSalesValue">R$ 0,00</span>
      </Card>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Pagamento</TableHead>
              <TableHead className="min-w-[100px]">Data</TableHead>
              <TableHead className="min-w-[180px]">Associado</TableHead>
              <TableHead className="min-w-[100px]">Placa</TableHead>
              <TableHead className="min-w-[180px]">Comissão</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Nenhuma venda encontrada
                </TableCell>
              </TableRow>
            ) : (
              vendas.map((venda, index) => (
                <TableRow key={index}>
                  <TableCell>{venda.pagamento}</TableCell>
                  <TableCell>{venda.data}</TableCell>
                  <TableCell>{venda.associado}</TableCell>
                  <TableCell>{venda.placa}</TableCell>
                  <TableCell>{venda.comissao}</TableCell>
                  <TableCell>{venda.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
