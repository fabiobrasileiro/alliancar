'use client';

import React, { useMemo, useState } from "react";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
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

interface LinksPersonalizadosClientProps {
  initialAfiliado: Afiliado | null;
}

export default function LinksPersonalizadosClient({ initialAfiliado }: LinksPersonalizadosClientProps) {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(initialAfiliado);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [valorAdesaoTexto, setValorAdesaoTexto] = useState<string>(() => {
    if (!initialAfiliado?.valor_adesao || initialAfiliado.valor_adesao <= 0) return "";
    return initialAfiliado.valor_adesao.toFixed(2).replace(".", ",");
  });

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
      // Usa REST direto do Supabase (igual aos testes no DevTools) com timeout controlado
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'links-personalizados',
          hypothesisId: 'H7',
          location: 'LinksPersonalizadosClient.tsx:handleSalvarValorPadrao:start',
          message: 'handleSalvarValorPadrao start',
          data: {
            afiliadoId: afiliado.id,
            valorNumerico,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => { });
      // #endregion

      const startTime = Date.now();

      const url = new URL(`${baseUrl}/rest/v1/afiliados`);
      url.searchParams.set("id", `eq.${afiliado.id}`);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15_000); // 15s

      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey || "",
          Authorization: `Bearer ${anonKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          valor_adesao: valorNumerico,
          atualizado_em: new Date().toISOString(),
        }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeoutId));

      const durationMs = Date.now() - startTime;

      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'links-personalizados',
          hypothesisId: 'H7',
          location: 'LinksPersonalizadosClient.tsx:handleSalvarValorPadrao:result',
          message: 'handleSalvarValorPadrao result',
          data: {
            durationMs,
            status: response.status,
            ok: response.ok,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => { });
      // #endregion

      if (!response.ok) {
        console.error("Erro HTTP ao salvar valor de adesão:", response.status);
        toast.error("Erro ao salvar valor de adesão.");
        setSaving(false);
        return;
      }

      toast.success("Valor de adesão padrão salvo com sucesso!");
      setAfiliado((prev) => (prev ? { ...prev, valor_adesao: valorNumerico } : prev));
    } catch (err) {
      console.error("Erro ao salvar valor de adesão:", err);

      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/5a97670e-1390-4727-9ee6-9b993445f7dc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'links-personalizados',
          hypothesisId: 'H7',
          location: 'LinksPersonalizadosClient.tsx:handleSalvarValorPadrao:error',
          message: 'handleSalvarValorPadrao error',
          data: {
            errorMessage: err instanceof Error ? err.message : String(err),
            errorName: err instanceof Error ? err.name : 'unknown',
          },
          timestamp: Date.now(),
        }),
      }).catch(() => { });
      // #endregion

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
