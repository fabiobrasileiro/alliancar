import {
  AvaliacaoVenda,
  Negociacao,
  StatusNegociacao,
} from "@/app/vendas/components/types";
import { useUser } from "@/context/UserContext";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Serviço de negociações
export const negociacoesService = {
  // Buscar todas as negociações com join de contatos
  async getAllNegociacoes() {
    const { data, error } = await supabase
      .from("negociacoes")
      .select(
        `
        *,
        contatos:nome,
        contatos:email,
        contatos:celular
      `
      )
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return data as Negociacao[];
  },

  // Buscar negociações por status
  async getNegociacoesByStatus(status: StatusNegociacao) {
    const { data, error } = await supabase
      .from("negociacoes")
      .select(
        `
        *,
        contatos:nome,
        contatos:email,
        contatos:celular
      `
      )
      .eq("status", status)
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return data as Negociacao[];
  },

  // Criar nova negociação
  async createNegociacao(formData: any, userId: string | undefined) {
    // Primeiro criar o contato
    const { data: contato, error: contatoError } = await supabase
      .from("contatos")
      .insert({
        afiliado_id: userId, // Este campo é obrigatório pela FK
        nome: formData.nomeContato,
        email: formData.email,
        estado: formData.estado,
        cidade: formData.cidade,
        // Adicione outros campos opcionais se disponíveis no formData
        telefone: formData.telefone || null,
        cep: formData.cep ? parseInt(formData.cep.replace(/\D/g, "")) : null,
        cpf_cnpj: formData.cpfCnpj
          ? parseInt(formData.cpfCnpj.replace(/\D/g, ""))
          : null,
        enviar_cotacao_email: formData.enviarCotacaoEmail || false,
        veiculo_trabalho: formData.veiculoTrabalho || false,
        // Os campos 'origem' e 'origem_lead' são do tipo USER-DEFINED (enum)
        // Você precisará mapear para os valores corretos do enum
        origem: formData.origem || null,
        origem_lead: formData.origemLead || null,
        interesses: formData.interesses
          ? JSON.parse(formData.interesses)
          : null,
      })
      .select()
      .single();

    if (contatoError) {
      console.error("Erro ao inserir contato:", contatoError);
      throw new Error(`Falha ao criar contato: ${contatoError.message}`);
    }

    // Depois criar a negociação
    const { data, error } = await supabase
      .from("negociacoes")
      .insert({
        placa: formData.placa,
        ano_modelo: formData.ano_modelo,
        modelo: formData.modelo,
        marca: formData.marca,
        contato_id: contato.id,
        afiliado_id: userId, // Você precisa obter isso da sessão
        valor_negociado: formData.valor_negociado,
        observacoes: formData.observacoes,
        status: "Cotação recebida" as StatusNegociacao,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar status da negociação
  async updateStatus(negociacaoId: string, status: StatusNegociacao) {
    const { data, error } = await supabase
      .from("negociacoes")
      .update({ status, atualizado_em: new Date().toISOString() })
      .eq("id", negociacaoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar avaliações de vendas
  async getAvaliacoesVendas() {
    const { data, error } = await supabase
      .from("avaliacoes_vendas")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return data as AvaliacaoVenda[];
  },
};
