// hooks/useRelatorios.ts
import { useState, useEffect } from "react";
import { relatoriosService } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";

export interface ReportFilters {
  cooperativa: string;
  vendedor: string;
  dataInicio: string;
  dataFim: string;
}

export interface ReportSummary {
  negociacoesCriadas: number;
  cotacoesCriadas: number;
  negociacoesArquivadas: number;
  vendasConcretizadas: number;
  totalComissoes: number;
  totalPagamentos: number;
  metaCumprida: boolean;
  rankingPosicao?: number;
}

export interface ChartData {
  vendas_por_status: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  negociacoes_por_mes: Array<{
    mes: string;
    negociacoes: number;
    vendas: number;
  }>;
  comissoes_por_mes: Array<{
    mes: string;
    valor: number;
  }>;
  top_afiliados: Array<{
    nome: string;
    vendas: number;
    posicao: number;
  }>;
}

export function useRelatorios() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [negociacoes, setNegociacoes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { perfil } = useUser();

  const loadReportData = async (filters?: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);

      const afiliadoId = filters?.vendedor || perfil?.id;

      // Buscar dados em paralelo
      const [
        dashboardData,
        performanceData,
        negociacoesData,
        estatisticasData,
        rankingData,
        comissoesData,
        metasData,
      ] = await Promise.all([
        relatoriosService.getDashboardAfiliado(afiliadoId),
        relatoriosService.getPerformanceAfiliado(afiliadoId),
        relatoriosService.getNegociacoesAvaliacoes({
          afiliadoId,
          dataInicio: filters?.dataInicio,
          dataFim: filters?.dataFim,
        }),
        relatoriosService.getEstatisticasResumo({
          afiliadoId,
          dataInicio: filters?.dataInicio,
          dataFim: filters?.dataFim,
        }),
        relatoriosService.getRankingTop10(),
        relatoriosService.getComissoes({
          afiliadoId,
          dataInicio: filters?.dataInicio,
          dataFim: filters?.dataFim,
        }),
        relatoriosService.getMetasAfiliados(afiliadoId),
      ]);

      // Processar dados do resumo usando as views reais
      const negociacoesPorStatus = processarNegociacoesPorStatus(
        negociacoesData || [],
      );

      // Usar dados da view_dashboard_afiliado se disponível
      const dashboardInfo = dashboardData?.[0];

      const reportSummary: ReportSummary = {
        negociacoesCriadas: negociacoesData?.length || 0,
        cotacoesCriadas:
          negociacoesPorStatus.find((n) => n.status === "Cotação recebida")
            ?.count || 0,
        negociacoesArquivadas:
          negociacoesPorStatus.find((n) => n.status === "Arquivada")?.count ||
          0,
        vendasConcretizadas:
          negociacoesPorStatus.find((n) => n.status === "Venda concretizada")
            ?.count || 0,
        totalComissoes:
          dashboardInfo?.comissao_total || comissoesData?.length || 0,
        totalPagamentos:
          dashboardInfo?.comissao_recebida ||
          estatisticasData?.totalPagamentos ||
          0,
        metaCumprida: verificarMetaCumprida(
          metasData,
          negociacoesData?.length || 0,
        ),
        rankingPosicao:
          dashboardInfo?.ranking_atual ||
          rankingData?.find((r: any) => r.afiliado_id === afiliadoId)?.posicao,
      };

      // Processar dados dos gráficos
      const charts: ChartData = {
        vendas_por_status: processarVendasPorStatus(negociacoesPorStatus),
        negociacoes_por_mes: processarNegociacoesPorMes(negociacoesData || []),
        comissoes_por_mes: processarComissoesPorMes(comissoesData || []),
        top_afiliados: processarTopAfiliados(rankingData || []),
      };

      setSummary(reportSummary);
      setNegociacoes(negociacoesData || []);
      setChartData(charts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar relatórios",
      );
      console.error("Erro ao carregar relatórios:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadReportData();
  }, [perfil?.id]);

  return {
    summary,
    negociacoes,
    chartData,
    loading,
    error,
    loadReportData,
    exportToCSV,
  };
}

// Funções auxiliares para processamento de dados
function processarNegociacoesPorStatus(negociacoes: any[]) {
  const statusCount = negociacoes.reduce((acc: any, neg) => {
    const status = neg.status || "Sem status";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(statusCount).map(([status, count]) => ({
    status,
    count: count as number,
  }));
}

function processarVendasPorStatus(statusData: any[]) {
  const colors = {
    "Cotação recebida": "#3b82f6",
    "Em negociação": "#f59e0b",
    Vistoria: "#8b5cf6",
    "Liberada para cadastro": "#10b981",
    "Venda concretizada": "#059669",
    Arquivada: "#ef4444",
  };

  return statusData.map((item) => ({
    ...item,
    color: colors[item.status as keyof typeof colors] || "#6b7280",
  }));
}

function processarNegociacoesPorMes(negociacoes: any[]) {
  const meses = negociacoes.reduce((acc: any, neg) => {
    const data = new Date(neg.criado_em);
    const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;

    if (!acc[mesAno]) {
      acc[mesAno] = { negociacoes: 0, vendas: 0 };
    }

    acc[mesAno].negociacoes++;
    if (neg.status === "Venda concretizada") {
      acc[mesAno].vendas++;
    }

    return acc;
  }, {});

  return Object.entries(meses).map(([mes, data]: [string, any]) => ({
    mes,
    negociacoes: data.negociacoes,
    vendas: data.vendas,
  }));
}

function processarComissoesPorMes(comissoes: any[]) {
  const meses = comissoes.reduce((acc: any, comissao) => {
    const data = new Date(comissao.data_vencimento || comissao.criado_em);
    const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;

    if (!acc[mesAno]) {
      acc[mesAno] = 0;
    }

    acc[mesAno] += parseFloat(comissao.valor || 0);

    return acc;
  }, {});

  return Object.entries(meses).map(([mes, valor]: [string, any]) => ({
    mes,
    valor: parseFloat(valor.toFixed(2)),
  }));
}

function processarTopAfiliados(ranking: any[]) {
  return ranking.slice(0, 10).map((afiliado: any) => ({
    nome: afiliado.afiliados?.nome_completo || "Nome não informado",
    vendas: afiliado.total_vendas || 0,
    posicao: afiliado.posicao,
  }));
}

function verificarMetaCumprida(
  metas: any[] | null,
  totalVendas: number,
): boolean {
  if (!metas || metas.length === 0) return false;
  const metaAtual = metas[0];
  return (
    totalVendas >= (metaAtual?.vendas_meta || 0) || metaAtual?.atingido === true
  );
}
