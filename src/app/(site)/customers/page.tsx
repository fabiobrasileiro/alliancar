"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile_phone: string;
  cpf_cnpj: string;
  address: string;
  address_number: string;
  complement: string;
  province: string;
  postal_code: string;
  city: number;
  city_name: string;
  country: string;
  external_reference: string;
  notification_disabled: boolean;
  additional_emails: string | null;
  observations: string | null;
  municipal_inscription: string | null;
  state_inscription: string | null;
  group_name: string;
  deleted: boolean;
  afiliado_id: string;
  created_at: string;
  updated_at: string;
  afiliado_nome?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAfiliado, setFilterAfiliado] = useState("");
  const [afiliados, setAfiliados] = useState<{id: string, nome_completo: string}[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchCustomers();
    fetchAfiliados();
  }, []);

  const fetchAfiliados = async () => {
    const { data } = await supabase
      .from("afiliados")
      .select("id, nome_completo")
      .eq("ativo", true);
    
    setAfiliados(data || []);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("customers")
        .select(`
          *,
          afiliados!inner(nome_completo)
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar customers:", error);
        return;
      }

      // Mapear os dados para incluir o nome do afiliado
      const customersComAfiliado = data?.map(customer => ({
        ...customer,
        afiliado_nome: customer.afiliados.nome_completo
      })) || [];

      setCustomers(customersComAfiliado);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.cpf_cnpj.includes(searchTerm) ||
      customer.phone.includes(searchTerm) ||
      customer.mobile_phone.includes(searchTerm);

    const matchesAfiliado = filterAfiliado ? customer.afiliado_id === filterAfiliado : true;

    return matchesSearch && matchesAfiliado;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getStatusBadge = (deleted: boolean) => {
    return deleted ? 
      <Badge variant="default">Deletado</Badge> : 
      <Badge variant="default">Ativo</Badge>;
  };

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Todos os Clientes</h2>
          <div className="text-sm text-gray-500">
            Total: {filteredCustomers.length} cliente(s)
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Buscar (nome, email, CPF, telefone):
              </label>
              <Input
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Filtrar por Afiliado:
              </label>
              <Select value={filterAfiliado} onValueChange={setFilterAfiliado}>
                <SelectTrigger>
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

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterAfiliado("");
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Total Clientes</div>
            <div className="text-xl font-bold text-blue-600">
              {customers.length}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Clientes Ativos</div>
            <div className="text-xl font-bold text-green-600">
              {customers.filter(c => !c.deleted).length}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Clientes Deletados</div>
            <div className="text-xl font-bold text-red-600">
              {customers.filter(c => c.deleted).length}
            </div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-sm text-gray-600">Afiliados com Clientes</div>
            <div className="text-xl font-bold text-purple-600">
              {new Set(customers.map(c => c.afiliado_id)).size}
            </div>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Atualizado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Carregando clientes...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className={customer.deleted ? "bg-gray-50" : ""}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        {customer.external_reference && (
                          <div className="text-xs text-gray-400">
                            Ref: {customer.external_reference}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div>{customer.email}</div>
                        <div className="text-sm text-gray-500">
                          Tel: {customer.phone}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cel: {customer.mobile_phone}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-mono text-sm">
                          {customer.cpf_cnpj}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {customer.address}, {customer.address_number}
                        </div>
                        {customer.complement && (
                          <div className="text-xs text-gray-500">
                            {customer.complement}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {customer.city_name} - {customer.province}
                        </div>
                        <div className="text-xs text-gray-500">
                          CEP: {customer.postal_code}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm font-medium">
                          {customer.afiliado_nome}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {customer.afiliado_id}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(customer.deleted)}
                        {customer.notification_disabled && (
                          <div className="text-xs text-orange-500 mt-1">
                            Notificações desativadas
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(customer.created_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(customer.created_at).split(' ')[1]}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(customer.updated_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(customer.updated_at).split(' ')[1]}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Botão para recarregar */}
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={fetchCustomers}
            variant="outline"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Recarregar Dados"}
          </Button>
        </div>
      </div>
    </SidebarLayout>
  );
}