class AsaasService {
    constructor() {
        this.asaasApiKey = process.env.ASAAS_API_KEY;
        this.asaasURL = 'https://api-sandbox.asaas.com/v3';
    }

    async fazerRequisicao(endpoint, options = {}) {
        try {
            const url = `${this.asaasURL}${endpoint}`;
            console.log(`🌐 Fazendo requisição para: ${url}`);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'access_token': this.asaasApiKey,
                    ...options.headers,
                }
            });

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('❌ Resposta não é JSON:', text.substring(0, 200));
                throw new Error(`Resposta inválida: ${response.status} ${response.statusText}`);
            }

            console.log(`📨 Status: ${response.status}`);

            return { response, data };

        } catch (error) {
            console.error('💥 Erro na requisição:', error);
            throw error;
        }
    }

    async criarCustomer(dadosCustomer) {
        try {
            console.log('👤 Criando customer...');
            
            const { response, data } = await this.fazerRequisicao('/customers', {
                method: 'POST',
                body: JSON.stringify(dadosCustomer)
            });

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.description || `Erro ao criar customer: ${response.status}`);
            }

            console.log('✅ Customer criado:', data.id);
            return {
                success: true,
                customer: data
            };

        } catch (error) {
            console.error('💥 Erro ao criar customer:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async criarAssinatura(dadosAssinatura) {
        try {
            console.log('📅 Criando assinatura...');
            
            const { response, data } = await this.fazerRequisicao('/subscriptions', {
                method: 'POST',
                body: JSON.stringify(dadosAssinatura)
            });

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.description || `Erro ao criar assinatura: ${response.status}`);
            }

            console.log('✅ Assinatura criada:', data.id);
            return {
                success: true,
                subscription: data
            };

        } catch (error) {
            console.error('💥 Erro ao criar assinatura:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async criarCobrança(dadosCobranca) {
        try {
            console.log('💰 Criando cobrança...');
            
            const { response, data } = await this.fazerRequisicao('/payments', {
                method: 'POST',
                body: JSON.stringify(dadosCobranca)
            });

            if (!response.ok) {
                throw new Error(data.errors?.[0]?.description || `Erro ao criar cobrança: ${response.status}`);
            }

            console.log('✅ Cobrança criada:', data.id);
            return {
                success: true,
                payment: data
            };

        } catch (error) {
            console.error('💥 Erro ao criar cobrança:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async criarFluxoCompleto() {
        try {
            console.log('🚀 INICIANDO FLUXO COMPLETO ASAAS');
            
            const externalReference = "83a47952-1bfb-4f62-96c9-884e50efbc26";
            const valor = 200.00;

            // 1. CRIAR CUSTOMER
            const customerData = {
                name: "Teste Novo Pagador",
                email: "testenovopagado@asaas.com",
                phone: "49999009999",
                mobilePhone: "49999009999",
                cpfCnpj: "92593962046",
                postalCode: "89223005",
                address: "Avenida Rolf Wiest",
                addressNumber: "277",
                complement: "complemento",
                province: "test",
                externalReference: externalReference,
                notificationDisabled: false
            };

            const customerResult = await this.criarCustomer(customerData);
            if (!customerResult.success) {
                throw new Error(`Falha ao criar customer: ${customerResult.error}`);
            }

            const customerId = customerResult.customer.id;
            console.log('👤 Customer ID obtido:', customerId);

            // 2. CRIAR ASSINATURA
            const assinaturaData = {
                customer: customerId,
                billingType: "CREDIT_CARD",
                value: valor,
                nextDueDate: "2026-01-31",
                cycle: "MONTHLY",
                description: "Assinatura Mensal - Teste2",
                endDate: "2026-01-31",
                maxPayments: 12,
                externalReference: externalReference
            };

            const assinaturaResult = await this.criarAssinatura(assinaturaData);
            if (!assinaturaResult.success) {
                throw new Error(`Falha ao criar assinatura: ${assinaturaResult.error}`);
            }

            const subscriptionId = assinaturaResult.subscription.id;
            console.log('📅 Subscription ID obtido:', subscriptionId);

            // 3. CRIAR COBRANÇA (opcional - para primeira parcela)
            const cobrancaData = {
                customer: customerId,
                billingType: "CREDIT_CARD",
                value: valor,
                dueDate: "2025-22-10",
                description: "Cobrança inicial - Teste2",
                externalReference: externalReference
            };

            const cobrancaResult = await this.criarCobrança(cobrancaData);
            if (!cobrancaResult.success) {
                console.log('⚠️ Cobrança não criada, mas processo continua:', cobrancaResult.error);
            }

            console.log('🎉 FLUXO COMPLETADO COM SUCESSO!');
            
            return {
                success: true,
                customer: customerResult.customer,
                subscription: assinaturaResult.subscription,
                payment: cobrancaResult.payment,
                externalReference: externalReference
            };

        } catch (error) {
            console.error('💥 Erro no fluxo completo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Métodos auxiliares
    async buscarCustomerPorId(customerId) {
        try {
            const { response, data } = await this.fazerRequisicao(`/customers/${customerId}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar customer: ${response.status}`);
            }

            return { success: true, customer: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async buscarAssinaturaPorId(subscriptionId) {
        try {
            const { response, data } = await this.fazerRequisicao(`/subscriptions/${subscriptionId}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar assinatura: ${response.status}`);
            }

            return { success: true, subscription: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export const asaasService = new AsaasService();