import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ContactRow } from "./types";

interface ContactsTableProps {
  contacts: ContactRow[];
  loading: boolean;
  onEdit: (contact: ContactRow) => void;
  onDelete: (id: string) => void;
  selectedContacts: string[];
  onSelectContact: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function ContactsTable({
  contacts,
  loading,
  onEdit,
  onDelete,
  selectedContacts,
  onSelectContact,
  onSelectAll,
}: ContactsTableProps) {
  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>Carregando contatos...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead className="min-w-[200px]">Nome Completo</TableHead>
            <TableHead className="min-w-[150px]">Telefone</TableHead>
            <TableHead className="min-w-[150px]">CPF/CNPJ</TableHead>
            <TableHead className="min-w-[120px]">Banco</TableHead>
            <TableHead className="min-w-[100px]">Agência</TableHead>
            <TableHead className="min-w-[120px]">Conta</TableHead>
            <TableHead className="min-w-[150px]">Receita Estimada</TableHead>
            <TableHead className="min-w-[100px]">CEP</TableHead>
            <TableHead className="min-w-[120px]">Estado</TableHead>
            <TableHead className="min-w-[150px]">Cidade</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={(e) => onSelectContact(contact.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>{renderValue(contact.nome_completo)}</TableCell>
                <TableCell>{renderValue(contact.telefone)}</TableCell>
                <TableCell>{renderValue(contact.cpf_cnpj)}</TableCell>
                <TableCell>{renderValue(contact.banco)}</TableCell>
                <TableCell>{renderValue(contact.agencia)}</TableCell>
                <TableCell>{renderValue(contact.conta)}</TableCell>
                <TableCell>{renderValue(contact.receita_estimada)}</TableCell>
                <TableCell>{renderValue(contact.cep)}</TableCell>
                <TableCell>{renderValue(contact.estado)}</TableCell>
                <TableCell>{renderValue(contact.cidade)}</TableCell>
                <TableCell>{renderValue(contact.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(contact)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(contact.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                Nenhum contato encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
