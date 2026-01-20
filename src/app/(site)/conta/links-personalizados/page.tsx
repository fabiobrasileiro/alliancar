"use client";

import React, { useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";

interface Afiliado {
  id: string;
  nome_completo: string;
  valor_adesao: number;
}

export default function LinksPersonalizadosPage() {
  const supabase = createClient();
  const { user } = useUser();

  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [valorAdesaoTexto, setValorAdesaoTexto] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      carregarAfiliado();
    } else {
      setLoading(false);
    }
  }, [user]);

  const carregarAfiliado = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("afiliados")
        .select("id, nome_completo, valor_adesao")
        .eq("auth_id", user?.id)
        .single();

      if (error) {
        console.error("Erro ao carregar afiliado:", error);
        toast.error("Não foi possível carregar seus dados de afiliado.");
        return;
      }

      setAfiliado(data);
      if (data?.valor_adesao && data.valor_adesao > 0) {
        setValorAdesaoTexto(data.valor_adesao.toFixed(2).replace(".", ","));
      }
    } catch (err) {
      console.error("Erro ao carregar afiliado:", err);
      toast.error("Erro ao carregar afiliado.");
    } finally {
      setLoading(false);
    }
  };

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://alliancar.vercel.app";

  const valorNumerico = useMemo(() => {
    const limpo = valorAdesaoTexto.replace(/[^\d,\.]/g, "").replace(".", "").replace(",", ".");
    const parsed = parseFloat(limpo);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [valorAdesaoTexto]);

  const linkPersonalizado = useMemo(() => {
    if (!afiliado?.id || !valorNumerico) return "";
    const valorParam = valorNumerico.toFixed(2);
    return `${baseUrl}/form/${afiliado.id}?adesao=${encodeURIComponent(valorParam)}`;
  }, [afiliado, baseUrl, valorNumerico]);

  const handleSalvarValorPadrao = async () => {
    if (!afiliado?.id) return;

    if (!valorNumerico) {
      toast.error("Digite um valor de adesão válido (maior que zero).");
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from("afiliados")
        .update({
          valor_adesao: valorNumerico,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", afiliado.id);

      if (error) {
        console.error("Erro ao salvar valor de adesão:", error);
        toast.error("Erro ao salvar valor de adesão.");
        return;
      }

      toast.success("Valor de adesão padrão salvo com sucesso!");
      setAfiliado((prev) => (prev ? { ...prev, valor_adesao: valorNumerico } : prev));
    } catch (err) {
      console.error("Erro ao salvar valor de adesão:", err);
      toast.error("Erro ao salvar valor de adesão.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!linkPersonalizado) {
      toast.error("Defina um valor de adesão válido para gerar o link.");
      return;
    }

    try {
      setCopying(true);
      await navigator.clipboard.writeText(linkPersonalizado);
      toast.success("Link personalizado copiado com sucesso!");
    } catch (err) {
      console.error("Erro ao copiar link:", err);
      toast.error("Erro ao copiar link.");
    } finally {
      setTimeout(() => setCopying(false), 800);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse h-64" />
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
              <h1 className="text-3xl font-bold text-white">Links Personalizados</h1>
              <p className="text-gray-400">
                Defina o valor da taxa de adesão e gere um link que já leva o cliente para o
                formulário com esse valor preenchido automaticamente.
              </p>
            </div>
          </div>

          {afiliado && (
            <div className="mt-2">
              <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {afiliado.nome_completo}
              </Badge>
            </div>
          )}
        </div>

        {/* Card principal */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Valor de Adesão Personalizado</CardTitle>
            <CardDescription className="text-gray-400">
              Escolha o valor que deseja cobrar na adesão. O link abaixo já levará o cliente para o
              formulário de venda com esse valor aplicado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Valor da taxa de adesão (R$)
              </label>
              <div className="flex gap-3 items-center max-w-sm">
                <span className="text-gray-300">R$</span>
                <Input
                  value={valorAdesaoTexto}
                  onChange={(e) => setValorAdesaoTexto(e.target.value)}
                  placeholder="0,00"
                  className="bg-gray-900/60 border-gray-700 text-white"
                />
              </div>
              <p className="text-xs text-gray-400">
                Digite apenas números, com vírgula para centavos. Exemplo:{" "}
                <span className="font-mono">250,00</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleSalvarValorPadrao}
                disabled={saving || !valorNumerico}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? "Salvando..." : "Salvar como padrão"}
              </Button>
              {(afiliado?.valor_adesao ?? 0) > 0 && (
                <span className="text-xs text-gray-400 self-center">
                  Valor padrão atual:{" "}
                  <span className="font-semibold text-gray-200">
                    R$ {(afiliado?.valor_adesao ?? 0).toFixed(2).replace(".", ",")}
                  </span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Link personalizado com adesão aplicada
              </label>
              <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                <p className="text-blue-300 font-mono text-xs break-all min-h-[1.5rem]">
                  {linkPersonalizado || "Defina um valor de adesão para gerar o link."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={copying || !linkPersonalizado}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copying ? "Copiado!" : "Copiar link"}
                </Button>

                {linkPersonalizado && (
                  <a href={linkPersonalizado} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-800 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir formulário
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}

