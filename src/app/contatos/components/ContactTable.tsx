import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ContactRow } from "./types";

interface ContactTableProps {
  rows: ContactRow[];
  loading: boolean;
  selectedContacts: string[];
  onToggleContactSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (contact: ContactRow) => void;
  onDelete: (id: string) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  rows,
  loading,
  selectedContacts,
  onToggleContactSelection,
  onToggleSelectAll,
  onEdit,
  onDelete,
}) => {
  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  return (
    <div className="max-md:overflow-auto max-md:max-w-full">
      <Table className="flex-nowrap bg-jelly-bean-950 text-white">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-8 w-10">
              <Checkbox
                aria-label="Selecionar todos"
                checked={
                  selectedContacts.length === rows.length && rows.length > 0
                }
                onChange={onToggleSelectAll}
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
            <TableHead className="w-16 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="flex-nowrap bg-jelly-bean-50 text-jelly-bean-950">
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
                    onChange={() => onToggleContactSelection(r.id)}
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
                <TableCell className="w-16 text-center">
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onEdit(r)}
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
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .830-.497z" />
                        <path d="M15 5l4 4" />
                      </svg>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onDelete(r.id)}
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
  );
};
