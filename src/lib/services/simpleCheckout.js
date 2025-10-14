// lib/services/simpleCheckout.js
class SimpleCheckout {
    constructor() {
        this.asaasApiKey = process.env.ASAAS_API_KEY;
        this.asaasURL = 'https://sandbox.asaas.com/api/v3/checkout';
    }

    async criarCheckout(dadosFormulario) {
        try {
            // 🎯 Preparar dados DINÂMICOS do formulário
            const dadosAsaas = {
                name: `Seguro Veicular - ${dadosFormulario.placa || 'Veículo'}`,
                description: `Proteção para ${dadosFormulario.marca || ''} ${dadosFormulario.modelo || ''}`,
                billingTypes: ['CREDIT_CARD'], 
                chargeTypes: ['RECURRENT'],

                // 🔄 URLs de callback dinâmicas
                callback: {
                    successUrl: 'https://example.com/asaas/checkout/success',
                    cancelUrl: 'https://example.com/asaas/checkout/cancel',
                    expiredUrl: 'https://example.com/asaas/checkout/expired'
                },

                // 🛒 Itens dinâmicos do formulário
                items: [
                    {
                        name: `Seguro - ${dadosFormulario.placa || 'Veículo'}`,
                        description: `Proteção veicular - ${dadosFormulario.marca} ${dadosFormulario.modelo}`,
                        value: 200.00,
                        quantity: 1
                    }
                ],

                // 👤 Dados do cliente DINÂMICOS
                customerData: {
                    name: dadosFormulario.nome || 'Cliente',
                    email: dadosFormulario.email || 'cliente@email.com',
                    cpfCnpj: (dadosFormulario.cpfCnpj || '').replace(/\D/g, ''),
                    phone: (dadosFormulario.telefone || '').replace(/\D/g, ''),
                    address: dadosFormulario.endereco || 'Endereço não informado',
                    addressNumber: dadosFormulario.numero || 'S/N',
                    complement: dadosFormulario.complemento || '',
                    province: dadosFormulario.estado || 'Estado não informado',
                    postalCode: (dadosFormulario.cep || '').replace(/\D/g, ''),
                    city: dadosFormulario.cidade || 'Cidade não informada'
                },

                // ⏰ Configurações
                externalReference: dadosFormulario.externalReference,
                minutesToExpire: 60 // 1 hora para expirar
            };

            console.log('📤 Enviando para Asaas:', dadosAsaas);

            const response = await fetch(this.asaasURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': this.asaasApiKey
                },
                body: JSON.stringify(dadosAsaas)
            });

            const resultado = await response.json();

            if (!response.ok) {
                console.error('❌ Erro Asaas:', resultado);
                throw new Error(resultado.errors?.[0]?.description || 'Erro no processamento do pagamento');
            }

            return {
                success: true,
                checkoutUrl: resultado.link,
                id: resultado.id,
                externalReference: resultado.externalReference,
                status: resultado.status
            };

        } catch (error) {
            console.error('💥 Erro no service:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export const simpleCheckout = new SimpleCheckout();