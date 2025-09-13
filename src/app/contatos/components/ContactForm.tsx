import React from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ContactRow, ORIGEM_LEAD_OPTIONS } from "./types";

interface ContactFormProps {
  title: string;
  description: string;
  contact: Partial<ContactRow>;
  onContactChange: (field: keyof ContactRow, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  title,
  description,
  contact,
  onContactChange,
  onSave,
  onCancel,
}) => {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={contact.nome || ""}
              onChange={(e) => onContactChange("nome", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              value={contact.email || ""}
              onChange={(e) => onContactChange("email", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              value={contact.celular || ""}
              onChange={(e) => onContactChange("celular", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              value={contact.cpf_cnpj || ""}
              onChange={(e) => onContactChange("cpf_cnpj", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={contact.cep || ""}
              onChange={(e) => onContactChange("cep", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={contact.estado || ""}
              onChange={(e) => onContactChange("estado", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={contact.cidade || ""}
              onChange={(e) => onContactChange("cidade", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="origem_lead">Origem do Lead</Label>
            <Select
              value={contact.origem_lead || ""}
              onValueChange={(value) => onContactChange("origem_lead", value)}
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
                id="veiculo_trabalho"
                checked={contact.veiculo_trabalho || false}
                onChange={(e) => onContactChange("veiculo_trabalho", e.target)}
              />
              <Label htmlFor="veiculo_trabalho">Veículo de Trabalho</Label>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enviar_cotacao_email"
                checked={contact.enviar_cotacao_email || false}
                onChange={(e) => onContactChange("enviar_cotacao_email", e.target)}
              />
              <Label htmlFor="enviar_cotacao_email">Enviar Cotação por E-mail</Label>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSave}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
};