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
import { useState, useEffect } from "react";
import { Download } from "lucide-react";

interface Cobranca {
  id: string;
  customer: string;
  customerName: string;
  value: number;
  dueDate: string;
  status: string;
  billingType: string;
}

export default function PerformanceReports() {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Busca as cobranças da API
  useEffect(() => {
    const fetchCobrancas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cobrancas');
        const result = await response.json();

        if (result.success) {
          setCobrancas(result.data || []);
        } else {
          setError(result.error || "Erro ao carregar cobranças");
        }
      } catch (err) {
        setError("Erro ao conectar com o servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchCobrancas();
  }, []);

  // Função para exportar dados
  const exportToCSV = () => {
    const headers = ["Cliente", "Valor", "Data Vencimento", "Status", "Tipo"];
    const csvContent = [
      headers.join(","),
      ...cobrancas.map(item => [
        item.customerName,
        `R$ ${item.value.toFixed(2)}`,
        new Date(item.dueDate).toLocaleDateString('pt-BR'),
        item.status,
        item.billingType
      ].join(","))
    ].join("\n");

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cobrancas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  // Cor do badge baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return "bg-green-100 text-green-800";
      case 'PENDING':
        return "bg-yellow-100 text-yellow-800";
      case 'RECEIVED':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Texto do status em português
  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'PENDING': return 'Pendente';
      case 'RECEIVED': return 'Recebido';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Relatórios de Cobranças</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando cobranças e clientes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Relatórios de Cobranças</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-red-800 font-medium">Erro</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-3"
              variant="outline"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relatórios de Cobranças</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={exportToCSV}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </CardHeader>
      
      <CardContent>
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 text-sm font-medium">Total de Cobranças</div>
            <div className="text-2xl font-bold text-blue-800">{cobrancas.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 text-sm font-medium">Valor Total</div>
            <div className="text-2xl font-bold text-green-800">
              {formatarValor(cobrancas.reduce((sum, item) => sum + item.value, 0))}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 text-sm font-medium">Confirmadas</div>
            <div className="text-2xl font-bold text-purple-800">
              {cobrancas.filter(item => item.status === 'CONFIRMED').length}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cobrancas.length > 0 ? (
              cobrancas.map((cobranca) => (
                <TableRow key={cobranca.id}>
                  <TableCell className="font-medium">
                    {cobranca.customerName}
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {cobranca.customer}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatarValor(cobranca.value)}
                  </TableCell>
                  <TableCell>
                    {formatarData(cobranca.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(cobranca.status)}>
                      {getStatusText(cobranca.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {cobranca.billingType}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhuma cobrança encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 text-sm text-gray-600">
          Total: {cobrancas.length} cobranças
        </div>
      </CardContent>
    </Card>
  );
}