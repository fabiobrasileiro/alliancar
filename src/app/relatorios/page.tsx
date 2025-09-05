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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Tipos de dados
interface Afiliado {
  id: string;
  nome_completo: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  ativo: boolean;
  tipo_usuario: string;
  criado_em: string;
  receita_estimada: number;
}

interface Venda {
  id: string;
  afiliado_id: string;
  afiliado_nome: string;
  cliente_nome: string;
  valor: number;
  tipo: string;
  status: string;
  data_criacao: string;
  placa: string;
  comissao: number;
}

interface Comissao {
  id: string;
  afiliado_id: string;
  afiliado_nome: string;
  periodo: string;
  valor: number;
  status: string;
  placas_ativas: number;
  percentual: number;
}

interface Saque {
  id: string;
  afiliado_id: string;
  afiliado_nome: string;
  valor: number;
  status: string;
  data_solicitacao: string;
  metodo: string;
}

interface Metricas {
  total_afiliados: number;
  afiliados_ativos: number;
  total_vendas: number;
  vendas_mes: number;
  comissoes_pendentes: number;
  comissoes_pagas: number;
  total_saques: number;
  receita_total: number;
}

export default function RelatoriosAdminPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [filtroAfiliado, setFiltroAfiliado] = useState("todos");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // Dados
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [saques, setSaques] = useState<Saque[]>([]);
  const [metricas, setMetricas] = useState<Metricas>({
    total_afiliados: 0,
    afiliados_ativos: 0,
    total_vendas: 0,
    vendas_mes: 0,
    comissoes_pendentes: 0,
    comissoes_pagas: 0,
    total_saques: 0,
    receita_total: 0
  });

  // Buscar dados ao carregar
  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      setLoading(true);

      // Buscar todos os dados em paralelo
      const [
        afiliadosResponse,
        vendasResponse,
        comissoesResponse,
        saquesResponse,
        pagamentosResponse
      ] = await Promise.all([
        // Afiliados
        supabase
          .from("afiliados")
          .select("id, nome_completo, cpf_cnpj, telefone, email, ativo, tipo_usuario, criado_em, receita_estimada"), 

        // Vendas (negociações)
        supabase
          .from("negociacoes")
          .select("id, created_at, tipo_veiculo, placa, origem_lead, valor_estimado")
          .order("created_at", { ascending: false }),

        // Comissões (pagamentos)
        supabase
          .from("pagamentos")
          .select("id, associado_id, associado_name, placa, comissao, status, data_criacao")
          .order("data_criacao", { ascending: false }),

        // Saques
        supabase
          .from("saques")
          .select("id, associado_id, data, valor, status, metodo")
          .order("data", { ascending: false }),

        // Todos os pagamentos para cálculo de métricas
        supabase
          .from("pagamentos")
          .select("comissao, status")
      ]);

      // Processar afiliados
      if (afiliadosResponse.data) {
        setAfiliados(afiliadosResponse.data);
      }

      // Processar vendas
      if (vendasResponse.data) {
        const vendasFormatadas = vendasResponse.data.map(venda => ({
          id: venda.id,
          afiliado_id: "", // Será preenchido depois
          afiliado_nome: "Não atribuído",
          cliente_nome: venda.origem_lead || "Cliente não identificado",
          valor: venda.valor_estimado || 0,
          tipo: venda.tipo_veiculo || "Veículo",
          status: "Concluída",
          data_criacao: venda.created_at,
          placa: venda.placa || "Sem placa",
          comissao: 0
        }));
        setVendas(vendasFormatadas);
      }

      // Processar comissões
      if (comissoesResponse.data) {
        setComissoes(comissoesResponse.data.map(comissao => ({
          id: comissao.id,
          afiliado_id: comissao.associado_id,
          afiliado_nome: comissao.associado_name || "Afiliado não identificado",
          periodo: new Date(comissao.data_criacao).toLocaleDateString('pt-BR'),
          valor: comissao.comissao,
          status: comissao.status,
          placas_ativas: 0, // Será calculado depois
          percentual: 0 // Será calculado depois
        })));
      }

      // Processar saques
      if (saquesResponse.data) {
        // Precisamos buscar os nomes dos afiliados para os saques
        const saquesComNomes = await Promise.all(
          saquesResponse.data.map(async (saque) => {
            const { data: afiliado } = await supabase
              .from("afiliados")
              .select("nome_completo")
              .eq("auth_id", saque.associado_id)
              .single();

            return {
              id: saque.id,
              afiliado_id: saque.associado_id,
              afiliado_nome: afiliado?.nome_completo || "Afiliado não identificado",
              valor: saque.valor,
              status: saque.status,
              data_solicitacao: saque.data,
              metodo: saque.metodo
            };
          })
        );
        setSaques(saquesComNomes);
      }

      // Calcular métricas
      if (pagamentosResponse.data) {
        const comissoesPendentes = pagamentosResponse.data
          .filter(p => p.status === "A receber")
          .reduce((sum, p) => sum + p.comissao, 0);

        const comissoesPagas = pagamentosResponse.data
          .filter(p => p.status === "Recebido")
          .reduce((sum, p) => sum + p.comissao, 0);

        const receitaTotal = pagamentosResponse.data
          .reduce((sum, p) => sum + p.comissao, 0);

        setMetricas({
          total_afiliados: afiliadosResponse.data?.length || 0,
          afiliados_ativos: afiliadosResponse.data?.filter(a => a.ativo)?.length || 0,
          total_vendas: vendasResponse.data?.length || 0,
          vendas_mes: vendasResponse.data?.filter(v => {
            const dataVenda = new Date(v.created_at);
            const hoje = new Date();
            return dataVenda.getMonth() === hoje.getMonth() && 
                   dataVenda.getFullYear() === hoje.getFullYear();
          })?.length || 0,
          comissoes_pendentes: comissoesPendentes,
          comissoes_pagas: comissoesPagas,
          total_saques: saquesResponse.data?.length || 0,
          receita_total: receitaTotal
        });
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do relatório");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    // Implementar lógica de filtros aqui
    toast.success("Filtros aplicados");
  };

  // Formatar valor monetário
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Formatar data
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  // Obter variante do badge baseado no status
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
      case 'pago':
      case 'recebido':
      case 'aprovado':
        return 'default';
      case 'pendente':
      case 'processando':
        return 'secondary';
      case 'inativo':
      case 'cancelado':
      case 'rejeitado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="block m-auto p-2 md:px-6 md:py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando relatórios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="block m-auto p-2 md:px-6 md:py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="font-bold leading-tight m-0 text-slate-700 text-2xl">
          Relatórios Administrativos
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Visão completa do sistema e todos os afiliados
        </p>
      </header>

      {/* Filtros principais */}
      <section className="mt-4 flex flex-wrap gap-3 items-end p-4 bg-slate-50 rounded-lg">
        <div className="min-w-56">
          <label className="block text-sm text-slate-600 mb-1">
            Afiliado
          </label>
          <Select value={filtroAfiliado} onValueChange={setFiltroAfiliado}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos os afiliados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os afiliados</SelectItem>
              {afiliados.map(afiliado => (
                <SelectItem key={afiliado.id} value={afiliado.id}>
                  {afiliado.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-56">
          <label className="block text-sm text-slate-600 mb-1">Status</label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
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
            value={filtroDataInicio}
            onChange={(e) => setFiltroDataInicio(e.target.value)}
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
            value={filtroDataFim}
            onChange={(e) => setFiltroDataFim(e.target.value)}
          />
        </div>

        <Button onClick={aplicarFiltros}>
          Aplicar filtros
        </Button>
      </section>

      {/* Cards de métricas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.total_afiliados}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.afiliados_ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.total_vendas}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.vendas_mes} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(metricas.comissoes_pagas)}</div>
            <p className="text-xs text-muted-foreground">
              {formatarMoeda(metricas.comissoes_pendentes)} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(metricas.receita_total)}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.total_saques} saques realizados
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Tabela de Afiliados */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Todos os Afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead>Receita Estimada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {afiliados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum afiliado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  afiliados.map(afiliado => (
                    <TableRow key={afiliado.id}>
                      <TableCell className="font-medium">{afiliado.nome_completo}</TableCell>
                      <TableCell>{afiliado.cpf_cnpj}</TableCell>
                      <TableCell>
                        <div>{afiliado.telefone}</div>
                        <div className="text-sm text-muted-foreground">{afiliado.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='gray'>
                          {afiliado.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatarData(afiliado.criado_em)}</TableCell>
                      <TableCell className="font-medium">
                        {formatarMoeda(afiliado.receita_estimada || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Tabela de Vendas */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Afiliado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  vendas.slice(0, 10).map(venda => (
                    <TableRow key={venda.id}>
                      <TableCell>{venda.cliente_nome}</TableCell>
                      <TableCell>{venda.tipo}</TableCell>
                      <TableCell>{venda.placa}</TableCell>
                      <TableCell className="font-medium">{formatarMoeda(venda.valor)}</TableCell>
                      <TableCell>{formatarData(venda.data_criacao)}</TableCell>
                      <TableCell>{venda.afiliado_nome}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Tabela de Comissões */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Comissões e Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comissoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Nenhuma comissão encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  comissoes.slice(0, 10).map(comissao => (
                    <TableRow key={comissao.id}>
                      <TableCell className="font-medium">{comissao.afiliado_nome}</TableCell>
                      <TableCell>{comissao.periodo}</TableCell>
                      <TableCell className="font-medium">{formatarMoeda(comissao.valor)}</TableCell>
                      <TableCell>
                        <Badge variant='blue'>
                          {comissao.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{comissao.periodo}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Tabela de Saques */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Saque</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Solicitação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saques.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Nenhum saque encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  saques.slice(0, 10).map(saque => (
                    <TableRow key={saque.id}>
                      <TableCell className="font-medium">{saque.afiliado_nome}</TableCell>
                      <TableCell className="font-medium">{formatarMoeda(saque.valor)}</TableCell>
                      <TableCell>{saque.metodo}</TableCell>
                      <TableCell>
                        <Badge variant='green'>
                          {saque.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatarData(saque.data_solicitacao)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}