"use client";
import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/SidebarLayoute";
import { Copy, ExternalLink, Download, Link2, QrCode, UserPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Afiliado {
  id: string;
  nome_completo: string;
  porcentagem_comissao: number;
  tipo: string;
}

interface HotlinkClientProps {
  initialAfiliado: Afiliado | null;
}

export default function HotlinkClient({ initialAfiliado }: HotlinkClientProps) {
  const [afiliado] = useState<Afiliado | null>(initialAfiliado);
  const [refreshing] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, linkId: string) => {
    setCopying(linkId);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copiado com sucesso!");
    } catch (error) {
      toast.error("Erro ao copiar link");
    } finally {
      setTimeout(() => setCopying(null), 1000);
    }
  }, []);

  const generateQRCode = useCallback((url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&format=svg&margin=10`;
  }, []);

  const downloadQRCode = useCallback((url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url.replace('svg', 'png');
    link.download = `${filename.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code baixado com sucesso!");
  }, []);

  const isGerente = useMemo(
    () => (afiliado?.porcentagem_comissao ?? 0) >= 0.09 || afiliado?.tipo === 'gerente',
    [afiliado?.porcentagem_comissao, afiliado?.tipo]
  );
  const baseUrl = useMemo(
    () => (typeof window !== 'undefined' ? window.location.origin : 'https://alliancar.vercel.app'),
    []
  );

  const allLinks = useMemo(() => ([
    {
      id: "default",
      nome: "Formulário Landing Page",
      url: `${baseUrl}/formulario/formulariolp`,
      qrcode_url: generateQRCode(`${baseUrl}/formulario/formulariolp`),
      description: "Link otimizado para conversão em landing pages"
    },
    {
      id: "afiliado",
      nome: "Formulário Principal",
      url: `${baseUrl}/formulario/${afiliado?.id || ''}`,
      qrcode_url: afiliado?.id ? generateQRCode(`${baseUrl}/formulario/${afiliado.id}`) : undefined,
      description: "Seu link personalizado com seu ID único"
    },
    {
      id: "cadastro-afiliado",
      nome: "Link de Cadastro de Afiliados",
      url: `${baseUrl}/afiliacao?referral=${afiliado?.id || ''}`,
      qrcode_url: afiliado?.id ? generateQRCode(`${baseUrl}/afiliacao?referral=${afiliado.id}`) : undefined,
      description: "Link para cadastrar novos afiliados (rastreia quem indicou)",
      icon: UserPlus,
      badge: "Cadastro",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    },
    ...(isGerente ? [
      {
        id: "gerente",
        nome: "Link para Gerente",
        url: `${baseUrl}/afiliacao?referral=${afiliado?.id || ''}&tipo=gerente`,
        qrcode_url: afiliado?.id ? generateQRCode(`${baseUrl}/afiliacao?referral=${afiliado.id}&tipo=gerente`) : undefined,
        description: "Link para cadastrar novos gerentes",
        icon: UserPlus,
        badge: "Gerente",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
      }
    ] : [])
  ]), [afiliado?.id, generateQRCode, isGerente, baseUrl]);

  if (!afiliado) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <p className="text-red-300">Não foi possível carregar os dados do afiliado.</p>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Link2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  Hotlinks
                  {refreshing && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Atualizando...
                    </span>
                  )}
                </h1>
                <p className="text-gray-400">
                  Compartilhe links inteligentes e aumente suas conversões
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {afiliado.nome_completo}
              </Badge>
              {isGerente && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Gerente
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Cards de Links */}
        <div className="space-y-6">
          {allLinks.map((link) => (
            <Card key={link.id} className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-white flex items-center gap-2">
                      {link.icon ? <link.icon className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                      {link.nome}
                      {link.badge && (
                        <Badge className={link.badgeColor}>
                          {link.badge}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {link.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="bg-white p-3 rounded-lg">
                      {link.qrcode_url ? (
                        <img src={link.qrcode_url} alt="QR Code" className="w-32 h-32" />
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3">
                      <p className="text-sm text-blue-300 break-all font-mono">
                        {link.url}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(link.url, link.id)}
                        disabled={copying === link.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copying === link.id ? "Copiado!" : "Copiar link"}
                      </Button>

                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-gray-800 flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir
                        </Button>
                      </a>

                      {link.qrcode_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQRCode(link.qrcode_url!, link.nome)}
                          className="border-gray-600 text-white hover:bg-gray-800 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Baixar QR
                        </Button>
                      )}
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
