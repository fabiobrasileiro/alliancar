import React from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FinanceiroPage() {
  return (
    <>
      <div className="block m-auto p-2 md:px-6 md:py-4">
        <div className="flex gap-6 items-start w-full">
          <aside className="w-64 shrink-0 bg-slate-50 border rounded-md">
            <h3 className="px-4 py-3 font-semibold text-slate-700">
              Financeiro
            </h3>
            <nav className="px-2 pb-2">
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/financeiro"
                    className="block rounded-md px-3 py-2 text-slate-800 bg-white shadow-sm border"
                  >
                    Painel Financeiro
                  </Link>
                </li>
                <li>
                  <Link
                    href="/financeiro/pagamentos"
                    className="block rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100"
                  >
                    Painel de Pagamentos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/financeiro/contas-de-saque"
                    className="block rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100"
                  >
                    Contas de Saque
                  </Link>
                </li>
                <li>
                  <Link
                    href="/financeiro/faturas"
                    className="block rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100"
                  >
                    Faturas Power CRM
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          <section className="flex-1 min-w-0">
            <header className="flex flex-col flex-wrap">
              <h2 className="font-bold leading-tight m-0 text-slate-700 text-2xl">
                Painel Financeiro
              </h2>
            </header>

            <div className="mt-6 max-w-xl">
              <p className="text-slate-700 mb-2">
                Você quer acessar o painel financeiro da associação, de uma
                regional ou uma cooperativa?
              </p>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="associacao">Associação</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="cooperativa">Cooperativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
