import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import SalesCard from "./SalesCard";
import { SaleCard } from "./types";

interface Column {
  id: SaleCard["status"];
  title: string;
  count: number;
  color: string;
}

interface SalesKanbanProps {
  cards: SaleCard[];
  loading: boolean;
  onDragStart?: (ev: React.DragEvent, cardId: string) => void;
  onDragOver?: (ev: React.DragEvent) => void;
  onDrop?: (ev: React.DragEvent, status: SaleCard["status"]) => void;
}

export default function SalesKanban({ 
  cards, 
  loading, 
  onDragStart, 
  onDragOver, 
  onDrop 
}: SalesKanbanProps) {
  const getCardsForColumn = (status: SaleCard["status"]) => {
    return cards.filter((card) => card.status === status);
  };

  const getColumns = (): Column[] => {
    return [
      {
        id: "quotation" as const,
        title: "Cotações recebidas",
        count: cards.filter((c) => c.status === "quotation").length,
        color: "bg-blue-50",
      },
      {
        id: "negotiation" as const,
        title: "Em negociação",
        count: cards.filter((c) => c.status === "negotiation").length,
        color: "bg-orange-50",
      },
      {
        id: "inspection" as const,
        title: "Vistorias",
        count: cards.filter((c) => c.status === "inspection").length,
        color: "bg-purple-50",
      },
      {
        id: "ready" as const,
        title: "Liberadas para cadastro",
        count: cards.filter((c) => c.status === "ready").length,
        color: "bg-green-50",
      },
      {
        id: "closed" as const,
        title: "Vendas concretizadas",
        count: cards.filter((c) => c.status === "closed").length,
        color: "bg-emerald-50",
      },
    ];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {getColumns().map((column) => (
        <div 
          key={column.id} 
          className={`${column.color} rounded-lg p-4`}
          onDragOver={onDragOver}
          onDrop={(ev) => onDrop?.(ev, column.id)}
        >
          {/* Header da coluna */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <p className="text-sm text-gray-600">
                {column.count === 0
                  ? "nenhuma encontrada"
                  : `${column.count} encontrada${column.count !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Cards da coluna */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-gray-600">Carregando...</div>
            ) : (
              getCardsForColumn(column.id).map((card) => (
                <SalesCard 
                  key={card.id} 
                  card={card} 
                  onDragStart={onDragStart} 
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
