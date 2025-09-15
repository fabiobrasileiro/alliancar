import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Banco, NovoBanco } from "./types";

interface ModalContaBancariaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banco: NovoBanco) => void;
  editingBanco?: Banco | null;
}

export const ModalContaBancaria: React.FC<ModalContaBancariaProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBanco,
}) => {
  const [formData, setFormData] = useState<NovoBanco>({
    banco: editingBanco?.banco || "",
    agencia: editingBanco?.agencia || "",
    digito_agencia: editingBanco?.digito_agencia || "",
    conta: editingBanco?.conta || "",
    digito_conta: editingBanco?.digito_conta || "",
    chave_pix: editingBanco?.pix || "",
    principal: editingBanco?.principal || false,
    titular: editingBanco?.titular || "",
  });

  const bancosBrasileiros = [
    "Banco do Brasil",
    "Caixa Econômica Federal",
    "Itaú Unibanco",
    "Bradesco",
    "Santander",
    "Banco Inter",
    "Nubank",
    "Sicredi",
    "Sicoob",
    "Banrisul",
    "Outro",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof NovoBanco, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    // Converter para boolean (tratando "indeterminate" como false)
    const isChecked = checked === true;
    setFormData((prev) => ({ ...prev, principal: isChecked }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingBanco ? "Editar Conta Bancária" : "Nova Conta Bancária"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da conta bancária para recebimento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banco">Banco *</Label>
              <select
                id="banco"
                value={formData.banco}
                onChange={(e) => handleInputChange("banco", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Selecione o banco</option>
                {bancosBrasileiros.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencia">Agência *</Label>
              <Input
                id="agencia"
                value={formData.agencia}
                onChange={(e) => handleInputChange("agencia", e.target.value)}
                placeholder="0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="digito_agencia">Dígito Agência</Label>
              <Input
                id="digito_agencia"
                value={formData.digito_agencia}
                onChange={(e) =>
                  handleInputChange("digito_agencia", e.target.value)
                }
                placeholder="0"
                maxLength={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta">Conta *</Label>
              <Input
                id="conta"
                value={formData.conta}
                onChange={(e) => handleInputChange("conta", e.target.value)}
                placeholder="00000-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="digito_conta">Dígito Conta *</Label>
              <Input
                id="digito_conta"
                value={formData.digito_conta}
                onChange={(e) =>
                  handleInputChange("digito_conta", e.target.value)
                }
                placeholder="0"
                maxLength={1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix">Chave PIX</Label>
              <Input
                id="pix"
                value={formData.chave_pix}
                onChange={(e) => handleInputChange("chave_pix", e.target.value)}
                placeholder="Chave PIX (opcional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pix">Titular</Label>
              <Input
                id="titular"
                value={formData.titular}
                onChange={(e) => handleInputChange("titular", e.target.value)}
                placeholder="Titular"
              />
            </div>
          </div>

          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="principal"
              checked={formData.principal}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="principal">Definir como conta principal</Label>
          </div> */}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingBanco ? "Salvar Alterações" : "Adicionar Conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
