// Para server components/API routes, use createClient do @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

class CobrancasService {
  constructor() {
    this.asaasApiKey = process.env.ASAAS_API_KEY;
    this.asaasBaseURL = 'https://api-sandbox.asaas.com/v3';

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  async sincronizarCobrancas() {
    try {
      console.log('🔄 Iniciando sincronização de cobranças...');

      const response = await fetch(`${this.asaasBaseURL}/payments?status=CONFIRMED`, {
        headers: { 'access_token': this.asaasApiKey }
      });

      if (!response.ok) {
        throw new Error(`Erro Asaas: ${response.status}`);
      }

      const data = await response.json();

      console.log(`📦 ${data.data?.length || 0} cobranças encontradas`);

      if (!data.data || data.data.length === 0) {
        return { success: true, message: 'Nenhuma cobrança para sincronizar' };
      }

      for (const cobranca of data.data) {
        try {
          // Busca nome do cliente
          const customerName = await this.getCustomerName(cobranca.customer);
          console.log(customerName)

          // Insere/atualiza no Supabase
          const { error } = await this.supabase
            .from('cobrancas')
            .upsert({
              asaas_id: cobranca.id,
              afiliado_id: cobranca.externalReference,
              customer_id: cobranca.customer,
              customer_name: customerName,
              value: cobranca.value,
              due_date: cobranca.dueDate,
              status: cobranca.status,
              billing_type: cobranca.billingType,
              updated_at: new Date().toISOString()

            }, {
              onConflict: 'asaas_id',
              ignoreDuplicates: false
            });

          if (error) {
            console.error(`❌ Erro ao salvar cobrança ${cobranca.id}:`, error);
          } else {
            console.log(data)
            console.log(`✅ Cobrança ${cobranca.id} sincronizada`);
          }
        } catch (error) {
          console.error(`❌ Erro no processamento da cobrança ${cobranca.id}:`, error);
        }
      }

      return { success: true, message: `Cobranças sincronizadas: ${data.data.length}, data: ${data}` };
    } catch (error) {
      console.error('💥 Erro na sincronização:', error);
      return { success: false, error: error.message };
    }
  }

  async getCustomerName(customer_id) {
    try {
      const response = await fetch(`${this.asaasBaseURL}/customers/${customer_id}`, {
        headers: { 'access_token': this.asaasApiKey }
      });

      if (!response.ok) {
        console.warn(`⚠️ Cliente ${customer_id} não encontrado`);
        return 'Cliente não encontrado';
      }

      const customer = await response.json();
      return customer.name || 'Nome não disponível';
    } catch (error) {
      console.error(`❌ Erro ao buscar cliente ${customer_id}:`, error);
      return 'Erro ao carregar nome';
    }
  }

  async getCobrancasParaAfiliado() {
    const { data, error } = await this.supabase
      .from('cobrancas')
      .select('*')
      .order('due_date', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  }
}

export const cobrancasService = new CobrancasService();