"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ContactRow } from "./components/types";
import { ContactTable } from "./components/ContactTable";
import { ContactFilters } from "./components/ContactFilters";
import { ContactForm } from "./components/ContactForm";
import { Pagination } from "./components/Pagination";
import { useUser } from "@/context/UserContext";

export default function ContatosPage() {
  const supabase = createClient();

  // Estados para filtros
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [estado, setEstado] = useState("");
  const [origemLead, setOrigemLead] = useState("");
  // Estados para dados e paginação
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 5;

  // Estados para edição
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const { user } = useUser();

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
    enviar_cotacao_email: false,
  });
  const [afiliadoId, setAfiliadoId] = useState<string>("");

  useEffect(() => {
    const fetchAfiliadoId = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("afiliados")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar afiliado:", error);
          return;
        }

        if (data) {
          setAfiliadoId(data.id);
        }
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    fetchAfiliadoId();
  }, [user, supabase]);

  // Construir query de filtro
  const buildQuery = () => {
    let query = supabase.from("contatos").select("*", { count: "exact" });

    if (nome) query = query.ilike("nome", `%${nome}%`);
    if (email) query = query.ilike("email", `%${email}%`);
    if (celular) query = query.ilike("celular", `%${celular}%`);
    if (cpfCnpj) query = query.ilike("cpf_cnpj", `%${cpfCnpj}%`);
    if (estado) query = query.ilike("estado", `%${estado}%`);
    if (origemLead) query = query.eq("origem_lead", origemLead);

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

  // Buscar dados quando a página mudar
  useEffect(() => {
    fetchData();
  }, [page]);

  // Handler para o formulário de busca
  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  // Handler para limpar filtros
  const handleClearFilters = () => {
    setNome("");
    setEmail("");
    setCelular("");
    setCpfCnpj("");
    setEstado("");
    setOrigemLead("");
    setPage(1);
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
      enviar_cotacao_email: false,
      afiliado_id: afiliadoId, // Usar o ID do afiliado, não do usuário auth
    });
    setIsAddDialogOpen(true);
  };

  // Handler para salvar novo contato
  const handleSaveNew = async () => {
    try {
      // Garantir que o afiliado_id está definido
      const contactToSave = {
        ...newContact,
        afiliado_id: newContact.afiliado_id || afiliadoId,
      };

      const { error } = await supabase.from("contatos").insert([contactToSave]);

      if (error) {
        console.error("Erro detalhado:", error);
        throw error;
      }

      toast.success("Contato adicionado com sucesso");
      setIsAddDialogOpen(false);
      fetchData();
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
        .update(editingContact)
        .eq("id", editingContact.id);

      if (error) throw error;

      toast.success("Contato atualizado com sucesso");
      setIsEditDialogOpen(false);
      setEditingContact(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      toast.error("Erro ao atualizar contato");
    }
  };

  // Handler para deletar contato
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("contatos").delete().eq("id", id);
      if (error) throw error;

      toast.success("Contato deletado com sucesso");
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
      fetchData();
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

      if (error) throw error;

      toast.success(
        `${selectedContacts.length} contatos deletados com sucesso`,
      );
      setSelectedContacts([]);
      fetchData();
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
                    {rows.length} contatos encontrados
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
                <ContactTable
                  rows={rows}
                  loading={loading}
                  selectedContacts={selectedContacts}
                  onToggleContactSelection={toggleContactSelection}
                  onToggleSelectAll={toggleSelectAll}
                  onEdit={handleEdit}
                  onDelete={(id) => {
                    setContactToDelete(id);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              </CardContent>
              <CardFooter className="flex justify-end border-slate-200 border border-solid flex-wrap max-w-full gap-2">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPrevious={() => setPage((p) => Math.max(p - 1, 1))}
                  onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                />
              </CardFooter>
            </Card>
          </div>

          <aside className="flex w-[min-content] max-sm:w-full max-md:w-2/3 max-lg:order-first">
            <ContactFilters
              nome={nome}
              email={email}
              celular={celular}
              cpfCnpj={cpfCnpj}
              estado={estado}
              origemLead={origemLead}
              onNomeChange={setNome}
              onEmailChange={setEmail}
              onCelularChange={setCelular}
              onCpfCnpjChange={setCpfCnpj}
              onEstadoChange={setEstado}
              onOrigemLeadChange={setOrigemLead}
              onSearch={handleSearch}
              onClear={handleClearFilters}
            />
          </aside>
        </div>
      </div>

      {/* Diálogo de Adicionar */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <ContactForm
          title="Adicionar Novo Contato"
          description="Preencha os dados do novo contato."
          contact={newContact}
          onContactChange={(field, value) =>
            setNewContact((prev) => ({ ...prev, [field]: value }))
          }
          onSave={handleSaveNew}
          onCancel={() => setIsAddDialogOpen(false)}
        />
      </Dialog>

      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <ContactForm
          title="Editar Contato"
          description="Faça as alterações necessárias nos dados do contato."
          contact={editingContact || {}}
          onContactChange={(field, value) =>
            setEditingContact((prev) =>
              prev ? { ...prev, [field]: value } : null,
            )
          }
          onSave={handleSaveEdit}
          onCancel={() => setIsEditDialogOpen(false)}
        />
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
