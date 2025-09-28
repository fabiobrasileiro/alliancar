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
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Filter, X, Download, FileText, Sheet } from "lucide-react";

interface PerformanceReportsProps {
  performance: Performance[];
}

type SortField = keyof Performance | '';
type SortDirection = 'asc' | 'desc';
type ExportFormat = 'csv' | 'json' | 'xlsx';

export default function PerformanceReports({
  performance,
}: PerformanceReportsProps) {
  // Estados dos filtros
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [clienteFilter, setClienteFilter] = useState<string>("");
  const [valorMinFilter, setValorMinFilter] = useState<string>("");
  const [valorMaxFilter, setValorMaxFilter] = useState<string>("");
  const [dataInicioFilter, setDataInicioFilter] = useState<string>("");
  const [dataFimFilter, setDataFimFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filtra e ordena os dados
  const filteredPerformance = useMemo(() => {
    let filtered = performance.filter((item) => {
      // Filtro por status
      const statusMatch = statusFilter === "todos" || item.status === statusFilter;
      
      // Filtro por cliente
      const clienteMatch = !clienteFilter || 
        item.cliente.toLowerCase().includes(clienteFilter.toLowerCase());
      
      // Filtro por valor
      const valor = parseFloat(item.valor.replace('R$', '').replace('.', '').replace(',', '.'));
      const valorMin = valorMinFilter ? parseFloat(valorMinFilter) : -Infinity;
      const valorMax = valorMaxFilter ? parseFloat(valorMaxFilter) : Infinity;
      const valorMatch = valor >= valorMin && valor <= valorMax;
      
      // Filtro por data
      const itemDate = new Date(item.data.split('/').reverse().join('-'));
      const dataInicio = dataInicioFilter ? new Date(dataInicioFilter) : null;
      const dataFim = dataFimFilter ? new Date(dataFimFilter) : null;
      
      let dataMatch = true;
      if (dataInicio) dataMatch = dataMatch && itemDate >= dataInicio;
      if (dataFim) dataMatch = dataMatch && itemDate <= dataFim;
      
      return statusMatch && clienteMatch && valorMatch && dataMatch;
    });

    // Ordenação
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Converte valores para comparação
        if (sortField === 'valor') {
          aValue = parseFloat(aValue.replace('R$', '').replace('.', '').replace(',', '.'));
          bValue = parseFloat(bValue.replace('R$', '').replace('.', '').replace(',', '.'));
        } else if (sortField === 'data') {
          aValue = new Date(aValue.split('/').reverse().join('-'));
          bValue = new Date(bValue.split('/').reverse().join('-'));
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    performance, 
    statusFilter, 
    clienteFilter, 
    valorMinFilter, 
    valorMaxFilter, 
    dataInicioFilter, 
    dataFimFilter,
    sortField,
    sortDirection
  ]);

  // Função para exportar dados
  const exportData = async (format: ExportFormat) => {
    setIsExporting(true);
    
    try {
      const dataToExport = filteredPerformance.map(item => ({
        Data: item.data,
        Cliente: item.cliente,
        Valor: item.valor,
        Comissão: item.comissao,
        Status: item.status,
        ID: item.id
      }));

      let blob: Blob;
      let filename: string;
      const timestamp = new Date().toISOString().split('T')[0];

      switch (format) {
        case 'csv':
          const headers = ['Data', 'Cliente', 'Valor', 'Comissão', 'Status', 'ID'];
          const csvContent = [
            headers.join(','),
            ...dataToExport.map(row => 
              headers.map(header => {
                const value = row[header as keyof typeof row];
                // Escapa vírgulas e aspas para CSV
                return `"${String(value).replace(/"/g, '""')}"`;
              }).join(',')
            )
          ].join('\n');
          
          blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
          filename = `relatorio-performance-${timestamp}.csv`;
          break;

        case 'json':
          const jsonContent = JSON.stringify(dataToExport, null, 2);
          blob = new Blob([jsonContent], { type: 'application/json' });
          filename = `relatorio-performance-${timestamp}.json`;
          break;

        case 'xlsx':
          // Para XLSX, usamos uma solução simples com HTML table
          // Em produção, você pode usar uma lib como sheetjs
          const htmlTable = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:x="urn:schemas-microsoft-com:office:excel" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
              <meta charset="UTF-8">
              <title>Relatório Performance</title>
              <!--[if gte mso 9]>
              <xml>
                <x:ExcelWorkbook>
                  <x:ExcelWorksheets>
                    <x:ExcelWorksheet>
                      <x:Name>Relatório</x:Name>
                      <x:WorksheetOptions>
                        <x:DisplayGridlines/>
                      </x:WorksheetOptions>
                    </x:ExcelWorksheet>
                  </x:ExcelWorksheets>
                </x:ExcelWorkbook>
              </xml>
              <![endif]-->
            </head>
            <body>
              <table border="1">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Comissão</th>
                    <th>Status</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  ${dataToExport.map(row => `
                    <tr>
                      <td>${row.Data}</td>
                      <td>${row.Cliente}</td>
                      <td>${row.Valor}</td>
                      <td>${row.Comissão}</td>
                      <td>${row.Status}</td>
                      <td>${row.ID}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
            </html>
          `;
          
          blob = new Blob([htmlTable], { 
            type: 'application/vnd.ms-excel' 
          });
          filename = `relatorio-performance-${timestamp}.xls`;
          break;
      }

      // Cria download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Exportado com sucesso: ${filename}`);

    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar os dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Dropdown de exportação
  const ExportDropdown = () => (
    <div className="relative group">
      <Button 
        variant="outline" 
        size="sm"
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {isExporting ? 'Exportando...' : 'Exportar'}
      </Button>
      
      <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <button
          onClick={() => exportData('csv')}
          disabled={isExporting}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          Exportar CSV
        </button>
        <button
          onClick={() => exportData('json')}
          disabled={isExporting}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          Exportar JSON
        </button>
        <button
          onClick={() => exportData('xlsx')}
          disabled={isExporting}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <Sheet className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>
    </div>
  );

  // Manipulação da ordenação
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setStatusFilter("todos");
    setClienteFilter("");
    setValorMinFilter("");
    setValorMaxFilter("");
    setDataInicioFilter("");
    setDataFimFilter("");
    setSortField('');
    setSortDirection('asc');
  };

  // Verifica se há filtros ativos
  const hasActiveFilters = 
    statusFilter !== "todos" ||
    clienteFilter !== "" ||
    valorMinFilter !== "" ||
    valorMaxFilter !== "" ||
    dataInicioFilter !== "" ||
    dataFimFilter !== "";

  // Renderiza ícone de ordenação
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relatórios de Performance</CardTitle>
        <div className="flex gap-2">
          <ExportDropdown />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="default" className="ml-1 bg-blue-500 text-white">
                !
              </Badge>
            )}
          </Button>
          {/* <Button variant="outline">Ver Relatório Completo</Button> */}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Seção de Filtros Expandível */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-center w-full mb-2">
              <h3 className="font-semibold">Filtros</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {/* Filtro por Status */}
            <div className="flex flex-col gap-2 min-w-[150px]">
              <label className="text-sm font-medium">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-md text-sm"
              >
                <option value="todos">Todos</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="processando">Processando</option>
              </select>
            </div>

            {/* Filtro por Cliente */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              <label className="text-sm font-medium">Cliente</label>
              <input 
                type="text"
                placeholder="Buscar cliente..."
                value={clienteFilter}
                onChange={(e) => setClienteFilter(e.target.value)}
                className="p-2 border rounded-md text-sm"
              />
            </div>

            {/* Filtro por Valor */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="Mín"
                  value={valorMinFilter}
                  onChange={(e) => setValorMinFilter(e.target.value)}
                  className="p-2 border rounded-md text-sm w-20"
                />
                <span className="self-center">-</span>
                <input 
                  type="number"
                  placeholder="Máx"
                  value={valorMaxFilter}
                  onChange={(e) => setValorMaxFilter(e.target.value)}
                  className="p-2 border rounded-md text-sm w-20"
                />
              </div>
            </div>

            {/* Filtro por Período */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Período</label>
              <div className="flex gap-2">
                <input 
                  type="date"
                  value={dataInicioFilter}
                  onChange={(e) => setDataInicioFilter(e.target.value)}
                  className="p-2 border rounded-md text-sm"
                />
                <span className="self-center">até</span>
                <input 
                  type="date"
                  value={dataFimFilter}
                  onChange={(e) => setDataFimFilter(e.target.value)}
                  className="p-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contador de resultados */}
        <div className="flex justify-between items-center mb-4 px-8">
          <div className="text-sm text-gray-600">
            Mostrando {filteredPerformance.length} de {performance.length} resultados
            {hasActiveFilters && " (filtrado)"}
          </div>
          
          {filteredPerformance.length > 0 && (
            <div className="text-xs text-gray-500">
              Dados prontos para exportação
            </div>
          )}
        </div>

        {/* Tabela com ordenação */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('data')}
              >
                <div className="flex items-center gap-1">
                  Data
                  {renderSortIcon('data')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('cliente')}
              >
                <div className="flex items-center gap-1">
                  Cliente
                  {renderSortIcon('cliente')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('valor')}
              >
                <div className="flex items-center gap-1">
                  Valor
                  {renderSortIcon('valor')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('comissao')}
              >
                <div className="flex items-center gap-1">
                  Comissão
                  {renderSortIcon('comissao')}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPerformance.length > 0 ? (
              filteredPerformance.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.data}</TableCell>
                  <TableCell>{item.cliente}</TableCell>
                  <TableCell>{item.valor}</TableCell>
                  <TableCell>{item.comissao}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === "pago"
                          ? "bg-green-100 text-green-800"
                          : item.status === "pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum resultado encontrado com os filtros atuais
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}