import * as React from "react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav aria-label="Paginação">
      <ul className="flex flex-wrap gap-2 items-center">
        <li>
          <button
            type="button"
            aria-label="Página anterior"
            disabled={isFirst}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded text-slate-800 hover:text-blue-600",
              isFirst && "opacity-50 pointer-events-none",
            )}
          >
            &lt;
          </button>
        </li>
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <li key={page}>
              <button
                type="button"
                aria-label={`Página ${page}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center text-sm w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-blue-200 hover:text-blue-700",
                  isActive && "bg-blue-600 text-white hover:text-white",
                )}
              >
                {page}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={isLast}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded text-slate-800 hover:text-blue-600",
              isLast && "opacity-50 pointer-events-none",
            )}
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
}
