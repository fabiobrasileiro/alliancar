
import {  Negociacao, StatusNegociacao, AvaliacaoVenda } from "@/app/(site)/vendas/components/types";
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
      `,
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
      `,
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

// Serviço de relatórios
export const relatoriosService = {
  // Buscar dados do dashboard do afiliado
  async getDashboardAfiliado(afiliadoId?: string) {
    const { data, error } = await supabase
      .from("view_dashboard_afiliado")
      .select(
        `
        id,
        nome_completo,
        email,
        numero_placas,
        receita_total,
        receita_pendente,
        total_clientes,
        clientes_ativos,
        comissao_total,
        comissao_recebida,
        comissao_pendente,
        total_conquistas,
        ranking_atual
      `,
      )
      .eq(afiliadoId ? "id" : "1", afiliadoId || "1");

    if (error) throw error;
    return data;
  },

  // Buscar performance do afiliado
  async getPerformanceAfiliado(afiliadoId?: string) {
    const { data, error } = await supabase
      .from("view_performance_afiliado")
      .select(
        `
        id,
        afiliado_id,
        cliente_id,
        cliente_nome,
        placa_veiculo,
        valor_contrato,
        porcentagem_comissao,
        valor_comissao,
        mes_referencia,
        status,
        data_pagamento,
        data_formatada,
        valor_formatado,
        comissao_formatada
      `,
      )
      .eq("afiliado_id", afiliadoId || "1");

    if (error) throw error;
    return data;
  },

  // Buscar ranking top 10
  async getRankingTop10() {
    const { data, error } = await supabase
      .from("ranking_afiliados")
      .select(
        `
        id,
        afiliado_id,
        mes_referencia,
        posicao,
        total_vendas,
        total_comissao,
        afiliados:afiliado_id(nome_completo)
      `,
      )
      .order("posicao", { ascending: true })
      .limit(10);

    if (error) throw error;
    return data;
  },

  // Buscar negociações com avaliações
  async getNegociacoesAvaliacoes(filters?: {
    afiliadoId?: string;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
  }) {
    let query = supabase.from("vw_negociacoes_avaliacoes").select(`
      id,
      placa,
      ano_modelo,
      modelo,
      marca,
      afiliado_id,
      contato_id,
      status,
      valor_negociado,
      observacoes,
      criado_em,
      atualizado_em,
      status_avaliacao,
      valor_comissao,
      aprovado,
      data_aprovacao,
      contatos:contato_id(nome, email, celular)
    `);

    if (filters?.afiliadoId) {
      query = query.eq("afiliado_id", filters.afiliadoId);
    }
    if (filters?.dataInicio) {
      query = query.gte("criado_em", filters.dataInicio);
    }
    if (filters?.dataFim) {
      query = query.lte("criado_em", filters.dataFim);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    query = query.order("criado_em", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Buscar comissões da view de performance
  async getComissoes(filters?: {
    afiliadoId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    let query = supabase.from("view_performance_afiliado").select(`
      id,
      afiliado_id,
      cliente_nome,
      valor_comissao,
      porcentagem_comissao,
      mes_referencia,
      status,
      data_pagamento
    `);

    if (filters?.afiliadoId) {
      query = query.eq("afiliado_id", filters.afiliadoId);
    }
    if (filters?.dataInicio) {
      query = query.gte("mes_referencia", filters.dataInicio);
    }
    if (filters?.dataFim) {
      query = query.lte("mes_referencia", filters.dataFim);
    }

    query = query.order("mes_referencia", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Buscar pagamentos
  async getPagamentos(filters?: {
    afiliadoId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    let query = supabase.from("pagamentos").select(`
      id,
      afiliado_id,
      valor,
      descricao,
      mes_referencia,
      status,
      data,
      criado_em,
      atualizado_em,
      afiliados:afiliado_id(nome_completo)
    `);

    if (filters?.afiliadoId) {
      query = query.eq("afiliado_id", filters.afiliadoId);
    }
    if (filters?.dataInicio) {
      query = query.gte("data", filters.dataInicio);
    }
    if (filters?.dataFim) {
      query = query.lte("data", filters.dataFim);
    }

    query = query.order("data", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Buscar saques
  async getSaques(filters?: {
    afiliadoId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    let query = supabase.from("saques").select(`
      id,
      afiliado_id,
      valor,
      metodo,
      dados_banco,
      status,
      observacao,
      criado_em,
      processado_em,
      afiliados:afiliado_id(nome_completo)
    `);

    if (filters?.afiliadoId) {
      query = query.eq("afiliado_id", filters.afiliadoId);
    }
    if (filters?.dataInicio) {
      query = query.gte("criado_em", filters.dataInicio);
    }
    if (filters?.dataFim) {
      query = query.lte("criado_em", filters.dataFim);
    }

    query = query.order("criado_em", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Buscar metas dos afiliados
  async getMetasAfiliados(afiliadoId?: string) {
    let query = supabase.from("metas_afiliados").select(`
      id,
      afiliado_id,
      mes_referencia,
      valor_meta,
      vendas_meta,
      atingido,
      criado_em,
      afiliados:afiliado_id(nome_completo)
    `);

    if (afiliadoId) {
      query = query.eq("afiliado_id", afiliadoId);
    }

    query = query.order("criado_em", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Buscar ranking de afiliados
  async getRankingAfiliados() {
    const { data, error } = await supabase
      .from("ranking_afiliados")
      .select(
        `
        *,
        afiliados:afiliado_id(nome_completo)
      `,
      )
      .order("posicao", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Buscar atividades por período
  async getAtividades(filters?: {
    afiliadoId?: string;
    dataInicio?: string;
    dataFim?: string;
    tipo?: string;
  }) {
    let query = supabase.from("atividades").select(`
      id,
      afiliado_id,
      titulo,
      descricao,
      prazo,
      prioridade,
      tipo,
      status,
      concluida_em,
      criado_em,
      afiliados:afiliado_id(nome_completo)
    `);

    if (filters?.afiliadoId) {
      query = query.eq("afiliado_id", filters.afiliadoId);
    }
    if (filters?.dataInicio) {
      query = query.gte("prazo", filters.dataInicio);
    }
    if (filters?.dataFim) {
      query = query.lte("prazo", filters.dataFim);
    }
    if (filters?.tipo) {
      query = query.eq("tipo", filters.tipo);
    }

    query = query.order("prazo", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Buscar estatísticas resumidas
  async getEstatisticasResumo(filters?: {
    afiliadoId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    // Buscar contagem de negociações por status
    let negociacoesQuery = supabase
      .from("negociacoes")
      .select("status", { count: "exact" });

    if (filters?.afiliadoId) {
      negociacoesQuery = negociacoesQuery.eq("afiliado_id", filters.afiliadoId);
    }
    if (filters?.dataInicio) {
      negociacoesQuery = negociacoesQuery.gte("criado_em", filters.dataInicio);
    }
    if (filters?.dataFim) {
      negociacoesQuery = negociacoesQuery.lte("criado_em", filters.dataFim);
    }

    const [negociacoesResult, comissoesResult, pagamentosResult] =
      await Promise.all([
        negociacoesQuery,
        supabase.from("comissoes").select("valor", { count: "exact" }),
        supabase.from("pagamentos").select("valor", { count: "exact" }),
      ]);

    return {
      negociacoes: negociacoesResult.data || [],
      totalNegociacoes: negociacoesResult.count || 0,
      totalComissoes: comissoesResult.count || 0,
      totalPagamentos: pagamentosResult.count || 0,
    };
  },
};
