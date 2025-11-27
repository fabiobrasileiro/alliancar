"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { Copy, ExternalLink, Download, Link2, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Afiliado {
  id: string;
  nome_completo: string;
}

export default function Powerlinks() {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);
  const supabase = createClient();
  const { user } = useUser();

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
        .select("id, nome_completo")
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
      toast.success("Link copiado com sucesso!");
    } catch (error) {
      toast.error("Erro ao copiar link");
    } finally {
      setTimeout(() => setCopying(null), 1000);
    }
  };

  const generateQRCode = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&format=svg&margin=10`;
  };

  const downloadQRCode = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url.replace('svg', 'png');
    link.download = `${filename.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code baixado com sucesso!");
  };

  const allLinks = [
    {
      id: "default",
      nome: "Formulário Landing Page",
      url: `https://alliancar.vercel.app/formulario/formulariolp`,
      qrcode_url: generateQRCode(`https://alliancar.vercel.app/formulario/b2ac8368-ae6d-418b-b032-1c11d159fd23`),
      description: "Link otimizado para conversão em landing pages"
    },
    {
      id: "afiliado",
      nome: "Formulário Principal",
      url: `https://alliancar.vercel.app/formulario/${afiliado?.id || ''}`,
      qrcode_url: afiliado?.id ? generateQRCode(`https://alliancar.vercel.app/formulario/${afiliado.id}`) : undefined,
      description: "Seu link personalizado com seu ID único"
    },
  ];

  if (loading) {
    return (
      <SidebarLayout>
        <div className="p-6 space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="border border-gray-700 rounded-lg p-6 bg-gray-800/50 animate-pulse">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-9 bg-gray-700 rounded w-24"></div>
                      <div className="h-9 bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Link2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Power Links</h1>
              <p className="text-gray-400">
                Links personalizados para capturar clientes e receber comissões
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Powerlinks */}
        <div className="grid gap-6">
          {allLinks.map((link) => (
            <Card key={link.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* QR Code Section */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-4">
                    <div className="w-40 h-40 bg-white rounded-xl p-4 shadow-lg">
                      {link.qrcode_url ? (
                        <img
                          src={link.qrcode_url}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <QrCode className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    {link.qrcode_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQRCode(link.qrcode_url!, link.nome)}
                        className="flex items-center gap-2 border-gray-600 hover:bg-gray-700"
                      >
                        <Download className="w-4 h-4" />
                        Baixar QR Code
                      </Button>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-xl text-white">{link.nome}</h3>
                          {link.id === "default" && (
                            <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              Padrão
                            </Badge>
                          )}
                          {link.id === "afiliado" && (
                            <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">
                              Personalizado
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{link.description}</p>
                      </div>
                    </div>

                    {/* URL Display */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <p className="text-blue-300 font-mono text-sm break-all">
                        {link.url}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => copyToClipboard(link.url, link.id)}
                        disabled={copying === link.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                        {copying === link.id ? "Copiado!" : "Copiar Link"}
                      </Button>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button
                          variant="default"
                          className="border hover:bg-gray-700 text-white flex items-center gap-2"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir Link
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

       
      </div>
    </SidebarLayout>
  );
}