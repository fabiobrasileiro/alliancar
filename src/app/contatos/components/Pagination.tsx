import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <Button
        onClick={onPrevious}
        disabled={page === 1}
        variant="outline"
        className="px-4 py-2"
      >
        Anterior
      </Button>

      <span className="text-gray-700 font-medium">
        Página {page} de {totalPages}
      </span>

      <Button
        onClick={onNext}
        disabled={page === totalPages}
        variant="outline"
        className="px-4 py-2"
      >
        Próxima
      </Button>
    </div>
  );
};
