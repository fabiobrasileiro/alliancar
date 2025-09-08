import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ContactFilters as ContactFiltersType } from "./types";

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onFilterChange: (field: keyof ContactFiltersType, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function ContactFilters({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: ContactFiltersProps) {
  return (
    <Card className="p-4 mb-6">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="nomeCompleto" className="text-sm font-medium">
              Nome Completo
            </Label>
            <Input
              id="nomeCompleto"
              placeholder="Buscar por nome"
              value={filters.nomeCompleto}
              onChange={(e) => onFilterChange("nomeCompleto", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="telefone" className="text-sm font-medium">
              Telefone
            </Label>
            <Input
              id="telefone"
              placeholder="Buscar por telefone"
              value={filters.telefone}
              onChange={(e) => onFilterChange("telefone", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="cpfCnpj" className="text-sm font-medium">
              CPF/CNPJ
            </Label>
            <Input
              id="cpfCnpj"
              placeholder="Buscar por CPF/CNPJ"
              value={filters.cpfCnpj}
              onChange={(e) => onFilterChange("cpfCnpj", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="banco" className="text-sm font-medium">
              Banco
            </Label>
            <Input
              id="banco"
              placeholder="Buscar por banco"
              value={filters.banco}
              onChange={(e) => onFilterChange("banco", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="estado" className="text-sm font-medium">
              Estado
            </Label>
            <Input
              id="estado"
              placeholder="Buscar por estado"
              value={filters.estado}
              onChange={(e) => onFilterChange("estado", e.target.value)}
            />
          </div>
          
          <div className="flex flex-col justify-end space-y-2">
            <Button onClick={onApplyFilters} className="w-full">
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={onClearFilters} className="w-full">
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
