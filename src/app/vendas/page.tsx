// app/negociacoes/page.tsx
'use client';

import { useState } from 'react';

import { useNegociacoes } from '@/hooks/useNegociacoes';
import NewNegotiationModal from './components/NewNegotiationModal';
import { NewNegotiationForm, StatusNegociacao } from './components/types';
import SalesKanban from './components/SalesKanban';

// Create a proper initial form state
const initialFormData: NewNegotiationForm = {
  placa: '',
  marca: '',
  modelo: '',
  ano_modelo: '',
  valor_negociado: 0,
  nomeContato: '',
  email: '',
  celular: '',
  estado: '',
  cidade: '',
  origemLead: ''
};

export default function NegociacoesPage() {
  const { negociacoes, loading, updateNegociacaoStatus, createNegociacao } = useNegociacoes();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNewNegotiationOpen, setIsNewNegotiationOpen] = useState(false);
  const [filterData, setFilterData] = useState({} as any);
  const [newNegotiationForm, setNewNegotiationForm] = useState<NewNegotiationForm>(initialFormData);

  const handleDragStart = (ev: React.DragEvent, negociacaoId: string) => {
    ev.dataTransfer.setData('negociacaoId', negociacaoId);
  };

  const handleDragOver = (ev: React.DragEvent) => {
    ev.preventDefault();
  };

  const handleDrop = async (ev: React.DragEvent, newStatus: StatusNegociacao) => {
    ev.preventDefault();
    const negociacaoId = ev.dataTransfer.getData('negociacaoId');
    
    try {
      await updateNegociacaoStatus(negociacaoId, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleCreateNegociacao = async (formData: NewNegotiationForm) => {
    await createNegociacao(formData);
    setNewNegotiationForm(initialFormData); // Reset form after submission
  };

  const handleFormChange = (field: keyof NewNegotiationForm, value: string | boolean | number) => {
    setNewNegotiationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Negociações</h1>
        <div className="flex space-x-4">
          <NewNegotiationModal
            isOpen={isNewNegotiationOpen}
            onOpenChange={setIsNewNegotiationOpen}
            formData={newNegotiationForm}
            onFormChange={handleFormChange}
            onSubmit={handleCreateNegociacao}
          />
        </div>
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