import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Filter, X } from "lucide-react";
import { FilterData } from "./types";

interface FilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterData: FilterData;
  onFilterChange: <K extends keyof FilterData>(field: K, value: FilterData[K]) => void;
  onSubmit: () => void;
  onClear: () => void;
  activeFilters: number;
}

export default function FilterModal({
  isOpen,
  onOpenChange,
  filterData,
  onFilterChange,
  onSubmit,
  onClear,
  activeFilters,
}: FilterModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filtrar</span>
          <Badge variant="gray" className="ml-2">
            {activeFilters}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center justify-between text-2xl font-bold">
            <span>Filtros</span>
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

        <div className="space-y-8">
          {/* Filtros de Data */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b-2 border-blue-200 pb-3 text-blue-800">
              📅 Filtros de Data
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <Label htmlFor="tipoData" className="text-base font-medium mb-3 block">
                  Tipo de data
                </Label>
                <Select
                  value={filterData.tipoData}
                  onValueChange={(value) => onFilterChange("tipoData", value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Data de criação</SelectItem>
                    <SelectItem value="13">Data de atualização</SelectItem>
                    <SelectItem value="10">Data de pagamento</SelectItem>
                    <SelectItem value="11">Data de cadastro SGA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dataInicial" className="text-base font-medium mb-3 block">
                  Data inicial
                </Label>
                <Input
                  id="dataInicial"
                  type="date"
                  value={filterData.dataInicial}
                  onChange={(e) => onFilterChange("dataInicial", e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="dataFinal" className="text-base font-medium mb-3 block">
                  Data final
                </Label>
                <Input
                  id="dataFinal"
                  type="date"
                  value={filterData.dataFinal}
                  onChange={(e) => onFilterChange("dataFinal", e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          {/* Filtros de Seleção Múltipla */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b-2 border-green-200 pb-3 text-green-800">
              🎯 Filtros de Seleção
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="cooperativas" className="text-base font-medium mb-3 block">
                  Cooperativas
                </Label>
                <Select
                  value={filterData.cooperativas[0] || ""}
                  onValueChange={(value) => onFilterChange("cooperativas", [value])}
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
                <Label htmlFor="usuarios" className="text-base font-medium mb-3 block">
                  Usuários
                </Label>
                <Select
                  value={filterData.usuarios[0] || ""}
                  onValueChange={(value) => onFilterChange("usuarios", [value])}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="102447">Suporte PowerCRM</SelectItem>
                    <SelectItem value="104079">Daniel</SelectItem>
                    <SelectItem value="123998">Marcel Araújo</SelectItem>
                    <SelectItem value="124886">Allan Fernandes de Almeida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="origem" className="text-base font-medium mb-3 block">
                  Origem
                </Label>
                <Select
                  value={filterData.origem[0] || ""}
                  onValueChange={(value) => onFilterChange("origem", [value])}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14584">Facebook</SelectItem>
                    <SelectItem value="14585">Google</SelectItem>
                    <SelectItem value="14586">Indicação</SelectItem>
                    <SelectItem value="14587">Instagram</SelectItem>
                    <SelectItem value="18180">Marcel</SelectItem>
                    <SelectItem value="14840">Presencial</SelectItem>
                    <SelectItem value="14588">Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subOrigem" className="text-base font-medium mb-3 block">
                  Sub origem
                </Label>
                <Select
                  value={filterData.subOrigem[0] || "none"}
                  onValueChange={(value) =>
                    onFilterChange("subOrigem", value === "none" ? [] : [value])
                  }
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="xl:col-span-2">
                <Label htmlFor="tagsAutomaticas" className="text-base font-medium mb-3 block">
                  Tags automáticas
                </Label>
                <Select
                  value={filterData.tagsAutomaticas}
                  onValueChange={(value) => onFilterChange("tagsAutomaticas", value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Selecione</SelectItem>
                    <SelectItem value="5">Mostrar cotações do website</SelectItem>
                    <SelectItem value="6">Mostrar cotações de hotlink</SelectItem>
                    <SelectItem value="7">Mostrar cotações da pipeline</SelectItem>
                    <SelectItem value="8">Mostrar cotações de listas importadas</SelectItem>
                    <SelectItem value="9">Mostrar cotações de afiliados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filtros de Checkbox */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b-2 border-purple-200 pb-3 text-purple-800">
              ⚙️ Filtros Específicos
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="cartoesArquivados"
                  checked={filterData.cartoesArquivados}
                  onChange={(e) =>
                    onFilterChange("cartoesArquivados", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="cartoesArquivados" className="text-base cursor-pointer">
                  Mostrar apenas cartões arquivados
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="cotaçõesPagas"
                  checked={filterData.cotaçõesPagas}
                  onChange={(e) =>
                    onFilterChange("cotaçõesPagas", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="cotaçõesPagas" className="text-base cursor-pointer">
                  Mostrar apenas cotações pagas
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="boletosNaoPagos"
                  checked={filterData.boletosNaoPagos}
                  onChange={(e) =>
                    onFilterChange("boletosNaoPagos", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="boletosNaoPagos" className="text-base cursor-pointer">
                  Mostrar boletos gerados e não pagos
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="instalacaoRastreador"
                  checked={filterData.instalacaoRastreador}
                  onChange={(e) =>
                    onFilterChange("instalacaoRastreador", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="instalacaoRastreador" className="text-base cursor-pointer">
                  Instalação de Rastreador
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="cartoesExpirados"
                  checked={filterData.cartoesExpirados}
                  onChange={(e) =>
                    onFilterChange("cartoesExpirados", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="cartoesExpirados" className="text-base cursor-pointer">
                  Mostrar apenas cartões expirados
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="cartoesAceitos"
                  checked={filterData.cartoesAceitos}
                  onChange={(e) =>
                    onFilterChange("cartoesAceitos", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="cartoesAceitos" className="text-base cursor-pointer">
                  Mostrar apenas cartões aceitos
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="cartoesNaoAtendidos"
                  checked={filterData.cartoesNaoAtendidos}
                  onChange={(e) =>
                    onFilterChange("cartoesNaoAtendidos", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="cartoesNaoAtendidos" className="text-base cursor-pointer">
                  Mostrar apenas cartões não atendidos
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="ordenarAntigas"
                  checked={filterData.ordenarAntigas}
                  onChange={(e) =>
                    onFilterChange("ordenarAntigas", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="ordenarAntigas" className="text-base cursor-pointer">
                  Ordenar cartões pelas mais antigas
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200 mt-8">
          <Button
            variant="outline"
            onClick={onClear}
            className="h-12 px-8 text-base font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-700"
          >
            🗑️ Limpar Filtros
          </Button>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 px-8 text-base font-medium"
            >
              ❌ Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              className="h-12 px-8 text-base font-medium bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Filter className="w-5 h-5 mr-3" />
              ✅ Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
