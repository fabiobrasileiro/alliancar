import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { ORIGEM_LEAD_OPTIONS } from "./types";

interface ContactFiltersProps {
  nome: string;
  email: string;
  celular: string;
  cpfCnpj: string;
  estado: string;
  origemLead: string;
  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCelularChange: (value: string) => void;
  onCpfCnpjChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onOrigemLeadChange: (value: string) => void;
  onSearch: (e: React.FormEvent<HTMLFormElement>) => void; // Corrigido o tipo
  onClear: () => void;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  nome,
  email,
  celular,
  cpfCnpj,
  estado,
  origemLead,
  onNomeChange,
  onEmailChange,
  onCelularChange,
  onCpfCnpjChange,
  onEstadoChange,
  onOrigemLeadChange,
  onSearch,
  onClear,
}) => {
  return (
    <Card className="w-full md:min-w-96">
      <CardContent className="p-6 md:p-8">
        <form className="w-full" onSubmit={onSearch}>
          <div className="flex flex-col gap-4 max-lg:w-full">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <Label htmlFor="nome" className="text-jelly-bean-900">
                  Nome
                </Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => onNomeChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="email" className="text-jelly-bean-900">
                  E-mail
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="celular" className="text-jelly-bean-900">
                  Celular
                </Label>
                <Input
                  id="celular"
                  value={celular}
                  onChange={(e) => onCelularChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="cpfCnpj" className="text-jelly-bean-900">
                  CPF/CNPJ
                </Label>
                <Input
                  id="cpfCnpj"
                  value={cpfCnpj}
                  onChange={(e) => onCpfCnpjChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="estado" className="text-jelly-bean-900">
                  Estado
                </Label>
                <Input
                  id="estado"
                  value={estado}
                  onChange={(e) => onEstadoChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="origemLead" className="text-jelly-bean-900">
                  Origem do Lead
                </Label>
                <Select value={origemLead} onValueChange={onOrigemLeadChange}>
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
              <Button type="button" variant="outline" onClick={onClear}>
                Limpar
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};