"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";

interface hotlinks {
  nome: string;
  link: string;
}

export default function Powerlinks() {
  const [powerlinks, setPowerlinks] = useState<hotlinks[]>([]);
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar hotlinks
      const { data: hotlinks, error: hotlinksError } = await supabase
        .from("hotlinks")
        .select("nome, link");

      if (hotlinksError) {
        console.error("Erro ao buscar hotlinks:", hotlinksError);
        return;
      }

      setPowerlinks(hotlinks || []);
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Executa ao montar
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Função de copiar link
  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    alert("Link copiado com sucesso!");
  };

  return (
    <SidebarLayout>
      <div className="p-4 space-y-8">
        {/* Título */}
        <div>
          <h3 className="text-2xl font-semibold mb-2">Powerlinks</h3>
          <p>
            Estes são os seus powerlinks, envie ele para seus clientes para
            receber diretamente os pedidos de cotação.
          </p>
        </div>

        {/* Lista de Powerlinks */}
        <div className="space-y-6">
          {powerlinks.map((link, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row border border-gray-300 rounded-lg p-4 gap-4"
            >
              {/* QR code placeholder */}
              <div className="w-36 h-36 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">QR</span>
              </div>

              {/* Info e botão */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{link.nome}</h4>
                  <h4 className="text-gray-500 break-all">{link.link}</h4>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => copyToClipboard(link.link)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Copiar Link
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Estado de carregamento */}
          {loading && <p>Carregando...</p>}
        </div>
      </div>
    </SidebarLayout>
  );
}
