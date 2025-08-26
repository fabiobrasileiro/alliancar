import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar, { SidebarItem } from "@/components/sidebar";

export default function RelatoriosPage() {
  const sidebarItems: SidebarItem[] = [
    {
      id: "dinamicos",
      label: "Relatórios Dinâmicos",
      href: "/relatorios/dinamicos",
    },
    { id: "resumo", label: "Resumo de Uso", href: "/relatorios" },
    { id: "dashboard", label: "Dashboard", href: "/relatorios/dashboard" },
    { id: "funil", label: "Funil de Vendas", href: "/relatorios/funil" },
    {
      id: "motivos",
      label: "Motivos de Perda",
      href: "/relatorios/motivos-de-perda",
    },
    { id: "ranking", label: "Ranking", href: "/relatorios/ranking" },
    { id: "metas", label: "Resumo de Metas", href: "/relatorios/metas" },
    {
      id: "pagamento",
      label: "Formas de Pagamento",
      href: "/relatorios/formas-de-pagamento",
    },
    { id: "tags", label: "Grupos de tags", href: "/relatorios/grupos-de-tags" },
    {
      id: "listas",
      label: "Listas de Prospecção",
      href: "/relatorios/listas-de-prospeccao",
    },
    { id: "bd", label: "Banco de Dados", href: "/relatorios/banco-de-dados" },
  ];
  return (
    <>
      <div className="block m-auto p-2 md:px-6 md:py-4">
        <div className="flex gap-6 items-start w-full">
          <Sidebar title="Relatórios" items={sidebarItems} />

          <section className="flex-1 min-w-0">
            <header className="flex flex-col flex-wrap">
              <h2 className="font-bold leading-tight m-0 text-slate-700 text-2xl">
                Resumo de Uso
              </h2>
            </header>

            <div className="mt-6 flex flex-wrap gap-3 items-end">
              <div className="min-w-56">
                <label className="block text-sm text-slate-600 mb-1">
                  Cooperativa
                </label>
                <Select>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11375">ALLIANCAR CLUB</SelectItem>
                    <SelectItem value="0">Sem cooperativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-56">
                <label className="block text-sm text-slate-600 mb-1">
                  Vendedor
                </label>
                <Select>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="123998">Marcel Araújo</SelectItem>
                    <SelectItem value="124886">Allan Fernandes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-40">
                <label
                  htmlFor="dtDe"
                  className="block text-sm text-slate-600 mb-1"
                >
                  De
                </label>
                <Input id="dtDe" type="date" className="w-48" />
              </div>
              <div className="min-w-40">
                <label
                  htmlFor="dtAte"
                  className="block text-sm text-slate-600 mb-1"
                >
                  Até
                </label>
                <Input id="dtAte" type="date" className="w-48" />
              </div>

              <button
                type="button"
                className="h-11 w-11 rounded-md bg-blue-600 text-white grid place-items-center shadow-sm"
                aria-label="Filtrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-filter"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="rounded-md border p-4 bg-white">
                <strong className="text-2xl">6</strong>
                <p className="text-slate-600">Negociações criadas</p>
              </div>
              <div className="rounded-md border p-4 bg-white">
                <strong className="text-2xl text-blue-600">12</strong>
                <p className="text-slate-600">Cotações criadas</p>
              </div>
              <div className="rounded-md border p-4 bg-white">
                <strong className="text-2xl text-red-600">1</strong>
                <p className="text-slate-600">Negociações arquivadas</p>
              </div>
              <div className="rounded-md border p-4 bg-white">
                <strong className="text-2xl text-green-600">0</strong>
                <p className="text-slate-600">Vendas concretizadas</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
