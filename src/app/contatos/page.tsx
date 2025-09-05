"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ContactRow {
  id: string;
  nome: string;
  email?: string;
  celular?: string;
  cpf_cnpj?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  origem_lead?: string;
  veiculo_trabalho?: boolean;
  enviar_cotacao_email?: boolean;
  afiliado_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// Importações dos componentes UI
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper para renderizar valores de forma segura
const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

// Opções para origem do lead
const ORIGEM_LEAD_OPTIONS = [
  "Facebook",
  "Google",
  "Indicação",
  "Instagram",
  "Presencial",
  "Site"
];

export default function ContatosPage() {
  const supabase = createClient();

  // Estados para filtros
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [estado, setEstado] = useState("");
  const [origemLead, setOrigemLead] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para dados e paginação
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 5; // itens por página

  // Estados para edição
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Estados para adicionar contato
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<ContactRow>>({
    nome: "",
    email: "",
    celular: "",
    cpf_cnpj: "",
    cep: "",
    estado: "",
    cidade: "",
    origem_lead: "",
    veiculo_trabalho: false,
    enviar_cotacao_email: false
  });

  // Construir query de filtro
  const buildQuery = () => {
    let query = supabase.from("contatos").select("*", { count: "exact" });

    if (nome) {
      query = query.ilike("nome", `%${nome}%`);
    }
    if (email) {
      query = query.ilike("email", `%${email}%`);
    }
    if (celular) {
      query = query.ilike("celular", `%${celular}%`);
    }
    if (cpfCnpj) {
      query = query.ilike("cpf_cnpj", `%${cpfCnpj}%`);
    }
    if (estado) {
      query = query.ilike("estado", `%${estado}%`);
    }
    if (origemLead) {
      query = query.eq("origem_lead", origemLead);
    }
    if (searchTerm) {
      query = query.or(
        `nome.ilike.%${searchTerm}%,celular.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
      );
    }

    return query;
  };

  // Função para buscar dados
  const fetchData = async () => {
    setLoading(true);
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    try {
      const query = buildQuery();

      const { data, error, count } = await query
        .range(start, end)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar contatos");
        return;
      }

      setRows(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar contatos");
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados quando os filtros ou página mudarem
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  // Handler para o formulário de busca
  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setPage(1); // Reset para a primeira página ao aplicar novos filtros
    fetchData();
  };

  // Handler para adicionar contato
  const handleAdd = () => {
    setNewContact({
      nome: "",
      email: "",
      celular: "",
      cpf_cnpj: "",
      cep: "",
      estado: "",
      cidade: "",
      origem_lead: "",
      veiculo_trabalho: false,
      enviar_cotacao_email: false
    });
    setIsAddDialogOpen(true);
  };

  // Handler para salvar novo contato
  const handleSaveNew = async () => {
    try {
      const { error } = await supabase
        .from("contatos")
        .insert([{
          nome: newContact.nome,
          email: newContact.email,
          celular: newContact.celular,
          cpf_cnpj: newContact.cpf_cnpj,
          cep: newContact.cep,
          estado: newContact.estado,
          cidade: newContact.cidade,
          origem_lead: newContact.origem_lead,
          veiculo_trabalho: newContact.veiculo_trabalho,
          enviar_cotacao_email: newContact.enviar_cotacao_email
        }]);

      if (error) {
        throw error;
      }

      toast.success("Contato adicionado com sucesso");
      setIsAddDialogOpen(false);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao adicionar contato:", error);
      toast.error("Erro ao adicionar contato");
    }
  };

  // Handler para editar contato
  const handleEdit = (contact: ContactRow) => {
    setEditingContact(contact);
    setIsEditDialogOpen(true);
  };

  // Handler para salvar edição
  const handleSaveEdit = async () => {
    if (!editingContact) return;

    try {
      const { error } = await supabase
        .from("contatos")
        .update({
          nome: editingContact.nome,
          email: editingContact.email,
          celular: editingContact.celular,
          cpf_cnpj: editingContact.cpf_cnpj,
          cep: editingContact.cep,
          estado: editingContact.estado,
          cidade: editingContact.cidade,
          origem_lead: editingContact.origem_lead,
          veiculo_trabalho: editingContact.veiculo_trabalho,
          enviar_cotacao_email: editingContact.enviar_cotacao_email,
        })
        .eq("id", editingContact.id);

      if (error) {
        throw error;
      }

      toast.success("Contato atualizado com sucesso");
      setIsEditDialogOpen(false);
      setEditingContact(null);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      toast.error("Erro ao atualizar contato");
    }
  };

  // Handler para deletar contato
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("contatos").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Contato deletado com sucesso");
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao deletar contato:", error);
      toast.error("Erro ao deletar contato");
    }
  };

  // Handler para seleção de contatos
  const toggleContactSelection = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id],
    );
  };

  // Handler para selecionar todos os contatos
  const toggleSelectAll = () => {
    if (selectedContacts.length === rows.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(rows.map((contact) => contact.id));
    }
  };

  // Handler para deletar múltiplos contatos
  const handleDeleteMultiple = async () => {
    if (selectedContacts.length === 0) return;

    try {
      const { error } = await supabase
        .from("contatos")
        .delete()
        .in("id", selectedContacts);

      if (error) {
        throw error;
      }

      toast.success(
        `${selectedContacts.length} contatos deletados com sucesso`,
      );
      setSelectedContacts([]);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao deletar contatos:", error);
      toast.error("Erro ao deletar contatos");
    }
  };

  return (
    <>
      <div className="px-5 py-5">
        <header className="flex flex-col flex-wrap">
          <h2 className="font-bold leading-tight m-0 text-jelly-bean-950 text-2xl">
            Contatos
          </h2>
          <header className="flex items-center justify-between flex-wrap mt-2">
            <nav className="flex items-center flex-wrap gap-2">
              <span className="text-slate-950 text-sm flex gap-2 items-center">
                <Link className="hover:opacity-70" href="/">
                  Home
                </Link>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
              <span className="text-sm text-jelly-bean-700">
                <Link className="hover:opacity-70" href="/crm/client">
                  Contatos
                </Link>
              </span>
            </nav>
          </header>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mt-8 items-start w-full max-[1140px]:flex-wrap">
          <div className="flex flex-col flex-1 flex-grow max-lg:w-full">
            <Card className="overflow-hidden">
              <CardHeader className="p-8 flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Contatos</CardTitle>
                  <CardDescription>
                    {rows?.length} contatos encontrados
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={handleAdd}
                    className="bg-jelly-bean-900"
                  >
                    Adicionar Contato
                  </Button>
                  {selectedContacts.length > 0 && (
                    <Button variant="default" onClick={handleDeleteMultiple}>
                      Excluir Selecionados ({selectedContacts.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-md:overflow-auto max-md:max-w-full">
                  <Table className="flex-nowrap bg-jelly-bean-950 text-white">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-8 w-10">
                          <Checkbox
                            aria-label="Selecionar todos"
                            checked={
                              selectedContacts.length === rows.length &&
                              rows.length > 0
                            }
                            onChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Celular</TableHead>
                        <TableHead>CPF/CNPJ</TableHead>
                        <TableHead>CEP</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Origem</TableHead>
                        {/* <TableHead>Veículo Trabalho</TableHead>
                        <TableHead>Enviar Cotação</TableHead> */}
                        <TableHead className="w-16 text-center">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="flex-nowrap bg-jelly-bean-50 text-jelly-bean-950 ">
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-4">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-4">
                            Nenhum contato encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="pl-8">
                              <Checkbox
                                aria-label={`Selecionar contato ${r.nome || r.id}`}
                                checked={selectedContacts.includes(r.id)}
                                onChange={() => toggleContactSelection(r.id)}
                              />
                            </TableCell>
                            <TableCell>{renderValue(r.nome)}</TableCell>
                            <TableCell>{renderValue(r.email)}</TableCell>
                            <TableCell>{renderValue(r.celular)}</TableCell>
                            <TableCell>{renderValue(r.cpf_cnpj)}</TableCell>
                            <TableCell>{renderValue(r.cep)}</TableCell>
                            <TableCell>{renderValue(r.estado)}</TableCell>
                            <TableCell>{renderValue(r.cidade)}</TableCell>
                            <TableCell>{renderValue(r.origem_lead)}</TableCell>
                            {/* <TableCell>{r.veiculo_trabalho ? "Sim" : "Não"}</TableCell>
                            <TableCell>{r.enviar_cotacao_email ? "Sim" : "Não"}</TableCell> */}
                            <TableCell className="w-16 text-center">
                              <div className="flex justify-center space-x-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleEdit(r)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-pencil"
                                  >
                                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                                    <path d="M15 5l4 4" />
                                  </svg>
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    setContactToDelete(r.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-trash-2"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    <line x1="10" x2="10" y1="11" y2="17" />
                                    <line x1="14" x2="14" y1="11" y2="17" />
                                  </svg>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-slate-200 border border-solid flex-wrap max-w-full gap-2">
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 
                     disabled:bg-gray-300 disabled:cursor-not-allowed shadow"
                  >
                    Anterior
                  </button>

                  <span className="text-gray-700 font-medium">
                    Página {page} de {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 
                     disabled:bg-gray-300 disabled:cursor-not-allowed shadow"
                  >
                    Próxima
                  </button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <aside className="flex w-[min-content] max-sm:w-full max-md:w-2/3 max-lg:order-first">
            <Card className="w-full md:w-2/6 md:min-w-96">
              <CardContent className="p-6 md:p-8">
                <form className="w-full" onSubmit={handleSearch}>
                  <div className="flex flex-col gap-4 max-lg:w-full">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <Label htmlFor="nome" className="text-jelly-bean-900">
                          Nome
                        </Label>
                        <Input
                          id="nome"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="email" className="text-jelly-bean-900">
                          E-mail
                        </Label>
                        <Input
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="celular" className="text-jelly-bean-900">
                          Celular
                        </Label>
                        <Input
                          id="celular"
                          value={celular}
                          onChange={(e) => setCelular(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label
                          htmlFor="cpfCnpj"
                          className="text-jelly-bean-900"
                        >
                          CPF/CNPJ
                        </Label>
                        <Input
                          id="cpfCnpj"
                          value={cpfCnpj}
                          onChange={(e) => setCpfCnpj(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="estado" className="text-jelly-bean-900">
                          Estado
                        </Label>
                        <Input
                          id="estado"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="origemLead" className="text-jelly-bean-900">
                          Origem do Lead
                        </Label>
                        <Select value={origemLead} onValueChange={setOrigemLead}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORIGEM_LEAD_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-jelly-bean-900">
                        Aplicar Filtros
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNome("");
                          setEmail("");
                          setCelular("");
                          setCpfCnpj("");
                          setEstado("");
                          setOrigemLead("");
                          setSearchTerm("");
                          setPage(1);
                          fetchData();
                        }}
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Diálogo de Adicionar */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Contato</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo contato.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label htmlFor="add-nome">Nome *</Label>
                <Input
                  id="add-nome"
                  value={newContact.nome || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      nome: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="add-email">E-mail</Label>
                <Input
                  id="add-email"
                  value={newContact.email || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="add-celular">Celular</Label>
                <Input
                  id="add-celular"
                  value={newContact.celular || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      celular: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="add-cpf">CPF/CNPJ</Label>
                <Input
                  id="add-cpf"
                  value={newContact.cpf_cnpj || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      cpf_cnpj: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="add-cep">CEP</Label>
                <Input
                  id="add-cep"
                  value={newContact.cep || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      cep: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="add-estado">Estado</Label>
                <Input
                  id="add-estado"
                  value={newContact.estado || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      estado: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="add-cidade">Cidade</Label>
                <Input
                  id="add-cidade"
                  value={newContact.cidade || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      cidade: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="add-origem">Origem do Lead</Label>
                <Select
                  value={newContact.origem_lead || ""}
                  onValueChange={(value) =>
                    setNewContact({
                      ...newContact,
                      origem_lead: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGEM_LEAD_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-veiculo"
                    checked={newContact.veiculo_trabalho || false}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        veiculo_trabalho: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="add-veiculo">Veículo de Trabalho</Label>
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-cotacao"
                    checked={newContact.enviar_cotacao_email || false}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        enviar_cotacao_email: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="add-cotacao">Enviar Cotação por E-mail</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveNew}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias nos dados do contato.
            </DialogDescription>
          </DialogHeader>
          {editingContact && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="edit-nome">Nome</Label>
                  <Input
                    id="edit-nome"
                    value={editingContact.nome || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        nome: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input
                    id="edit-email"
                    value={editingContact.email || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-celular">Celular</Label>
                  <Input
                    id="edit-celular"
                    value={editingContact.celular || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        celular: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-cpf">CPF/CNPJ</Label>
                  <Input
                    id="edit-cpf"
                    value={editingContact.cpf_cnpj || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        cpf_cnpj: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-cep">CEP</Label>
                  <Input
                    id="edit-cep"
                    value={editingContact.cep || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        cep: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-estado">Estado</Label>
                  <Input
                    id="edit-estado"
                    value={editingContact.estado || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        estado: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-cidade">Cidade</Label>
                  <Input
                    id="edit-cidade"
                    value={editingContact.cidade || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        cidade: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-origem">Origem do Lead</Label>
                  <Select
                    value={editingContact.origem_lead || ""}
                    onValueChange={(value) =>
                      setEditingContact({
                        ...editingContact,
                        origem_lead: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGEM_LEAD_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-veiculo"
                      checked={editingContact.veiculo_trabalho || false}
                      onChange={(e) =>
                        setEditingContact({
                          ...editingContact,
                          veiculo_trabalho: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="edit-veiculo">Veículo de Trabalho</Label>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-cotacao"
                      checked={editingContact.enviar_cotacao_email || false}
                      onChange={(e) =>
                        setEditingContact({
                          ...editingContact,
                          enviar_cotacao_email: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="edit-cotacao">Enviar Cotação por E-mail</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] ">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este contato? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() => contactToDelete && handleDelete(contactToDelete)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}