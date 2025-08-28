"use client";
import React, { useState } from "react";
import Link from "next/link";

interface ContactRow {
  id: string | number;
  contato?: string;
  nome_completo?: string;
  telefone?: string;
  cpf_cnpj?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  receita_estimada?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  status?: string;
  ativo?: boolean;
  link?: string;
  [key: string]: unknown;
}
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
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Helper para renderizar valores de forma segura
const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export default function ContatosPage() {
  const router = useRouter();
  const supabase = createClient();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [banco, setBanco] = useState("");
  const [estado, setEstado] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);

  const buildQuery = () => {
    const filters = [];

    if (nomeCompleto) filters.push(`nome_completo.ilike.%${nomeCompleto}%`);
    if (telefone) filters.push(`telefone.eq.${telefone}`);
    if (cpfCnpj) filters.push(`cpf_cnpj.eq.${cpfCnpj}`);
    if (banco) filters.push(`banco.ilike.%${banco}%`);
    if (estado) filters.push(`estado.ilike.%${estado}%`);

    // Se houver termo de busca geral, adiciona aos filtros
    if (searchTerm) {
      filters.push(`nome_completo.ilike.%${searchTerm}%`);
      filters.push(`telefone.ilike.%${searchTerm}%`);
      filters.push(`email.ilike.%${searchTerm}%`);
    }

    return filters.join(",");
  };

  // Função para buscar dados
  const fetchData = async () => {
    setLoading(true);
    try {
      const queryFilter = buildQuery();

      let query = supabase.from("profile").select();

      if (queryFilter) {
        query = query.or(queryFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar dados:", error);
        return;
      }

      setRows(data || []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados quando o componente montar
  React.useEffect(() => {
    fetchData();
  }, []);

  // Handler para o formulário de busca
  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchData();
  };

  return (
    <>
      <div className="px-5 py-5">
        <header className="flex flex-col flex-wrap">
          <h2 className="font-bold leading-tight m-0 text-jelly-bean-950 text-2xl">
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
              <span className="text-sm text-jelly-bean-700">
                <Link className="hover:opacity-70" href="/crm/client">
                  Contatos
                </Link>
              </span>
            </nav>
          </header>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mt-8 items-start w-full max-[1140px]:flex-wrap">
          <div className="flex flex-col flex-1 flex-grow max-lg:w-full">
            <Card className="overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle>Contatos</CardTitle>
                <CardDescription>
                  {rows?.length} contatos encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-md:overflow-auto max-md:max-w-full">
                  <Table className="flex-nowrap bg-jelly-bean-950 text-white">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-8 w-10">
                          <Checkbox aria-label="Selecionar todos" />
                        </TableHead>
                        <TableHead>Nome completo</TableHead>
                        <TableHead>Telefone</TableHead>
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
                    <TableBody className="flex-nowrap bg-jelly-bean-50 text-jelly-bean-950 ">
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-4">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : (
                        (rows || []).map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="pl-8">
                              <Checkbox
                                aria-label={`Selecionar contato ${r.contato || r.id}`}
                              />
                            </TableCell>
                            <TableCell>
                              {renderValue(r.nome_completo)}
                            </TableCell>
                            <TableCell>{renderValue(r.telefone)}</TableCell>
                            <TableCell>{renderValue(r.cpf_cnpj)}</TableCell>
                            <TableCell>{renderValue(r.banco)}</TableCell>
                            <TableCell>{renderValue(r.agencia)}</TableCell>
                            <TableCell>{renderValue(r.conta)}</TableCell>
                            <TableCell>
                              {renderValue(r.receita_estimada)}
                            </TableCell>
                            <TableCell>{renderValue(r.cep)}</TableCell>
                            <TableCell>{renderValue(r.estado)}</TableCell>
                            <TableCell>{r.ativo ? "Sim" : "Não"}</TableCell>
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
                        ))
                      )}
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
                <form className="w-full" onSubmit={handleSearch}>
                  <div className="flex flex-col gap-4 max-lg:w-full">
                    <div className="flex flex-col w-full">
                      <Label htmlFor="search" className="text-jelly-bean-900">
                        Buscar contato
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <Label htmlFor="nome" className="text-jelly-bean-900">
                          Nome
                        </Label>
                        <Input
                          id="nome"
                          value={nomeCompleto}
                          onChange={(e) => setNomeCompleto(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label
                          htmlFor="telefone"
                          className="text-jelly-bean-900"
                        >
                          Telefone
                        </Label>
                        <Input
                          id="telefone"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label
                          htmlFor="cpfCnpj"
                          className="text-jelly-bean-900"
                        >
                          CPF/CNPJ
                        </Label>
                        <Input
                          id="cpfCnpj"
                          value={cpfCnpj}
                          onChange={(e) => setCpfCnpj(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="banco" className="text-jelly-bean-900">
                          Banco
                        </Label>
                        <Input
                          id="banco"
                          value={banco}
                          onChange={(e) => setBanco(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="estado" className="text-jelly-bean-900">
                          Estado
                        </Label>
                        <Input
                          id="estado"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-jelly-bean-900">
                        Aplicar Filtros
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNomeCompleto("");
                          setTelefone("");
                          setCpfCnpj("");
                          setBanco("");
                          setEstado("");
                          setSearchTerm("");
                          fetchData();
                        }}
                      >
                        Limpar
                      </Button>
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
