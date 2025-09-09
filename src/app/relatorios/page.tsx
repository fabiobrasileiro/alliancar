  "use client";
  import React, { useState } from "react";
  import { Input } from "@/components/ui/input";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import ReportCards from "./components/ReportCards";
  import ReportCharts from "./components/ReportCharts";
  import ReportTable from "./components/ReportTable";
  import { ReportSummary, NegociacaoRow, ReportFilters } from "./components/types";

  export default function RelatoriosPage() {
    const [filters, setFilters] = useState<ReportFilters>({
      cooperativa: "",
      vendedor: "",
      dataInicio: "",
      dataFim: "",
    });

    const summary: ReportSummary = {
      negociacoesCriadas: 6,
      cotacoesCriadas: 12,
      negociacoesArquivadas: 1,
      vendasConcretizadas: 0,
    };

    const mockNegociacoes: NegociacaoRow[] = [
      {
        cliente: "Hug Hug",
        veiculo: "Fiat Uno 2005",
        valor: "R$ 20,00",
        status: "Recebida",
        criadaEm: "28/08/2025",
      },
      {
        cliente: "Marília",
        veiculo: "Strada 2024",
        valor: "R$ 0,00",
        status: "Em negociação",
        criadaEm: "26/08/2025",
      },
      {
        cliente: "Teste",
        veiculo: "HR-V 2018",
        valor: "R$ 500,00",
        status: "Em negociação",
        criadaEm: "18/08/2025",
      },
    ];

    const handleFilterChange = (field: keyof ReportFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

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
            <label className="block text-sm text-slate-600 mb-1">Cooperativa</label>
            <Select
              value={filters.cooperativa}
              onValueChange={(value) => handleFilterChange("cooperativa", value)}
            >
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
            <Select
              value={filters.vendedor}
              onValueChange={(value) => handleFilterChange("vendedor", value)}
            >
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
            <Input
              id="dtDe"
              type="date"
              className="w-48"
              value={filters.dataInicio}
              onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
            />
          </div>
          <div className="min-w-40">
            <label htmlFor="dtAte" className="block text-sm text-slate-600 mb-1">
              Até
            </label>
            <Input
              id="dtAte"
              type="date"
              className="w-48"
              value={filters.dataFim}
              onChange={(e) => handleFilterChange("dataFim", e.target.value)}
            />
          </div>

          <button
            type="button"
            className="h-11 px-4 rounded-md bg-blue-600 text-white grid place-items-center shadow-sm"
          >
            Aplicar filtros
          </button>
        </section>

        {/* Cards de resumo */}
        <ReportCards summary={summary} />

        {/* Gráficos */}
        <ReportCharts />

        {/* Tabela de negociações */}
        <ReportTable negociacoes={mockNegociacoes} />
      </div>
    );
  }
