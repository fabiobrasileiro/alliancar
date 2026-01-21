"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
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

export default function Powerlinks() {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const supabase = createClient();
  const { user } = useUser();
  const fetchingRef = useRef(false);
  const CACHE_TTL_MS = 60000;

  useEffect(() => {
    if (user?.id) {
      const cached = getCachedAfiliado(user.id);
      if (cached?.afiliado) {
        setAfiliado(cached.afiliado);
        setLoading(false);
        if (!cached.isFresh) {
          fetchAfiliadoData(true);
        }
      } else {
        fetchAfiliadoData(false);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  const getCachedAfiliado = (authId: string) => {
    if (typeof window === "undefined") return null;
    const cacheKey = `hotlinks_cache_${authId}`;
    const dataKey = `hotlinks_data_${authId}`;
    const cacheTime = sessionStorage.getItem(cacheKey);
    const cachedData = sessionStorage.getItem(dataKey);

    if (!cacheTime || !cachedData) return null;

    try {
      const timestamp = parseInt(cacheTime, 10);
      const isFresh = Date.now() - timestamp < CACHE_TTL_MS;
      const afiliadoData = JSON.parse(cachedData) as Afiliado;
      return { afiliado: afiliadoData, isFresh };
    } catch {
      return null;
    }
  };

  const saveCachedAfiliado = (authId: string, data: Afiliado) => {
    if (typeof window === "undefined") return;
    const cacheKey = `hotlinks_cache_${authId}`;
    const dataKey = `hotlinks_data_${authId}`;
    sessionStorage.setItem(cacheKey, Date.now().toString());
    sessionStorage.setItem(dataKey, JSON.stringify(data));
  };

  const fetchAfiliadoData = async (isBackground: boolean) => {
    if (fetchingRef.current) return;
    try {
      fetchingRef.current = true;
      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const { data: afiliadoData, error } = await supabase
        .from("afiliados")
        .select("id, nome_completo, porcentagem_comissao, tipo")
        .eq("auth_id", user?.id)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do afiliado:", error);
        return;
      }

      setAfiliado(afiliadoData);
      if (user?.id) {
        saveCachedAfiliado(user.id, afiliadoData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do afiliado:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
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

  // Verifica se o afiliado tem 9% ou mais de comissão (gerente)
  const isGerente = (afiliado?.porcentagem_comissao ?? 0) >= 0.09 || afiliado?.tipo === 'gerente';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://alliancar.vercel.app';

  const allLinks = [
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
    // Link de cadastro de afiliados (sempre visível para todos)
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
    // Link para gerente (apenas se tiver 9% ou mais de comissão)
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
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 pb-8 sm:pb-12">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Link2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                Power Links
                {refreshing && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Atualizando...
                  </span>
                )}
              </h1>
              <p className="text-gray-400">
                Links personalizados para capturar clientes e receber comissões
              </p>
              {afiliado && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm text-gray-500">
                    Comissão atual: {((afiliado.porcentagem_comissao ?? 0) * 100).toFixed(1)}%
                  </p>
                  {isGerente && (
                    <Badge variant="default" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Gerente
                    </Badge>
                  )}
                </div>
              )}
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
                  <div className="flex-shrink-0 flex flex-col items-center gap-4 w-full sm:w-auto">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-xl p-3 sm:p-4 shadow-lg mx-auto sm:mx-0">
                      {link.qrcode_url ? (
                        <img
                          src={link.qrcode_url}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <QrCode className="w-10 h-10 sm:w-12 sm:h-12" />
                        </div>
                      )}
                    </div>
                    {link.qrcode_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQRCode(link.qrcode_url!, link.nome)}
                        className="flex items-center justify-center gap-2 border-gray-600 hover:bg-gray-700 w-full sm:w-auto min-h-[44px] sm:min-h-0"
                      >
                        <Download className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">Baixar QR Code</span>
                      </Button>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 space-y-4 min-w-0">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          {(link as any).icon && React.createElement((link as any).icon, { className: "w-5 h-5 text-blue-400 flex-shrink-0" })}
                          <h3 className="font-semibold text-lg sm:text-xl text-white break-words">{link.nome}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {link.id === "default" && (
                            <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-500/30 whitespace-nowrap">
                              Padrão
                            </Badge>
                          )}
                          {link.id === "afiliado" && (
                            <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30 whitespace-nowrap">
                              Personalizado
                            </Badge>
                          )}
                          {(link as any).badge && (
                            <Badge variant="default" className={`${(link as any).badgeColor || "bg-blue-500/20 text-blue-300 border-blue-500/30"} whitespace-nowrap`}>
                              {(link as any).badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{link.description}</p>
                    </div>

                    {/* URL Display */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 sm:p-4 overflow-hidden">
                      <p className="text-blue-300 font-mono text-xs sm:text-sm break-all word-break break-word">
                        {link.url}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        onClick={() => copyToClipboard(link.url, link.id)}
                        disabled={copying === link.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-0"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{copying === link.id ? "Copiado!" : "Copiar Link"}</span>
                      </Button>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full sm:w-auto"
                      >
                        <Button
                          variant="default"
                          className="border hover:bg-gray-700 text-white flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">Abrir Link</span>
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