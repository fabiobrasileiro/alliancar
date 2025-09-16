"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ReportCards from "./components/ReportCards";
import ReportCharts from "./components/ReportCharts";
import ReportTable from "./components/ReportTable";
import { ReportFilters, NegociacaoRow } from "./components/types";
import { useRelatorios } from "@/hooks/useRelatorios";

export default function RelatoriosPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    cooperativa: "",
    vendedor: "",
    dataInicio: "",
    dataFim: "",
  });

  const {
    summary,
    negociacoes,
    chartData,
    loading,
    error,
    loadReportData,
    exportToCSV,
  } = useRelatorios();

  // Processar negociações para a tabela
  const processedNegociacoes: NegociacaoRow[] = (negociacoes || []).map(
    (neg: any) => ({
      id: neg.id,
      cliente:
        neg.contatos?.nome ||
        neg.contato_nome ||
        neg.cliente ||
        "Cliente não informado",
      veiculo:
        `${neg.marca || ""} ${neg.modelo || ""} ${neg.ano_modelo || ""}`.trim() ||
        "Veículo não informado",
      valor: neg.valor_negociado
        ? `R$ ${neg.valor_negociado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "Valor não informado",
      status: neg.status || "Status não informado",
      criadaEm: new Date(neg.criado_em).toLocaleDateString("pt-BR"),
      contato_nome: neg.contatos?.nome || neg.contato_nome,
      marca: neg.marca,
      modelo: neg.modelo,
      placa: neg.placa,
      valor_negociado: neg.valor_negociado,
      afiliado_id: neg.afiliado_id,
    }),
  );

  const handleFilterChange = (field: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = async () => {
    try {
      await loadReportData(filters);
      console.log("Filtros aplicados - Relatório atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
    }
  };

  const handleExportCSV = () => {
    if (processedNegociacoes.length === 0) {
      console.warn("Nenhum dado para exportar");
      return;
    }

    try {
      exportToCSV(
        processedNegociacoes,
        `relatorio-negociacoes-${new Date().toISOString().split("T")[0]}`,
      );
      console.log("Exportação realizada - Arquivo CSV baixado com sucesso!");
    } catch (error) {
      console.error("Erro na exportação:", error);
    }
  };

  // Mostrar erro se houver
  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  }, [error]);

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

        <Button
          type="button"
          onClick={handleApplyFilters}
          disabled={loading}
          className="h-11 px-4 rounded-md bg-blue-600 text-white grid place-items-center shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            "Aplicar filtros"
          )}
        </Button>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando relatórios...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800">Erro ao carregar dados</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button
            onClick={() => loadReportData(filters)}
            variant="outline"
            className="mt-3"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Cards de resumo */}
          <ReportCards summary={summary} loading={loading} />

          {/* Gráficos */}
          <ReportCharts chartData={chartData} loading={loading} />

          {/* Tabela de negociações */}
          <ReportTable
            negociacoes={processedNegociacoes}
            loading={loading}
            onExportCSV={handleExportCSV}
          />
        </>
      )}
    </div>
  );
}
