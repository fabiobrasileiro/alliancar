import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/ui/pagination";
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'


export default async function ContatosPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: rows } = await supabase.from('profile').select()

  return (
    <>
      <div className="px-5 py-5">

        <header className="flex flex-col flex-wrap">
          <h2 className="font-bold leading-tight m-0 text-slate-700 text-2xl">
            Contatos
          </h2>
          <header className="flex items-center justify-between flex-wrap mt-2">
            <nav className="flex items-center flex-wrap gap-2">
              <span className="text-slate-950 text-sm flex gap-2 items-center">
                <Link className="hover:opacity-70" href="/">
                  Home
                </Link>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
              <span className="text-sm text-blue-700">
                {" "}
                <Link className="hover:opacity-70" href="/crm/client">
                  Contatos
                </Link>
              </span>
            </nav>
            <div className="flex items-center justify-center gap-4">
              <a
                target="_blank"
                rel="noreferrer"
                className="text-blue-700"
                href="https://www.youtube.com/@PowerCRM"
              >
                <div className="flex items-center justify-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-badge-help"
                  >
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" x2="12.01" y1="17" y2="17"></line>
                  </svg>
                  Aprenda a usar
                </div>
              </a>
            </div>
          </header>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mt-8 items-start w-full max-[1140px]:flex-wrap">
          <div className="flex flex-col flex-1 flex-grow max-lg:w-full">
            <Card className="overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle>Contatos</CardTitle>
                <CardDescription>173 contatos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-md:overflow-auto max-md:max-w-full">
                  <Table className="flex-nowrap bg-gray-500 text-white">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-8 w-10">
                          <Checkbox aria-label="Selecionar todos" />
                        </TableHead>
                        <TableHead>Nome completo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cpf/Cnpj</TableHead>
                        <TableHead>Banco</TableHead>
                        <TableHead>Agência</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Receita estimada</TableHead>
                        <TableHead>Cep</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Ativo</TableHead>
                        <TableHead className="w-16 text-center"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="flex-nowrap bg-gray-500 text-black">
                      {(rows || []).map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="pl-8">
                            <Checkbox
                              aria-label={`Selecionar contato ${r.contato || r.id}`}
                            />
                          </TableCell>
                          <TableCell>{r.nome_completo}</TableCell>
                          <TableCell>{r.email}</TableCell>
                          <TableCell>{r.cpf_cnpj}</TableCell>
                          <TableCell>{r.banco}</TableCell>
                          <TableCell>{r.agencia}</TableCell>
                          <TableCell>{r.conta}</TableCell>
                          <TableCell>{r.receita_estimada}</TableCell>
                          <TableCell>{r.cep}</TableCell>
                          <TableCell>{r.estado}</TableCell>
                          <TableCell>{r.ativo}</TableCell>
                          <TableCell className="w-16 text-center">
                            <a href={r.link} aria-label="Abrir contato">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-right m-auto"
                              >
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-slate-200 border border-solid flex-wrap max-w-full gap-2">
                <Pagination totalPages={7} currentPage={1} />
              </CardFooter>
            </Card>
          </div>

          <aside className="flex w-[min-content] max-sm:w-full max-md:w-2/3 max-lg:order-first">
            <Card className="w-full md:w-2/6 md:min-w-96">
              <CardContent className="p-6 md:p-8">
                <form className="w-full">
                  <div className="flex flex-col gap-4 max-lg:w-full">
                    <div className="flex flex-col w-full">
                      <Label htmlFor="search">Buscar contato</Label>
                      <Input id="search" placeholder="NOME | EMAIL | TELEFONE" />
                    </div>
                    <div>
                      <Button type="button">Aplicar</Button>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-slate-500">
                        Identifique e mescle registros de contatos duplicados
                        usando e-mail, telefone ou CPF/CNPJ.
                      </p>
                      <div>
                        <Button
                          type="submit"
                          className="w-full"
                          variant="outline"
                        >
                          Mesclar duplicados
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
