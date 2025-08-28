import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AtividadesPage() {
  return (
    <>
      <header className="flex flex-col flex-wrap">
        <h2 className="font-bold leading-tight m-0 text-slate-700 text-2xl">
          Atividades
        </h2>
        <header className="flex items-center justify-between flex-wrap">
          <nav className="flex items-center flex-wrap gap-2 max-[450px]:pr-8">
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
              <Link className="hover:opacity-70" href="/crm/activity">
                Atividades
              </Link>
            </span>
          </nav>
          <div className="flex items-center justify-center gap-4 pl-2 flex-row-reverse flex-wrap mt-4 lg:flex-row lg:mt-0">
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
            <Button type="button" className="text-sm px-5 h-9">
              + Atividades
            </Button>
            <button
              className="font-base text-center justify-center cursor-pointer focus:outline-none disabled:cursor-not-allowed rounded-md p-1 bg-white flex items-center"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
              <div className="flex items-center justify-center bg-red-500 text-white rounded-full w-4 h-4 text-[10px]">
                2
              </div>
            </button>
          </div>
        </header>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mt-8 items-start w-full">
        <div className="flex flex-col max-[965px]:w-full md:w-4/6">
          <Card className="w-full p-6 md:p-8">
            <div className="w-full block">
              <Tabs value="TODAY">
                <TabsList>
                  <TabsTrigger value="LATE" >
                    Atrasadas
                    <Badge variant="red">0</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="TODAY" >
                    Para hoje
                    <Badge variant="blue">0</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="PLANNED" >
                    Planejadas
                    <Badge variant="gray">0</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="COMPLETED" >
                    Concluidas
                    <Badge variant="green">0</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="LATE" ></TabsContent>

                <TabsContent value="TODAY" >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 items-center my-8 w-full bg-slate-100 text-slate-500 p-8 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-inbox"
                      >
                        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                      </svg>
                      <p className="text-base text-slate-700 m-0">
                        Nenhum atividade encontrada
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="PLANNED" ></TabsContent>
                <TabsContent value="COMPLETED" ></TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
