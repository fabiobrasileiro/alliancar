// hooks/useNegociacoes.ts
import { useState, useEffect } from "react";
import { negociacoesService } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { Negociacao, StatusNegociacao } from "@/app/(site)/vendas/components/types";

export function useNegociacoes() {
  const [negociacoes, setNegociacoes] = useState<Negociacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, perfil } = useUser();

  const loadNegociacoes = async () => {
    try {
      setLoading(true);
      const data = await negociacoesService.getAllNegociacoes();
      setNegociacoes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar negociações",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateNegociacaoStatus = async (
    id: string,
    status: StatusNegociacao,
  ) => {
    try {
      const updated = await negociacoesService.updateStatus(id, status);
      setNegociacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updated } : n)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status");
      throw err;
    }
  };

  const createNegociacao = async (formData: any) => {
    try {
      const novaNegociacao = await negociacoesService.createNegociacao(
        formData,
        perfil?.id,
      );
      setNegociacoes((prev) => [novaNegociacao, ...prev]);
      return novaNegociacao;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar negociação");
      throw err;
    }
  };

  useEffect(() => {
    loadNegociacoes();
  }, []);

  return {
    negociacoes,
    loading,
    error,
    loadNegociacoes,
    updateNegociacaoStatus,
    createNegociacao,
  };
}
