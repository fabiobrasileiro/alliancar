import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RelatoriosPage() {
  return (
    <div className="block m-auto p-2 md:px-6 md:py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="font-bold leading-tight m-0 text-slate-700 text-2xl">
          Relatórios - Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Visão geral consolidada dos principais indicadores
        </p>
      </header>

      {/* Filtros principais */}
      <section className="mt-4 flex flex-wrap gap-3 items-end">
        <div className="min-w-56">
          <label className="block text-sm text-slate-600 mb-1">
            Cooperativa
          </label>
          <Select>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11375">ALLIANCAR CLUB</SelectItem>
              <SelectItem value="0">Sem cooperativa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-56">
          <label className="block text-sm text-slate-600 mb-1">Vendedor</label>
          <Select>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="123998">Marcel Araújo</SelectItem>
              <SelectItem value="124886">Allan Fernandes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-40">
          <label htmlFor="dtDe" className="block text-sm text-slate-600 mb-1">
            De
          </label>
          <Input id="dtDe" type="date" className="w-48" />
        </div>
        <div className="min-w-40">
          <label htmlFor="dtAte" className="block text-sm text-slate-600 mb-1">
            Até
          </label>
          <Input id="dtAte" type="date" className="w-48" />
        </div>

        <button
          type="button"
          className="h-11 px-4 rounded-md bg-blue-600 text-white grid place-items-center shadow-sm"
        >
          Aplicar filtros
        </button>
      </section>

      {/* Cards de resumo */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="rounded-md border p-4 bg-white">
          <strong className="text-2xl">6</strong>
          <p className="text-slate-600">Negociações criadas</p>
        </div>
        <div className="rounded-md border p-4 bg-white">
          <strong className="text-2xl text-blue-600">12</strong>
          <p className="text-slate-600">Cotações criadas</p>
        </div>
        <div className="rounded-md border p-4 bg-white">
          <strong className="text-2xl text-red-600">1</strong>
          <p className="text-slate-600">Negociações arquivadas</p>
        </div>
        <div className="rounded-md border p-4 bg-white">
          <strong className="text-2xl text-green-600">0</strong>
          <p className="text-slate-600">Vendas concretizadas</p>
        </div>
      </section>

      {/* Seções de gráficos (placeholders) */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-md border bg-white p-4">
          <h3 className="font-semibold text-slate-700 mb-3">
            Vendas por status
          </h3>
          <div className="h-64 grid place-items-center text-slate-500">
            Gráfico em breve
          </div>
        </div>
        <div className="rounded-md border bg-white p-4">
          <h3 className="font-semibold text-slate-700 mb-3">
            Negociações por etapa
          </h3>
          <div className="h-64 grid place-items-center text-slate-500">
            Gráfico em breve
          </div>
        </div>
      </section>

      {/* Tabela de últimas negociações */}
      <section className="mt-8 rounded-md border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700">Últimas negociações</h3>
          <button className="h-9 px-3 rounded-md border text-slate-700 hover:bg-slate-50">
            Exportar CSV
          </button>
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
              <TableRow>
                <TableCell>Hug Hug</TableCell>
                <TableCell>Fiat Uno 2005</TableCell>
                <TableCell>R$ 20,00</TableCell>
                <TableCell>Recebida</TableCell>
                <TableCell>28/08/2025</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Marília</TableCell>
                <TableCell>Strada 2024</TableCell>
                <TableCell>R$ 0,00</TableCell>
                <TableCell>Em negociação</TableCell>
                <TableCell>26/08/2025</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Teste</TableCell>
                <TableCell>HR-V 2018</TableCell>
                <TableCell>R$ 500,00</TableCell>
                <TableCell>Em negociação</TableCell>
                <TableCell>18/08/2025</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
