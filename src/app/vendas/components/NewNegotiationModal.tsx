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
  onFormChange: (field: keyof NewNegotiationForm, value: string | boolean) => void;
  onSubmit: () => void;
}

export default function NewNegotiationModal({
  isOpen,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
}: NewNegotiationModalProps) {
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-8"
        >
          {/* Dados do Veículo */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b-2 border-blue-200 pb-3 text-blue-800">
              🚗 Dados do Veículo
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="cooperativa" className="text-base font-medium mb-3 block">
                  Cooperativa *
                </Label>
                <Select
                  value={formData.cooperativa}
                  onValueChange={(value) => onFormChange("cooperativa", value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11375">ALLIANCAR CLUB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipoVeiculo" className="text-base font-medium mb-3 block">
                  Tipo de veículo *
                </Label>
                <Select
                  value={formData.tipoVeiculo}
                  onValueChange={(value) => onFormChange("tipoVeiculo", value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Carro/utilitário pequeno</SelectItem>
                    <SelectItem value="1">Moto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="placa" className="text-base font-medium mb-3 block">
                  Placa *
                </Label>
                <Input
                  id="placa"
                  type="text"
                  value={formData.placa}
                  onChange={(e) => onFormChange("placa", e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  className="h-12 text-base font-mono"
                  maxLength={8}
                />
              </div>

              <div>
                <Label htmlFor="marca" className="text-base font-medium mb-3 block">
                  Marca *
                </Label>
                <Select
                  value={formData.marca}
                  onValueChange={(value) => onFormChange("marca", value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiat">Fiat</SelectItem>
                    <SelectItem value="chevrolet">Chevrolet</SelectItem>
                    <SelectItem value="volkswagen">Volkswagen</SelectItem>
                    <SelectItem value="ford">Ford</SelectItem>
                    <SelectItem value="honda">Honda</SelectItem>
                    <SelectItem value="toyota">Toyota</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="anoModelo" className="text-base font-medium mb-3 block">
                  Ano modelo *
                </Label>
                <Select
                  value={formData.anoModelo}
                  onValueChange={(value) => onFormChange("anoModelo", value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 26 }, (_, i) => 2025 - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="modelo" className="text-base font-medium mb-3 block">
                  Modelo *
                </Label>
                <Select
                  value={formData.modelo}
                  onValueChange={(value) => onFormChange("modelo", value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="palio">Palio</SelectItem>
                    <SelectItem value="gol">Gol</SelectItem>
                    <SelectItem value="onix">Onix</SelectItem>
                    <SelectItem value="ka">Ka</SelectItem>
                    <SelectItem value="civic">Civic</SelectItem>
                    <SelectItem value="corolla">Corolla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
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
                    <SelectItem value="14584">Facebook</SelectItem>
                    <SelectItem value="14585">Google</SelectItem>
                    <SelectItem value="14586">Indicação</SelectItem>
                    <SelectItem value="14587">Instagram</SelectItem>
                    <SelectItem value="14840">Presencial</SelectItem>
                    <SelectItem value="14588">Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Opções Adicionais */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b-2 border-purple-200 pb-3 text-purple-800">
              ⚙️ Opções Adicionais
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="veiculoTrabalho"
                  checked={formData.veiculoTrabalho}
                  onChange={(e) =>
                    onFormChange("veiculoTrabalho", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="veiculoTrabalho" className="text-base cursor-pointer">
                  Veículo de trabalho (Táxi/Uber)?
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="enviarCotacao"
                  checked={formData.enviarCotacao}
                  onChange={(e) =>
                    onFormChange("enviarCotacao", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="enviarCotacao" className="text-base cursor-pointer">
                  Enviar cotação por e-mail
                </Label>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-8 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 px-8 text-base font-medium"
            >
              ❌ Cancelar
            </Button>
            <Button
              type="submit"
              className="h-12 px-8 text-base font-medium bg-green-600 hover:bg-green-700 shadow-lg"
            >
              ✅ Criar Negociação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
