"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const supabase = createClient();
  const [showAllNews, setShowAllNews] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, perfil } = useUser();

  const [dashboardData, setDashboardData] = useState({
    saldo: {
      disponivel: "R$ 0,00",
      aReceber: "R$ 0,00",
    },
    atividades: {
      vencidas: 0,
      paraHoje: 0,
    },
  });

  // Buscar dados do dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar atividades
      const { data: atividades, error: atividadesError } = await supabase
        .from("atividades")
        .select("*");

      // Buscar pagamentos
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from("pagamentos")
        .select("*");

      if (atividadesError) {
        console.error("Erro ao buscar atividades:", atividadesError);
      }

      if (pagamentosError) {
        console.error("Erro ao buscar pagamentos:", pagamentosError);
      }

      if (atividades) {
        const hoje = new Date().toISOString().split("T")[0];

        // Contar atividades vencidas (prazo < hoje e status != 'concluida')
        const vencidas = atividades.filter(
          (atividade) =>
            atividade.prazo < hoje && atividade.status !== "concluida",
        ).length;

        // Contar atividades para hoje (prazo = hoje e status != 'concluida')
        const paraHoje = atividades.filter(
          (atividade) =>
            atividade.prazo === hoje && atividade.status !== "concluida",
        ).length;

        // Calcular saldo dos pagamentos
        let saldoTotal = 0;
        let aReceber = 0;

        if (pagamentos) {
          pagamentos.forEach((pagamento) => {
            const valor = parseFloat(pagamento.comissao) || 0;

            if (pagamento.status === "pago") {
              saldoTotal += valor;
            } else if (pagamento.status === "a_receber") {
              aReceber += valor;
            }
          });
        }

        setDashboardData((prev) => ({
          ...prev,
          atividades: {
            vencidas,
            paraHoje,
          },
          saldo: {
            disponivel: new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(saldoTotal),
            aReceber: new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(aReceber),
          },
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Conteúdo principal */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Olá, {perfil?.nome_completo}
            </h1>
            <p className="text-gray-600 mt-2">
              <strong>Acompanhe seu trabalho e novidades do Alliancar  CRM.</strong>
            </p>
          </div>

          {/* Seção Saldo */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Saldo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <a href="/financeiro" className="block">
                  <p className="text-gray-600">Disponível</p>
                  <strong className="text-green-600 text-xl">
                    {loading ? "Carregando..." : dashboardData.saldo.disponivel}
                  </strong>
                </a>
              </div>

              <div className="bg-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <a href="/financeiro" className="block">
                  <p className="text-gray-600">A Receber</p>
                  <strong className="text-blue-600 text-xl">
                    {loading ? "Carregando..." : dashboardData.saldo.aReceber}
                  </strong>
                </a>
              </div>
            </div>
          </div>

          {/* Seção Atividades */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Atividades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                <a href="/atividades" className="block">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-gray-700">
                    Acesse suas
                    <br />
                    negociações
                  </p>
                </a>
              </div>

              <div className="bg-red-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                <a href="/atividades" className="block">
                  <span className="text-red-600 text-2xl font-bold mb-2">
                    {loading ? "..." : dashboardData.atividades.vencidas}
                  </span>
                  <p className="text-gray-700">
                    Atividades <br />
                    Vencidas
                  </p>
                </a>
              </div>

              <div className="bg-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                <a href="/atividades" className="block">
                  <span className="text-blue-600 text-2xl font-bold mb-2">
                    {loading ? "..." : dashboardData.atividades.paraHoje}
                  </span>
                  <p className="text-gray-700">
                    Atividades <br />
                    Para hoje
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
