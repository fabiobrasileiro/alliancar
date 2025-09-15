import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Atividade } from "./types";
import { Usuario } from "./types";

interface AtividadeCardProps {
  atividade: Atividade;
  usuarios: Usuario[];
  onEdit: (atividade: Atividade) => void;
  onConcluir: (id: number) => void;
  onReabrir: (id: number) => void;
  onExcluir: (id: number) => void;
}

export const AtividadeCard: React.FC<AtividadeCardProps> = ({
  atividade,
  usuarios,
  onEdit,
  onConcluir,
  onReabrir,
  onExcluir,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
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
              Responsável:{" "}
              {usuarios.find((u) => u.id === atividade.afiliado_id)
                ?.nome_completo || atividade.afiliado_id}
            </span>
          </div>
        </div>
        <div className="flex md:flex-col flex-row mt-4 md:mt-0 items-end gap-2">
          <Badge
            variant={
              atividade.prioridade === "Alta"
                ? "red"
                : atividade.prioridade === "Normal"
                  ? "blue"
                  : "gray"
            }
            className="capitalize"
          >
            {atividade.prioridade}
          </Badge>
          <div className="flex gap-2">
            {atividade.status !== "concluida" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(atividade)}
                >
                  Editar
                </Button>
                <Button size="sm" onClick={() => onConcluir(atividade.id)}>
                  Concluir
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReabrir(atividade.id)}
                >
                  Reabrir
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onExcluir(atividade.id)}
                >
                  Excluir
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
