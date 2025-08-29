"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ContactRow {
  id: string;
  contato?: string;
  nome_completo?: string;
  telefone?: string;
  cpf_cnpj?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  receita_estimada?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  status?: string;
  ativo?: boolean;
  link?: string;
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

// Helper para renderizar valores de forma segura
const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export default function ContatosPage() {
  const supabase = createClient();

  // Estados para filtros
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [banco, setBanco] = useState("");
  const [estado, setEstado] = useState("");
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

  // Construir query de filtro
  const buildQuery = () => {
    let query = supabase.from("profile").select("*", { count: "exact" });

    if (nomeCompleto) {
      query = query.ilike("nome_completo", `%${nomeCompleto}%`);
    }
    if (telefone) {
      query = query.ilike("telefone", `%${telefone}%`);
    }
    if (cpfCnpj) {
      query = query.ilike("cpf_cnpj", `%${cpfCnpj}%`);
    }
    if (banco) {
      query = query.ilike("banco", `%${banco}%`);
    }
    if (estado) {
      query = query.ilike("estado", `%${estado}%`);
    }
    if (searchTerm) {
      query = query.or(
        `nome_completo.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
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
        .order("criado_em", { ascending: false });

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
        .from("profile")
        .update({
          nome_completo: editingContact.nome_completo,
          telefone: editingContact.telefone,
          cpf_cnpj: editingContact.cpf_cnpj,
          banco: editingContact.banco,
          agencia: editingContact.agencia,
          conta: editingContact.conta,
          receita_estimada: editingContact.receita_estimada,
          cep: editingContact.cep,
          estado: editingContact.estado,
          cidade: editingContact.cidade,
          ativo: editingContact.ativo,
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
      const { error } = await supabase.from("profile").delete().eq("id", id);

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
        .from("profile")
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
                {selectedContacts.length > 0 && (
                  <Button variant="default" onClick={handleDeleteMultiple}>
                    Excluir Selecionados ({selectedContacts.length})
                  </Button>
                )}
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
                        <TableHead>Nome completo</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Cpf/Cnpj</TableHead>
                        <TableHead>Banco</TableHead>
                        <TableHead>Agência</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Receita estimada</TableHead>
                        <TableHead>Cep</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Ativo</TableHead>
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
                                aria-label={`Selecionar contato ${r.nome_completo || r.id}`}
                                checked={selectedContacts.includes(r.id)}
                                onChange={() => toggleContactSelection(r.id)}
                              />
                            </TableCell>
                            <TableCell>
                              {renderValue(r.nome_completo)}
                            </TableCell>
                            <TableCell>{renderValue(r.telefone)}</TableCell>
                            <TableCell>{renderValue(r.cpf_cnpj)}</TableCell>
                            <TableCell>{renderValue(r.banco)}</TableCell>
                            <TableCell>{renderValue(r.agencia)}</TableCell>
                            <TableCell>{renderValue(r.conta)}</TableCell>
                            <TableCell>
                              {renderValue(r.receita_estimada)}
                            </TableCell>
                            <TableCell>{renderValue(r.cep)}</TableCell>
                            <TableCell>{renderValue(r.estado)}</TableCell>
                            <TableCell>{r.ativo ? "Sim" : "Não"}</TableCell>
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
                          value={nomeCompleto}
                          onChange={(e) => setNomeCompleto(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label
                          htmlFor="telefone"
                          className="text-jelly-bean-900"
                        >
                          Telefone
                        </Label>
                        <Input
                          id="telefone"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
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
                        <Label htmlFor="banco" className="text-jelly-bean-900">
                          Banco
                        </Label>
                        <Input
                          id="banco"
                          value={banco}
                          onChange={(e) => setBanco(e.target.value)}
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
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-jelly-bean-900">
                        Aplicar Filtros
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNomeCompleto("");
                          setTelefone("");
                          setCpfCnpj("");
                          setBanco("");
                          setEstado("");
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
                  <Label htmlFor="edit-nome">Nome Completo</Label>
                  <Input
                    id="edit-nome"
                    value={editingContact.nome_completo || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        nome_completo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-telefone">Telefone</Label>
                  <Input
                    id="edit-telefone"
                    value={editingContact.telefone || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        telefone: e.target.value,
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
                  <Label htmlFor="edit-banco">Banco</Label>
                  <Input
                    id="edit-banco"
                    value={editingContact.banco || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        banco: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-agencia">Agência</Label>
                  <Input
                    id="edit-agencia"
                    value={editingContact.agencia || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        agencia: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-conta">Conta</Label>
                  <Input
                    id="edit-conta"
                    value={editingContact.conta || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        conta: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="edit-receita">Receita Estimada</Label>
                  <Input
                    id="edit-receita"
                    value={editingContact.receita_estimada || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        receita_estimada: e.target.value,
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
                <div className="flex flex-col justify-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-ativo"
                      checked={editingContact.ativo || false}
                      onChange={(e) =>
                        setEditingContact({
                          ...editingContact,
                          ativo: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="edit-ativo">Ativo</Label>
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
