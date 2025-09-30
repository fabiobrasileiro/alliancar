// app/negociacoes/components/NewNegotiationModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { NewNegotiationForm } from "./types";

interface NewNegotiationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NewNegotiationForm;
  onFormChange: (field: keyof NewNegotiationForm, value: string | boolean | number) => void;
  onSubmit: (formData: NewNegotiationForm) => Promise<void>;
  loading?: boolean;
}

export default function NewNegotiationModal({
  isOpen,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  loading = false,
}: NewNegotiationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.placa || !formData.marca || !formData.modelo || !formData.ano_modelo || !formData.nomeContato) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // O erro já é tratado no componente pai
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Negociação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between text-xl font-bold">
            <span>Nova Negociação</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Veículo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Dados do Veículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="placa" className="text-sm font-medium">
                  Placa *
                </Label>
                <Input
                  id="placa"
                  type="text"
                  value={formData.placa}
                  onChange={(e) => onFormChange("placa", e.target.value.toUpperCase())}
                  placeholder="ABC1D23"
                  className="h-10"
                  maxLength={7}
                  required
                />
              </div>

              <div>
                <Label htmlFor="marca" className="text-sm font-medium">
                  Marca *
                </Label>
                <Input
                  id="marca"
                  type="text"
                  value={formData.marca}
                  onChange={(e) => onFormChange("marca", e.target.value)}
                  placeholder="Volkswagen, Fiat, Chevrolet"
                  className="h-10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="modelo" className="text-sm font-medium">
                  Modelo *
                </Label>
                <Input
                  id="modelo"
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => onFormChange("modelo", e.target.value)}
                  placeholder="Gol, Palio, Onix"
                  className="h-10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ano_modelo" className="text-sm font-medium">
                  Ano Modelo *
                </Label>
                <Input
                  id="ano_modelo"
                  type="text"
                  value={formData.ano_modelo}
                  onChange={(e) => onFormChange("ano_modelo", e.target.value)}
                  placeholder="2024"
                  className="h-10"
                  maxLength={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="valor_negociado" className="text-sm font-medium">
                  Valor Negociado (R$)
                </Label>
                <Input
                  id="valor_negociado"
                  type="number"
                  step="0.01"
                  value={formData.valor_negociado || ""}
                  onChange={(e) => onFormChange("valor_negociado", parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeContato" className="text-sm font-medium">
                  Nome para contato *
                </Label>
                <Input
                  id="nomeContato"
                  type="text"
                  value={formData.nomeContato}
                  onChange={(e) => onFormChange("nomeContato", e.target.value)}
                  placeholder="Nome completo"
                  className="h-10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="h-10"
                />
              </div>

              <div>
                <Label htmlFor="celular" className="text-sm font-medium">
                  Celular
                </Label>
                <Input
                  id="celular"
                  type="tel"
                  value={formData.celular}
                  onChange={(e) => onFormChange("celular", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-10"
                />
              </div>

              <div>
                <Label htmlFor="estado" className="text-sm font-medium">
                  Estado
                </Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => onFormChange("estado", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sp">São Paulo</SelectItem>
                    <SelectItem value="rj">Rio de Janeiro</SelectItem>
                    <SelectItem value="mg">Minas Gerais</SelectItem>
                    <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                    <SelectItem value="pr">Paraná</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cidade" className="text-sm font-medium">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => onFormChange("cidade", e.target.value)}
                  placeholder="Nome da cidade"
                  className="h-10"
                />
              </div>

              <div>
                <Label htmlFor="origemLead" className="text-sm font-medium">
                  Origem do lead
                </Label>
                <Select
                  value={formData.origemLead}
                  onValueChange={(value) => onFormChange("origemLead", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Site">Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Criando..." : "Criar Negociação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}