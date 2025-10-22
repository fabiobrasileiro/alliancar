"use client";

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
import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Filter, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Cobranca {
  id: string;
  customer: string;
  value: number;
  due_date: string;
  status: string;
  billing_type: string;
  description: string | null;
  external_reference: string | null;
  payment_date: string | null;
  confirmed_date: string | null;
  invoice_url: string | null;
  invoice_number: string | null;
  created_at: string;
  customers: Customer | null;
}

interface Filtros {
  status: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
}

export default function PerformanceReports() {
  const supabase = createClient();
  const { perfil } = useUser();
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [cobrancasFiltradas, setCobrancasFiltradas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    status: 'TODOS',
    tipo: 'TODOS',
    dataInicio: '',
    dataFim: ''
  });

  // Busca as cobranças diretamente das tabelas
  const fetchCobrancas = useCallback(async () => {
    if (!perfil?.id) return;
    
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          customer,
          value,
          due_date,
          status,
          billing_type,
          description,
          external_reference,
          payment_date,
          confirmed_date,
          invoice_url,
          invoice_number,
          created_at,
          customers (
            id,
            name,
            email
          )
        `)
        .eq('afiliado_id', perfil.id)
        .eq('deleted', false)
        .order('due_date', { ascending: false })
        .limit(500);

      if (error) {
        throw error;
      }

      const rawData = data || [];
      const cobrancasData: Cobranca[] = rawData.map((item: any) => ({
        id: item.id,
        customer: item.customer,
        value: item.value,
        due_date: item.due_date,
        status: item.status,
        billing_type: item.billing_type,
        description: item.description,
        external_reference: item.external_reference,
        payment_date: item.payment_date,
        confirmed_date: item.confirmed_date,
        invoice_url: item.invoice_url,
        invoice_number: item.invoice_number,
        created_at: item.created_at,
        customers: Array.isArray(item.customers)
          ? (item.customers[0] ?? null)
          : (item.customers ?? null),
      }));
      setCobrancas(cobrancasData);
      setCobrancasFiltradas(cobrancasData);
    } catch (err: any) {
      console.error('Erro ao buscar cobranças:', err);
      setError(err.message || "Erro ao carregar cobranças");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [perfil?.id, supabase]);

  useEffect(() => {
    fetchCobrancas();
  }, [fetchCobrancas]);

  // Aplicar filtros
  useEffect(() => {
    let resultado = cobrancas;

    if (filtros.status !== 'TODOS') {
      resultado = resultado.filter(cobranca => cobranca.status === filtros.status);
    }

    if (filtros.tipo !== 'TODOS') {
      resultado = resultado.filter(cobranca => cobranca.billing_type === filtros.tipo);
    }

    if (filtros.dataInicio) {
      resultado = resultado.filter(cobranca => 
        new Date(cobranca.due_date) >= new Date(filtros.dataInicio)
      );
    }

    if (filtros.dataFim) {
      resultado = resultado.filter(cobranca => 
        new Date(cobranca.due_date) <= new Date(filtros.dataFim)
      );
    }

    setCobrancasFiltradas(resultado);
  }, [cobrancas, filtros]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCobrancas();
  };

  const limparFiltros = () => {
    setFiltros({
      status: 'TODOS',
      tipo: 'TODOS',
      dataInicio: '',
      dataFim: ''
    });
  };

  // Função para exportar dados
  const exportToCSV = () => {
    const headers = ["Cliente", "Email", "Valor", "Data Vencimento", "Status", "Tipo", "Descrição", "Referência", "Data Pagamento", "Número Fatura"];
    const csvContent = [
      headers.join(","),
      ...cobrancasFiltradas.map(item => [
        `"${item.customers?.name || 'N/A'}"`,
        `"${item.customers?.email || 'N/A'}"`,
        item.value.toFixed(2),
        new Date(item.due_date).toISOString().split('T')[0],
        item.status,
        item.billing_type,
        `"${item.description || ''}"`,
        `"${item.external_reference || ''}"`,
        item.payment_date ? new Date(item.payment_date).toISOString().split('T')[0] : '',
        `"${item.invoice_number || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cobrancas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Formata valor em Real
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Formata data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Formata data e hora
  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  // Cor do badge baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return "bg-green-100 text-green-800 border-green-200";
      case 'PENDING':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'RECEIVED':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'OVERDUE':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Texto do status em português
  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'PENDING': return 'Pendente';
      case 'RECEIVED': return 'Recebido';
      case 'OVERDUE': return 'Atrasado';
      default: return status;
    }
  };

  // Tipo de cobrança em português
  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case 'BOLETO': return 'Boleto';
      case 'CREDIT_CARD': return 'Cartão';
      case 'PIX': return 'PIX';
      default: return tipo;
    }
  };

  // Verificar se cobrança está atrasada
  const isAtrasada = (dueDate: string, status: string) => {
    return status === 'PENDING' && new Date(dueDate) < new Date();
  };

  // Estatísticas
  const totalValor = cobrancasFiltradas.reduce((sum, item) => sum + item.value, 0);
  const cobrancasConfirmadas = cobrancasFiltradas.filter(item => item.status === 'CONFIRMED').length;
  const cobrancasPendentes = cobrancasFiltradas.filter(item => item.status === 'PENDING').length;
  const cobrancasAtrasadas = cobrancasFiltradas.filter(item => isAtrasada(item.due_date, item.status)).length;


  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Relatórios de Cobranças</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe todas as suas cobranças e pagamentos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
            disabled={cobrancasFiltradas.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="TODOS">Todos os status</option>
                  <option value="PENDING">Pendente</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="RECEIVED">Recebido</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select 
                  value={filtros.tipo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="TODOS">Todos os tipos</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="CREDIT_CARD">Cartão</option>
                  <option value="PIX">PIX</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={limparFiltros}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="text-blue-600 text-sm font-medium">Total</div>
            <div className="text-2xl font-bold text-blue-800">{cobrancasFiltradas.length}</div>
            <div className="text-xs text-blue-600">cobranças</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border">
            <div className="text-green-600 text-sm font-medium">Valor Total</div>
            <div className="text-2xl font-bold text-green-800">
              {formatarValor(totalValor)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border">
            <div className="text-purple-600 text-sm font-medium">Confirmadas</div>
            <div className="text-2xl font-bold text-purple-800">
              {cobrancasConfirmadas}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border">
            <div className="text-orange-600 text-sm font-medium">Pendentes</div>
            <div className="text-2xl font-bold text-orange-800">
              {cobrancasPendentes}
            </div>
            {cobrancasAtrasadas > 0 && (
              <div className="text-xs text-red-600 mt-1">
                {cobrancasAtrasadas} atrasadas
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-4">
            <div className="text-red-800 font-medium">Erro ao carregar cobranças</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
            <Button 
              onClick={handleRefresh} 
              className="mt-3"
              variant="outline"
              size="sm"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Tabela */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cobrancasFiltradas.length > 0 ? (
                cobrancasFiltradas.map((cobranca) => {
                  const atrasada = isAtrasada(cobranca.due_date, cobranca.status);
                  
                  return (
                    <TableRow key={cobranca.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium">
                        <div className="font-semibold">{cobranca.customers?.name || 'Cliente não encontrado'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {cobranca.customers?.email || 'Email não disponível'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {cobranca.customer}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatarValor(cobranca.value)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className={atrasada ? "text-red-600 font-medium" : ""}>
                            {formatarData(cobranca.due_date)}
                          </span>
                        </div>
                        {atrasada && (
                          <div className="text-xs text-red-500 mt-1">Atrasada</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className={getStatusColor(cobranca.status)}>
                          {getStatusText(cobranca.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {getTipoText(cobranca.billing_type)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm text-gray-600 truncate block" title={cobranca.description || ''}>
                          {cobranca.description || '-'}
                        </span>
                        {cobranca.external_reference && (
                          <div className="text-xs text-gray-400 mt-1">
                            Ref: {cobranca.external_reference}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {cobranca.payment_date ? (
                          <div className="text-sm">
                            <div>{formatarData(cobranca.payment_date)}</div>
                            {cobranca.invoice_number && (
                              <div className="text-xs text-gray-500">
                                #{cobranca.invoice_number}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    {cobrancas.length === 0 ? 'Nenhuma cobrança encontrada' : 'Nenhuma cobrança corresponde aos filtros'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
          <span>
            Mostrando {cobrancasFiltradas.length} de {cobrancas.length} cobranças
            {filtros.status !== 'TODOS' || filtros.tipo !== 'TODOS' || filtros.dataInicio || filtros.dataFim ? ' (filtradas)' : ''}
          </span>
          {cobrancasFiltradas.length > 0 && (
            <span>Atualizado: {new Date().toLocaleTimeString('pt-BR')}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}