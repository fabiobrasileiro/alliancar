import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TypeFilters, PriorityFilters } from "./types";

interface FiltrosAtividadesProps {
  searchTerm: string;
  typeFilters: TypeFilters;
  priorityFilters: PriorityFilters;
  onSearchChange: (term: string) => void;
  onTypeFilterChange: (type: keyof TypeFilters) => void;
  onPriorityFilterChange: (priority: keyof PriorityFilters) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const FiltrosAtividades: React.FC<FiltrosAtividadesProps> = ({
  searchTerm,
  typeFilters,
  priorityFilters,
  onSearchChange,
  onTypeFilterChange,
  onPriorityFilterChange,
  onClearFilters,
  activeFiltersCount,
}) => {
  return (
    <Card className="p-4 w-full md:w-2/5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Filtros</h3>
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Limpar Filtros
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <Label htmlFor="search" className="mb-2">
            Buscar
          </Label>
          <Input
            id="search"
            placeholder="Buscar atividades..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <Label className="mb-2">Tipo</Label>
          <div className="space-y-2">
            {Object.keys(typeFilters).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={typeFilters[type as keyof TypeFilters]}
                  onChange={() => onTypeFilterChange(type as keyof TypeFilters)}
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm font-medium leading-none capitalize"
                >
                  {type.replace('_', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <Label className="mb-2">Prioridade</Label>
          <div className="space-y-2">
            {Object.keys(priorityFilters).map((priority) => (
              <div key={priority} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={priorityFilters[priority as keyof PriorityFilters]}
                  onChange={() => onPriorityFilterChange(priority as keyof PriorityFilters)}
                />
                <label
                  htmlFor={`priority-${priority}`}
                  className="text-sm font-medium leading-none capitalize"
                >
                  {priority}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};