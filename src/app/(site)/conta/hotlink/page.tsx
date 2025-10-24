"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { Copy, ExternalLink, Download } from "lucide-react";

interface Hotlink {
  id: string;
  nome: string;
  url: string;
  qrcode_url?: string;
}

interface Afiliado {
  id: string;
}

export default function Powerlinks() {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);
  const supabase = createClient();
  const { user, perfil } = useUser();

  useEffect(() => {
    if (user?.id) {
      fetchAfiliadoData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAfiliadoData = async () => {
    try {
      setLoading(true);
      const { data: afiliadoData, error } = await supabase
        .from("afiliados")
        .select("*")
        .eq("auth_id", user?.id)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do afiliado:", error);
        return;
      }

      setAfiliado(afiliadoData);
    } catch (error) {
      console.error("Erro ao buscar dados do afiliado:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, linkId: string) => {
    setCopying(linkId);
    try {
      await navigator.clipboard.writeText(text);
      // Using toast instead of alert for better UX
      alert("Link copiado com sucesso!");
    } catch (error) {
      alert("Erro ao copiar link");
    } finally {
      setTimeout(() => setCopying(null), 1000);
    }
  };

  const generateQRCode = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  const downloadQRCode = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Links combinados - padrão + personalizados
  const allLinks = [
    {
      id: "default",
      nome: "Formulário LP",
      url: `https://alliancar.vercel.app/formulario/formulariolp`,
      qrcode_url: generateQRCode(`https://alliancar.vercel.app/formulario/formulariolp`)
    },
    {
      id: "afiliado",
      nome: "Formulário Principal",
      url: `https://alliancar.vercel.app/formulario/${afiliado?.id || ''}`,
      qrcode_url: afiliado?.id ? generateQRCode(`https://alliancar.vercel.app/formulario/${afiliado.id}`) : undefined
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
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
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
                    {link.qrcode_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQRCode(link.qrcode_url!, link.nome)}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Baixar QR
                      </Button>
                    )}
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
                        onClick={() => copyToClipboard(link.url, link.id)}
                        disabled={copying === link.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                        {copying === link.id ? "Copiado!" : "Copiar Link"}
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
            <li>• Baixe o QR Code para usar em materiais offline</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
}