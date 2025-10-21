// lib/services/simpleCheckout.js
class SimpleCheckout {
    constructor() {
        this.asaasApiKey = process.env.ASAAS_API_KEY;
        this.asaasURL = 'https://api-sandbox.asaas.com/v3/checkouts';
        this.asaasCheckoutUrl = 'https://asaas.com/checkoutSession/show?id='
    }

    async criarCheckout() {
        try {
            const dadosAsaas = {
                "externalReference": "83a47952-1bfb-4f62-96c9-884e50efbc26",
                "billingTypes": [
                    "CREDIT_CARD",
                    // "PIX",
                ],
                "chargeTypes": [
                    "RECURRENT"
                ],
                "minutesToExpire": 100,
                "callback": {
                    "cancelUrl": "https://google.com/cancel",
                    "expiredUrl": "https://google.com/expired",
                    "successUrl": "https://google.com/success"
                },
                "items": [
                    {
                        "description": "Camiseta Branca",
                        // "imageBase64": "{{image1}}",
                        "name": "teste2",
                        "quantity": 1,
                        "value": 200.00
                    }
                ],
                "customerData": {
                    "address": "Avenida Rolf Wiest",
                    "addressNumber": "277",
                    "city": 13660,
                    "complement": "complemento",
                    "cpfCnpj": "92593962046",
                    "email": "testenovopagado@asaas.com",
                    "name": "Teste Novo Pagador",
                    "phone": "49999009999",
                    "postalCode": "89223005",
                    "province": "test",
                },
                "subscription": {
                    "cycle": 'MONTHLY',
                    "endDate": '2025-31-01',
                    "nextDueDate": '2025-31-01'
                }

            };

            console.log('📤 Enviando para Asaas:', dadosAsaas);

            const response = await fetch(this.asaasURL, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'access_token': this.asaasApiKey

                },
                body: JSON.stringify(dadosAsaas)
            });
            console.log('📨 Status da resposta:', response);
            console.log('📨 Headers:', Object.fromEntries(response.headers.entries()));

            const resultado = await response.json();

            console.log('======= RESPOSTA COMPLETA DO ASASS =======');
            console.log('Status:', response.status);
            console.log('Resposta JSON:', JSON.stringify(resultado, null, 2));
            console.log('==========================================');


            if (!response.ok) {
                console.error('❌ Erro Asaas:', resultado);
                throw new Error(resultado.errors?.[0]?.description || 'Erro no processamento do pagamento');
            }

            console.log('🔍 Campos disponíveis na resposta:', Object.keys(resultado));

            return {
                success: true,
                resultado: resultado
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