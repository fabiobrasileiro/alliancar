// app/negociacoes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useNegociacoes } from "@/hooks/useNegociacoes";
import NewNegotiationModal from "./components/NewNegotiationModal";
import { NewNegotiationForm, StatusNegociacao } from "./components/types";
import SalesKanban from "./components/SalesKanban";
import { useUser } from "@/context/UserContext";

export default function NegociacoesPage() {
  const { user } = useUser();
  const { negociacoes, loading, updateNegociacaoStatus, createNegociacao } = useNegociacoes();
  const [isNewNegotiationOpen, setIsNewNegotiationOpen] = useState(false);
  const [newNegotiationForm, setNewNegotiationForm] = useState<NewNegotiationForm>({
    placa: "",
    marca: "",
    modelo: "",
    ano_modelo: "",
    valor_negociado: 0,
    nomeContato: "",
    email: "",
    celular: "",
    estado: "",
    cidade: "",
    afiliado_id: "",
    origemLead: "",
  });

  // Atualizar o form quando o user estiver disponível
  useEffect(() => {
    if (user?.id) {
      setNewNegotiationForm(prev => ({
        ...prev,
        afiliado_id: user.id
      }));
    }
  }, [user?.id]);

  const handleDragStart = (ev: React.DragEvent, negociacaoId: string) => {
    ev.dataTransfer.setData("negociacaoId", negociacaoId);
  };

  const handleDragOver = (ev: React.DragEvent) => {
    ev.preventDefault();
  };

  const handleDrop = async (ev: React.DragEvent, newStatus: StatusNegociacao) => {
    ev.preventDefault();
    const negociacaoId = ev.dataTransfer.getData("negociacaoId");

    try {
      await updateNegociacaoStatus(negociacaoId, newStatus);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleCreateNegociacao = async (formData: NewNegotiationForm) => {
    try {
      // Garantir que o afiliado_id está incluído
      const formDataComAfiliado = {
        ...formData,
        afiliado_id: user?.id || ""
      };

      await createNegociacao(formDataComAfiliado);
      setIsNewNegotiationOpen(false);
      setNewNegotiationForm({
        placa: "",
        marca: "",
        modelo: "",
        ano_modelo: "",
        valor_negociado: 0,
        nomeContato: "",
        email: "",
        celular: "",
        estado: "",
        cidade: "",
        origemLead: "",
        afiliado_id: "",
      });
    } catch (error) {
      console.error("Erro ao criar negociação:", error);
      throw error;
    }
  };

  const handleFormChange = (field: keyof NewNegotiationForm, value: string | boolean | number) => {
    setNewNegotiationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Negociações</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todas as suas negociações em um só lugar
          </p>
        </div>

        <NewNegotiationModal
          isOpen={isNewNegotiationOpen}
          onOpenChange={setIsNewNegotiationOpen}
          formData={newNegotiationForm}
          onFormChange={handleFormChange}
          onSubmit={handleCreateNegociacao}
        />
      </div>

      <SalesKanban
        negociacoes={negociacoes}
        loading={loading}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
}