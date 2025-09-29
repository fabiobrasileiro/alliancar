// hooks/useNegociacoes.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Negociacao, StatusNegociacao, NewNegotiationForm } from '@/app/(site)/vendas/components/types';

export function useNegociacoes() {
  const [negociacoes, setNegociacoes] = useState<Negociacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar negociações com join para contatos
  useEffect(() => {
    loadNegociacoes();
    
    // Subscribe para mudanças em tempo real
    const subscription = supabase
      .channel('negociacoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'negociacoes'
        },
        async (payload) => {
          console.log('Mudança realtime detectada:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Carregar a nova negociação com dados do contato
            await loadNovaNegociacao(payload.new.id);
          } else if (payload.eventType === 'UPDATE') {
            // Buscar os dados atualizados com join
            const { data: negociacaoAtualizada, error } = await supabase
              .from('negociacoes')
              .select(`
                *,
                contatos:contato_id (
                  nome,
                  email,
                  telefone
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && negociacaoAtualizada) {
              const negociacaoComContato = {
                ...negociacaoAtualizada,
                contato_nome: negociacaoAtualizada.contatos?.nome,
                contato_email: negociacaoAtualizada.contatos?.email,
                contato_celular: negociacaoAtualizada.contatos?.telefone
              };

              setNegociacoes(prev => prev.map(n => 
                n.id === payload.new.id ? negociacaoComContato : n
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            setNegociacoes(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Status da subscription:', status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadNegociacoes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('negociacoes')
        .select(`
          *,
          contatos:contato_id (
            nome,
            email,
            telefone
          )
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      // Transformar os dados para incluir informações do contato
      const negociacoesComContato = data.map(negociacao => ({
        ...negociacao,
        contato_nome: negociacao.contatos?.nome,
        contato_email: negociacao.contatos?.email,
        contato_celular: negociacao.contatos?.telefone
      }));

      setNegociacoes(negociacoesComContato);
    } catch (error) {
      console.error('Erro ao carregar negociações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNovaNegociacao = async (negociacaoId: string) => {
    try {
      const { data, error } = await supabase
        .from('negociacoes')
        .select(`
          *,
          contatos:contato_id (
            nome,
            email,
            telefone
          )
        `)
        .eq('id', negociacaoId)
        .single();

      if (error) throw error;

      if (data) {
        const negociacaoComContato = {
          ...data,
          contato_nome: data.contatos?.nome,
          contato_email: data.contatos?.email,
          contato_celular: data.contatos?.telefone
        };

        setNegociacoes(prev => [negociacaoComContato, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao carregar nova negociação:', error);
    }
  };

  const updateNegociacaoStatus = async (negociacaoId: string, newStatus: StatusNegociacao) => {
    try {
      console.log('Atualizando status:', { negociacaoId, newStatus });

      const { error } = await supabase
        .from('negociacoes')
        .update({ 
          status: newStatus,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', negociacaoId);

      if (error) throw error;

      // Atualização otimista do estado local
      setNegociacoes(prev => prev.map(negociacao => 
        negociacao.id === negociacaoId 
          ? { ...negociacao, status: newStatus }
          : negociacao
      ));

      console.log('Status atualizado com sucesso');

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
      // Reverter a atualização otimista em caso de erro
      setNegociacoes(prev => prev.map(negociacao => 
        negociacao.id === negociacaoId 
          ? { ...negociacao, status: negociacao.status } // Reverter para o status anterior
          : negociacao
      ));
      
      throw error;
    }
  };

  const createNegociacao = async (formData: NewNegotiationForm) => {
    try {
      // Primeiro, criar ou buscar o contato
      let contatoId;

      // Verificar se já existe um contato com este email ou telefone
      if (formData.email || formData.celular) {
        const { data: contatoExistente } = await supabase
          .from('contatos')
          .select('id')
          .or(`email.eq.${formData.email},telefone.eq.${formData.celular}`)
          .single();

        if (contatoExistente) {
          contatoId = contatoExistente.id;
          
          // Atualizar contato existente
          await supabase
            .from('contatos')
            .update({
              nome: formData.nomeContato,
              email: formData.email,
              telefone: formData.celular,
              origem: formData.origemLead,
              estado: formData.estado,
              cidade: formData.cidade,
              afiliado_id: formData.afiliado_id
            })
            .eq('id', contatoId);
        }
      }

      // Se não encontrou contato existente, criar um novo
      if (!contatoId) {
        const { data: novoContato, error: contatoError } = await supabase
          .from('contatos')
          .insert({
            nome: formData.nomeContato,
            email: formData.email,
            telefone: formData.celular,
            origem: formData.origemLead,
            estado: formData.estado,
            cidade: formData.cidade,
            afiliado_id: formData.afiliado_id
          })
          .select()
          .single();

        if (contatoError) throw contatoError;
        contatoId = novoContato.id;
      }

      // Agora criar a negociação
      const { data: novaNegociacao, error: negociacaoError } = await supabase
        .from('negociacoes')
        .insert({
          placa: formData.placa.toUpperCase(),
          ano_modelo: formData.ano_modelo,
          modelo: formData.modelo,
          marca: formData.marca,
          valor_negociado: formData.valor_negociado,
          contato_id: contatoId,
          afiliado_id: formData.afiliado_id,
          status: 'Cotação recebida' as StatusNegociacao,
          observacoes: formData.observacoes
        })
        .select(`
          *,
          contatos:contato_id (
            nome,
            email,
            telefone
          )
        `)
        .single();

      if (negociacaoError) throw negociacaoError;

      // Transformar os dados para incluir informações do contato
      const negociacaoComContato = {
        ...novaNegociacao,
        contato_nome: novaNegociacao.contatos?.nome,
        contato_email: novaNegociacao.contatos?.email,
        contato_celular: novaNegociacao.contatos?.telefone
      };

      // Atualização otimista - adicionar à lista
      setNegociacoes(prev => [negociacaoComContato, ...prev]);

      return negociacaoComContato;

    } catch (error) {
      console.error('Erro ao criar negociação:', error);
      throw error;
    }
  };

  return {
    negociacoes,
    loading,
    updateNegociacaoStatus,
    createNegociacao,
    refreshNegociacoes: loadNegociacoes,
  };
}