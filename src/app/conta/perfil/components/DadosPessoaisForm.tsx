import React from "react";
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
import { FormData } from "./types";

interface DadosPessoaisFormProps {
  formData: FormData;
  loading: boolean;
  saving: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: string, value: string) => void;
  onSave: () => void;
}

export const DadosPessoaisForm: React.FC<DadosPessoaisFormProps> = ({
  formData,
  loading,
  saving,
  onInputChange,
  onSelectChange,
  onSave,
}) => {
  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return (
    <>
      <div className="mb-4">
        <p className="text-gray-600">
          Aqui você pode configurar suas informações pessoais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="name">Apelido</Label>
          <Input
            id="name"
            type="text"
            maxLength={256}
            value={formData.name}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nome Completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            maxLength={256}
            value={formData.fullName}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration">CPF/CNPJ</Label>
          <Input
            id="registration"
            type="text"
            maxLength={18}
            value={formData.registration}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">
            WhatsApp com DDD<span className="text-red-500">*</span>
          </Label>
          <Input
            id="mobile"
            type="text"
            maxLength={32}
            value={formData.mobile}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            E-mail <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            maxLength={128}
            value={formData.email}
            onChange={onInputChange}
            disabled
          />
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      <div className="mb-4">
        <h4 className="text-lg font-semibold">Endereço</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="zipcode">CEP</Label>
          <Input
            id="zipcode"
            type="text"
            maxLength={10}
            value={formData.zipcode}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            type="text"
            maxLength={512}
            value={formData.address}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressNumber">Número</Label>
          <Input
            id="addressNumber"
            type="text"
            maxLength={32}
            value={formData.addressNumber}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressComplement">Complemento</Label>
          <Input
            id="addressComplement"
            type="text"
            maxLength={64}
            value={formData.addressComplement}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressState">Estado</Label>
          <Select
            value={formData.addressState}
            onValueChange={(value) => onSelectChange("addressState", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressCity">Cidade</Label>
          <Input
            id="addressCity"
            type="text"
            value={formData.addressCity}
            onChange={onInputChange}
          />
        </div>
      </div>

      <Button onClick={onSave} className="mt-4" disabled={loading || saving}>
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </>
  );
};
