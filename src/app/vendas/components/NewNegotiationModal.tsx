import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar negociação:', error);
    }
  };
  console.log(formData)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Negociação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center justify-between text-2xl font-bold">
            <span>➕ Nova Negociação</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-10 w-10 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados do Veículo */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b-2 border-blue-200 pb-3 text-blue-800">
              🚗 Dados do Veículo
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="placa" className="text-base font-medium mb-3 block">
                  Placa *
                </Label>
                <Input
                  id="placa"
                  type="text"
                  value={formData.placa}
                  onChange={(e) => onFormChange("placa", e.target.value.toUpperCase())}
                  placeholder="ABC1D23"
                  className="h-12 text-base font-mono"
                  maxLength={7}
                  pattern="[A-Z]{3}[0-9][A-Z0-9][0-9]{2}"
                  required
                />
              </div>

              <div>
                <Label htmlFor="marca" className="text-base font-medium mb-3 block">
                  Marca *
                </Label>
                <Input
                  id="marca"
                  type="text"
                  value={formData.marca}
                  onChange={(e) => onFormChange("marca", e.target.value)}
                  placeholder="Ex: Volkswagen, Fiat, Chevrolet"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="modelo" className="text-base font-medium mb-3 block">
                  Modelo *
                </Label>
                <Input
                  id="modelo"
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => onFormChange("modelo", e.target.value)}
                  placeholder="Ex: Gol, Palio, Onix"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ano_modelo" className="text-base font-medium mb-3 block">
                  Ano Modelo *
                </Label>
                <Input
                  id="ano_modelo"
                  type="text"
                  value={formData.ano_modelo}
                  onChange={(e) => onFormChange("ano_modelo", e.target.value)}
                  placeholder="2024"
                  className="h-12 text-base"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  required
                />
              </div>

              <div>
                <Label htmlFor="valor_negociado" className="text-base font-medium mb-3 block">
                  Valor Negociado (R$)
                </Label>
                <Input
                  id="valor_negociado"
                  type="number"
                  step="0.01"
                  value={formData.valor_negociado || ''}
                  onChange={(e) => onFormChange("valor_negociado", parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b-2 border-green-200 pb-3 text-green-800">
              👤 Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="nomeContato" className="text-base font-medium mb-3 block">
                  Nome para contato *
                </Label>
                <Input
                  id="nomeContato"
                  type="text"
                  value={formData.nomeContato}
                  onChange={(e) => onFormChange("nomeContato", e.target.value)}
                  placeholder="Nome completo"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium mb-3 block">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="celular" className="text-base font-medium mb-3 block">
                  Celular
                </Label>
                <Input
                  id="celular"
                  type="tel"
                  value={formData.celular}
                  onChange={(e) => onFormChange("celular", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="estado" className="text-base font-medium mb-3 block">
                  Estado
                </Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => onFormChange("estado", value)}
                >
                  <SelectTrigger className="h-12 text-base">
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
                <Label htmlFor="cidade" className="text-base font-medium mb-3 block">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => onFormChange("cidade", e.target.value)}
                  placeholder="Nome da cidade"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="origemLead" className="text-base font-medium mb-3 block">
                  Origem do lead
                </Label>
                <Select
                  value={formData.origemLead}
                  onValueChange={(value) => onFormChange("origemLead", value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Selecione</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="14585">Google</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Site">Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-8 text-base font-medium bg-green-600 hover:bg-green-700 shadow-lg"
          >
            {loading ? 'Criando...' : '✅ Criar Negociação'}
          </Button>
        </form>
      </  DialogContent >
    </Dialog>
  );
}