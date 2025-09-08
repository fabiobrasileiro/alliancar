import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Atividade } from "./types";

interface ActivityCardProps {
  atividade: Atividade;
  onEdit: (atividade: Atividade) => void;
  onDelete: (id: number) => void;
}

export default function ActivityCard({ atividade, onEdit, onDelete }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case "alta":
        return "red";
      case "media":
        return "blue";
      case "baixa":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start flex-wrap">
        <div className="flex-1">
          <h4 className="font-semibold text-jelly-bean-950">
            {atividade.titulo}
          </h4>
          <p className="text-sm text-jelly-bean-800 mt-1">
            {atividade.descricao}
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-xs bg-jelly-bean-100 text-jelly-bean-800 px-2 py-1 rounded capitalize">
              Tipo: {atividade.tipo}
            </span>
            <span className="text-xs text-jelly-bean-800">
              Prazo: {formatDate(atividade.prazo)}
            </span>
            <span className="text-xs text-jelly-bean-800">
              Responsável: {atividade.responsavel}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={getPriorityColor(atividade.prioridade) as any}>
            {atividade.prioridade}
          </Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(atividade)}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(atividade.id)}
              className="text-red-600 hover:text-red-700"
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
