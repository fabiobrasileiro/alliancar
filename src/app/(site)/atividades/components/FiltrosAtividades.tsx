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
  // agora os callbacks recebem também o novo estado (checked)
  onTypeFilterChange: (type: keyof TypeFilters, checked: boolean) => void;
  onPriorityFilterChange: (priority: keyof PriorityFilters, checked: boolean) => void;
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
    <Card className="p-4 w-full md:w-2/5 bg-bg">
      <div className="flex justify-between items-center mb-4 text-white">
        <h3 className="font-semibold">Filtros</h3>
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Limpar Filtros
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <Label htmlFor="search" className="mb-2 text-white">
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
          <Label className="mb-2 text-white">Tipo</Label>
          <div className="space-y-2">
            {Object.keys(typeFilters).map((type) => {
              const key = type as keyof TypeFilters;
              return (
                <div key={type} className="flex items-center space-x-2 text-white">
                  <Checkbox
                    id={`type-${type}`}
                    checked={typeFilters[key]}
                    // uso do onCheckedChange (shadcn-style)
                    onCheckedChange={(val) =>
                      // val pode ser boolean | "indeterminate"
                      onTypeFilterChange(key, Boolean(val))
                    }
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="text-sm font-medium leading-none capitalize "
                  >
                    {type.replace("_", " ")}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col text-white">
          <Label className="mb-2 text-white">Prioridade</Label>
          <div className="space-y-2 text-white">
            {Object.keys(priorityFilters).map((priority) => {
              const key = priority as keyof PriorityFilters;
              return (
                <div key={priority} className="flex items-center space-x-2 text-white">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={priorityFilters[key]}
                    onCheckedChange={(val) =>
                      onPriorityFilterChange(key, Boolean(val))
                    }
                  />
                  <label
                    htmlFor={`priority-${priority}`}
                    className="text-sm font-medium leading-none capitalize "
                  >
                    {priority}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
