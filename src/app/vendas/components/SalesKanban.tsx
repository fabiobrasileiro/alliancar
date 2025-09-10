// components/SalesKanban.tsx
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import SalesCard from "./SalesCard";
import { Negociacao, StatusNegociacao } from "./types";

interface Column {
  id: StatusNegociacao;
  title: string;
  count: number;
  color: string;
}

interface SalesKanbanProps {
  negociacoes: Negociacao[];
  loading: boolean;
  onDragStart?: (ev: React.DragEvent, negociacaoId: string) => void;
  onDragOver?: (ev: React.DragEvent) => void;
  onDrop?: (ev: React.DragEvent, status: StatusNegociacao) => void;
}

export default function SalesKanban({ 
  negociacoes, 
  loading, 
  onDragStart, 
  onDragOver, 
  onDrop 
}: SalesKanbanProps) {
  const getCardsForColumn = (status: StatusNegociacao) => {
    return negociacoes.filter((negociacao) => negociacao.status === status);
  };

  const convertNegociacaoToSaleCard = (negociacao: Negociacao) => ({
    id: negociacao.id,
    clientName: negociacao.contato_nome || 'Cliente',
    date: new Date(negociacao.criado_em).toLocaleDateString('pt-BR'),
    vehicle: `${negociacao.marca} ${negociacao.modelo} ${negociacao.ano_modelo}`,
    price: negociacao.valor_negociado 
      ? `R$ ${negociacao.valor_negociado.toLocaleString('pt-BR')}` 
      : 'Valor não informado',
    status: negociacao.status,
    tags: [],
    hasTracker: false,
    isAccepted: false,
    isExpired: false,
    daysInStage: Math.floor((Date.now() - new Date(negociacao.criado_em).getTime()) / (1000 * 60 * 60 * 24)),
    user: 'Usuário',
    placa: negociacao.placa,
    marca: negociacao.marca,
    modelo: negociacao.modelo,
    ano_modelo: negociacao.ano_modelo,
    valor_negociado: negociacao.valor_negociado
  });

  const getColumns = (): Column[] => {
    return [
      {
        id: "Cotação recebida",
        title: "Cotações recebidas",
        count: negociacoes.filter((n) => n.status === "Cotação recebida").length,
        color: "bg-blue-50",
      },
      {
        id: "Em negociação",
        title: "Em negociação",
        count: negociacoes.filter((n) => n.status === "Em negociação").length,
        color: "bg-orange-50",
      },
      {
        id: "Vistoria",
        title: "Vistorias",
        count: negociacoes.filter((n) => n.status === "Vistoria").length,
        color: "bg-purple-50",
      },
      {
        id: "Liberada para cadastro",
        title: "Liberadas para cadastro",
        count: negociacoes.filter((n) => n.status === "Liberada para cadastro").length,
        color: "bg-green-50",
      },
      {
        id: "Venda concretizada",
        title: "Vendas concretizadas",
        count: negociacoes.filter((n) => n.status === "Venda concretizada").length,
        color: "bg-emerald-50",
      },
    ];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {getColumns().map((column) => (
        <div 
          key={column.id} 
          className={`${column.color} rounded-lg p-4 min-h-[600px]`}
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
              getCardsForColumn(column.id).map((negociacao) => (
                <SalesCard 
                  key={negociacao.id} 
                  card={convertNegociacaoToSaleCard(negociacao)} 
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