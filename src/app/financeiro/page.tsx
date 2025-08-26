import React from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar, { SidebarItem } from "@/components/sidebar";

export default function FinanceiroPage() {
  const sidebarItems: SidebarItem[] = [
    { id: "painel", label: "Painel Financeiro", href: "/financeiro" },
    {
      id: "pagamentos",
      label: "Painel de Pagamentos",
      href: "/financeiro/pagamentos",
    },
    {
      id: "saque",
      label: "Contas de Saque",
      href: "/financeiro/contas-de-saque",
    },
    { id: "faturas", label: "Faturas Power CRM", href: "/financeiro/faturas" },
  ];
  return (
    <>
      <div className="block m-auto p-2 md:px-6 md:py-4">
        <div className="flex gap-6 items-start w-full">
          <Sidebar title="Financeiro" items={sidebarItems} />

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
