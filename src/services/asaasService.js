import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config();

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_BASE_URL,
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json'
  }
});

asaasApi.interceptors.request.use((config) => {
  const apiKey = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmE4ZTY5NmU1LTE4MjAtNDMyNS1hZjJiLThjMDJmOWFiY2Y0MTo6JGFhY2hfMDU3ZDlmNDAtZTgyYy00M2Q1LWIxMzktNjQ0ZTRkYzc1MTQ4';

  if (!apiKey) {
    throw new Error('ASAAS_API_KEY não configurada');
  }

  console.log('🔐 Configurando requisição Asaas:', {
    baseURL: config.baseURL,
    url: config.url,
    apiKeyPrefix: apiKey.substring(0, 20) + '...'
  });

  // ✅ Use access_token conforme seu exemplo que funciona
  config.headers['access_token'] = apiKey;

  return config;
});

export const asaasService = {
  // Tokenizar cartão (como no seu exemplo)
  async tokenizeCreditCard(cardData) {
    try {
      console.log('💳 Tokenizando cartão...');
      const response = await asaasApi.post('/creditCard/tokenizeCreditCard', cardData);
      console.log('✅ Cartão tokenizado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao tokenizar cartão:', error.response?.data);
      throw new Error(`Erro ao tokenizar cartão: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  },

  // Criar pagamento com cartão tokenizado
  async createPaymentWithToken(paymentData) {
    try {
      console.log('💰 Criando pagamento...');
      const response = await asaasApi.post('/payments', paymentData);
      console.log('✅ Pagamento criado com sucesso!', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar pagamento:', error.response?.data);
      throw new Error(`Erro ao criar pagamento: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  },

  // Criar cliente
  async createCustomer(customerData) {
    try {
      const response = await asaasApi.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao criar cliente: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  }
};