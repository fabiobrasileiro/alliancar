// components/SalesCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  User,
} from "lucide-react";
import { SaleCard } from "./types";

interface SalesCardProps {
  card: SaleCard;
  onDragStart?: (ev: React.DragEvent, cardId: string) => void;
}

export default function SalesCard({ card, onDragStart }: SalesCardProps) {
  const handleDragStart = (ev: React.DragEvent) => {
    ev.dataTransfer.setData("negociacaoId", card.id);
    ev.dataTransfer.effectAllowed = "move";
    
    if (onDragStart) {
      onDragStart(ev, card.id);
    }
  };

  return (
    <Card
      className="mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-4">
        {/* Header com indicadores de temperatura */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step <= 2
                    ? "bg-yellow-400"
                    : step <= 4
                      ? "bg-orange-400"
                      : step <= 6
                        ? "bg-red-400"
                        : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {card.hasTracker && (
              <Badge variant="default" className="text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Rastreador
              </Badge>
            )}
            {card.isAccepted && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Aceita
              </Badge>
            )}
            {card.isExpired && (
              <Badge variant="default" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Expirada
              </Badge>
            )}
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {card.clientName}
            </span>
            <span className="text-xs text-gray-500">• {card.date}</span>
          </div>
          <p className="text-sm text-gray-700 font-medium">{card.vehicle}</p>
          <div className="text-sm font-bold text-green-600">{card.price}</div>
          <div className="text-xs text-gray-500">Placa: {card.placa}</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">
                Sem atividade pendente
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Indicador de dias */}
            <div className="flex space-x-1">
              {[1, 2, 3].map((day) => (
                <div
                  key={day}
                  className={`w-2 h-2 rounded-full ${
                    day <= card.daysInStage ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            {/* Avatar do usuário */}
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            {/* Botão de ações */}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}