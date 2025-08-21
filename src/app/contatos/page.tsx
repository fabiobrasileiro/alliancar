import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/ui/pagination';

export default function ContatosPage() {
  // Dados estáticos apenas para estruturar layout conforme HTML fornecido
  const rows = [
    { id: '28941663', contato: '', telefone: '-', email: '-', negociacoes: '1', responsavel: '', link: '/crm/client/28941663' },
    { id: '29006032', contato: 'Adenaildes santos', telefone: '(71) 98149-3190', email: 'djsbddbdhsbsdb@gmail.com', negociacoes: '1', responsavel: 'Marcel Araújo', link: '/crm/client/29006032' },
    { id: '27991093', contato: 'Adriano Coutinho', telefone: '(71) 98652-8745', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/27991093' },
    { id: '28876151', contato: 'Alysson', telefone: '(71) 99334-8948', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28876151' },
    { id: '28553518', contato: 'Anderson', telefone: '(71) 99231-0263', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28553518' },
    { id: '29359744', contato: 'André', telefone: '(71) 99946-9021', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/29359744' },
    { id: '27899712', contato: 'Antonio', telefone: '(71) 99234-2675', email: '-', negociacoes: '1', responsavel: 'Allan Fernandes', link: '/crm/client/27899712' },
    { id: '27934740', contato: 'Antônio', telefone: '-', email: 'antonio200dosreis@gmail.com', negociacoes: '1', responsavel: 'Rodrigo Ruvenat dos Santos Calixto', link: '/crm/client/27934740' },
    { id: '28499222', contato: 'Antonio Castro', telefone: '(71) 99341-3824', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28499222' },
    { id: '29242972', contato: 'axa', telefone: '(99) 99999-9999', email: 'axaaa@gmail.com', negociacoes: '1', responsavel: 'Marcel Araújo', link: '/crm/client/29242972' },
    { id: '28320681', contato: 'bruno nascimento', telefone: '(71) 98149-3190', email: 'bruno007barbosa@gmail.com', negociacoes: '1', responsavel: 'Marcel Araújo', link: '/crm/client/28320681' },
    { id: '28553691', contato: 'bruno nascimento', telefone: '(71) 98149-3190', email: 'jfhfjshgfjghgfh@gmail.com', negociacoes: '1', responsavel: 'Marcel Araújo', link: '/crm/client/28553691' },
    { id: '28924670', contato: 'bruno nascimento', telefone: '(71) 98149-3190', email: 'jfhfjshgfjghgfh@gmail.com', negociacoes: '1', responsavel: 'Marcel Araújo', link: '/crm/client/28924670' },
    { id: '28609709', contato: 'Caio', telefone: '(71) 98811-2631', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28609709' },
    { id: '27935921', contato: 'Caio Martins', telefone: '(71) 99270-7493', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/27935921' },
    { id: '27834514', contato: 'Carla', telefone: '(38) 98829-6753', email: 'carla@teste.com', negociacoes: '1', responsavel: 'Marcel Araújo', link: '/crm/client/27834514' },
    { id: '28342698', contato: 'Carlos', telefone: '(71) 98867-1893', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28342698' },
    { id: '28057185', contato: 'Carlucio', telefone: '(75) 98124-0421', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28057185' },
    { id: '28049924', contato: 'Claudio', telefone: '(71) 98878-0763', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28049924' },
    { id: '28889303', contato: 'Cliente', telefone: '(71) 98253-8752', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28889303' },
    { id: '28345451', contato: 'Cristina', telefone: '(71) 98182-5325', email: 'marcel.araujo2206@gmail.com', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28345451' },
    { id: '23082342', contato: 'Daniel', telefone: '(00) 00000-2100', email: '-', negociacoes: '1', responsavel: 'Suporte PowerCRM', link: '/crm/client/23082342' },
    { id: '27720544', contato: 'DANIEL', telefone: '(00) 00050-0000', email: 'ellen.costa@powercrm.com.br', negociacoes: '1', responsavel: 'Suporte PowerCRM', link: '/crm/client/27720544' },
    { id: '27930812', contato: 'Daniela Costa', telefone: '(71) 98131-9845', email: 'joabeamcardoso@gmail.com', negociacoes: '1', responsavel: 'Joabe', link: '/crm/client/27930812' },
    { id: '28268970', contato: 'Daniele', telefone: '(71) 98155-8001', email: '-', negociacoes: '1', responsavel: 'Hugo', link: '/crm/client/28268970' }
  ];

  return (
    <main className="block m-auto p-2 md:px-6 md:py-4">
      <header className="flex flex-col flex-wrap">
        <h2 className="font-bold leading-tight m-0 text-slate-700 text-2xl">Contatos</h2>
        <header className="flex items-center justify-between flex-wrap mt-2">
          <nav className="flex items-center flex-wrap gap-2">
            <span className="text-slate-950 text-sm flex gap-2 items-center">
              <a className="hover:opacity-70" href="/">Home</a>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
            <span className="text-sm text-blue-700"> <a className="hover:opacity-70" href="/crm/client">Contatos</a></span>
          </nav>
          <div className="flex items-center justify-center gap-4">
            <a target="_blank" rel="noreferrer" className="text-blue-700" href="https://www.youtube.com/@PowerCRM">
              <div className="flex items-center justify-center gap-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-help">
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
                <Table className="flex-nowrap">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-8 w-10">
                        <Checkbox aria-label="Selecionar todos" />
                      </TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Negociações</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead className="w-16 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="pl-8">
                          <Checkbox aria-label={`Selecionar contato ${r.contato || r.id}`} />
                        </TableCell>
                        <TableCell>{r.contato}</TableCell>
                        <TableCell>{r.telefone}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>{r.negociacoes}</TableCell>
                        <TableCell>{r.responsavel}</TableCell>
                        <TableCell className="w-16 text-center">
                          <a href={r.link} aria-label="Abrir contato">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right m-auto">
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
                      Identifique e mescle registros de contatos duplicados usando e-mail, telefone ou CPF/CNPJ.
                    </p>
                    <div>
                      <Button type="submit" className="w-full" variant="outline">
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
    </main>
  );
}

