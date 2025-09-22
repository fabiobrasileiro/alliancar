"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";

const supabase = createClient();

interface Hotlink {
  id: string;
  nome: string;
  url: string;
  qrcode_url?: string;
  cliques: number;
  conversoes: number;
}

export default function Powerlinks() {
  const [powerlinks, setPowerlinks] = useState<Hotlink[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) fetchPowerlinks();
  }, [user]);

  const fetchPowerlinks = async () => {
    try {
      setLoading(true);

      // Busca os hotlinks do afiliado
      const { data: hotlinks, error: hotlinksError } = await supabase
        .from("hotlinks")
        .select("*");

      if (hotlinksError) {
        console.error("Erro ao buscar hotlinks:", hotlinksError);
        return;
      }

      setPowerlinks(hotlinks || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copiado com sucesso!");
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jelly-bean-500 mx-auto"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-4 space-y-8">
        {/* Título */}
        <div>
          <h3 className="text-2xl font-semibold mb-2">Powerlinks</h3>
          <p className="text-gray-600">
            Estes são os seus powerlinks, envie para seus clientes para receber
            diretamente os pedidos de cotação.
          </p>
        </div>

        {/* Lista de Powerlinks */}
        <div className="space-y-4">
          {powerlinks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum powerlink encontrado.
            </p>
          ) : (
            powerlinks.map((link) => (
              <div
                key={link.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* QR Code */}
                  <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                    {link.qrcode_url ? (
                      <img
                        src={link.qrcode_url}
                        alt="QR Code"
                        className="w-20 h-20"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">QR Code</span>
                    )}
                  </div>

                  {/* Informações do link */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{link.nome}</h4>
                    <p className="text-gray-600 text-sm break-all mb-2">
                      {link.url}
                    </p>
                    {/* <div className="flex gap-4 text-sm text-gray-500 mb-3">
                      <span>Cliques: {link.cliques}</span>
                      <span>Conversões: {link.conversoes}</span>
                    </div> */}
                    <Button
                      onClick={() => copyToClipboard(link.url)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Copiar Link
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
