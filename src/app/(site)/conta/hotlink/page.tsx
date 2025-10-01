"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { Copy, ExternalLink } from "lucide-react";

interface Hotlink {
  id: string;
  nome: string;
  url: string;
  qrcode_url?: string;
}

interface Afiliado {
  form_link: string;
}

export default function Powerlinks() {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      fetchAfiliadoData();
    }
  }, [user]);

  const fetchAfiliadoData = async () => {
    try {
      const { data: afiliadoData, error } = await supabase
        .from("afiliados")
        .select("form_link")
        .eq("auth_id", user?.id)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do afiliado:", error);
        return;
      }

      setAfiliado(afiliadoData);
    } catch (error) {
      console.error("Erro ao buscar dados do afiliado:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copiado com sucesso!");
  };

  // Gerar QR Code URL usando um serviço online
  const generateQRCode = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  // Links combinados - padrão + personalizados
  const allLinks = [
    {
      id: "default",
      nome: "Formulário LP",
      url: `https://alliancar.vercel.app/formulario/formulariolp`,
      qrcode_url: afiliado?.form_link ? generateQRCode(`https://alliancar.vercel.app/formulario/formulariolp`) : undefined
    },
    {
      id: "afiliado",
      nome: "Formulário Principal",
      url: `https://alliancar.vercel.app/formulario/${afiliado?.form_link || ''}`,
      qrcode_url: afiliado?.form_link ? generateQRCode(`https://alliancar.vercel.app/formulario/${afiliado.form_link}`) : undefined
    },
  ];

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
          {allLinks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum powerlink encontrado.
            </p>
          ) : (
            allLinks.map((link) => (
              <div
                key={link.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* QR Code para todos os links */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border">
                      {link.qrcode_url ? (
                        <img
                          src={link.qrcode_url}
                          alt="QR Code"
                          className="w-28 h-28 rounded"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm text-center px-2">
                          QR Code não disponível
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações do link */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{link.nome}</h4>
                      {link.id === "default" && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Padrão
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm break-all mb-4 p-2 bg-gray-50 rounded border">
                      {link.url}
                    </p>

                    {/* Botões de ação */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => copyToClipboard(link.url)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar Link
                      </Button>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ir para o Link
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Informação adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Como usar seus Powerlinks?</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Compartilhe os links com seus clientes por WhatsApp, e-mail ou redes sociais</li>
            <li>• Use o QR Code para materiais impressos ou apresentações</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
} 