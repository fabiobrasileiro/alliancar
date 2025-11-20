import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Extrair dados do body
        const {
            name,
            email,
            whatsApp,
            cpfCnpj,
            street,
            addressNumber,
            complement,
            province,
            postalCode,
            externalReference,
            description,
            finalValue,
            paymentMethod,
            plano,
            selectedServices = [],
            servicesTotal = 0,
            discount = 0,
            creditCard,
            vehicleInfo
        } = body;

        console.log("📦 Iniciando checkout:", { 
            paymentMethod, 
            finalValue,
            hasCreditCard: !!creditCard 
        });

        // 1️⃣ Cria o cliente PRIMEIRO
        const customerPayload = {
            name: name,
            email: email,
            phone: whatsApp,
            mobilePhone: whatsApp,
            cpfCnpj: cpfCnpj.replace(/\D/g, ''),
            address: street,
            addressNumber: addressNumber,
            complement: complement,
            province: province,
            postalCode: postalCode.replace(/\D/g, ''),
            externalReference: externalReference,
            notificationDisabled: false,
            additionalEmails: email,
            groupName: "insurance_customers"
        };

        console.log("👤 Criando cliente...");

        const customerRes = await fetch(`${process.env.ASAAS_BASE_URL}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": process.env.ASAAS_API_KEY!
            },
            body: JSON.stringify(customerPayload),
        });

        const customer = await customerRes.json();

        if (!customer.id || customer.errors) {
            console.error("❌ Erro ao criar cliente:", customer);
            throw new Error(`Erro ao criar cliente: ${JSON.stringify(customer)}`);
        }

        console.log("✅ Cliente criado:", customer.id);

        // 2️⃣ Para Cartão de Crédito: Tokenizar APÓS criar o cliente
        let creditCardToken = null;
        
        if (paymentMethod === 'CREDIT_CARD' && creditCard) {
            console.log("💳 Tokenizando cartão...");
            
            const creditCardHolderInfo = {
                name: name,
                email: email,
                cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                postalCode: postalCode.replace(/\D/g, ''),
                addressNumber: addressNumber,
                addressComplement: complement,
                phone: whatsApp,
                mobilePhone: whatsApp
            };

            const tokenPayload = {
                customer: customer.id,
                creditCard: {
                    holderName: creditCard.holderName,
                    number: creditCard.number.replace(/\s/g, ''),
                    expiryMonth: creditCard.expiryMonth.padStart(2, '0'),
                    expiryYear: creditCard.expiryYear,
                    ccv: creditCard.ccv
                },
                creditCardHolderInfo: creditCardHolderInfo
            };

            const tokenRes = await fetch(`${process.env.ASAAS_BASE_URL}/creditCard/tokenize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "access_token": process.env.ASAAS_API_KEY!
                },
                body: JSON.stringify(tokenPayload),
            });

            const tokenData = await tokenRes.json();
            console.log("🔑 Resposta tokenização:", tokenData);
            
            if (!tokenData.creditCardToken || tokenData.errors) {
                throw new Error(`Falha na tokenização do cartão: ${JSON.stringify(tokenData)}`);
            }

            creditCardToken = tokenData.creditCardToken;
            console.log("✅ Cartão tokenizado:", creditCardToken);
        }

        // 3️⃣ Configura datas - CORREÇÃO PARA PIX
        const today = new Date();
        let dueDate = new Date();
        
        if (paymentMethod === 'PIX') {
            // PIX: expira em 1 hora a partir de agora
            dueDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hora em milissegundos
        } else {
            dueDate.setDate(today.getDate() + 3); // Boleto/Cartão em 3 dias
        }
        
        const formattedDueDate = dueDate.toISOString().split('T')[0];

        // 4️⃣ Descrição detalhada
        const paymentDescription = plano
            ? `Seguro Auto ${plano.category_name} - ${plano.vehicle_range}${selectedServices.length > 0 ? ` + ${selectedServices.length} serviço(s) opcional(is)` : ''}`
            : `Seguro Auto${selectedServices.length > 0 ? ` + ${selectedServices.length} serviço(s) opcional(is)` : ''}`;

        // 5️⃣ Cria o pagamento baseado no método escolhido
        let paymentPayload: any = {
            customer: customer.id,
            value: parseFloat(finalValue).toFixed(2),
            dueDate: formattedDueDate,
            description: paymentDescription,
            externalReference: externalReference,
        };

        // Configura o payload baseado no método de pagamento
        switch (paymentMethod) {
            case 'PIX':
                paymentPayload.billingType = 'PIX';
                paymentPayload.expiresAfter = 60; // 60 minutos em minutos
                paymentPayload.expiresDate = dueDate.toISOString(); // Data de expiração
                break;

            case 'BOLETO':
                paymentPayload.billingType = 'BOLETO';
                paymentPayload.daysAfterDueDateToRegistrationCancellation = 1;
                break;

            case 'CREDIT_CARD':
                paymentPayload.billingType = 'CREDIT_CARD';
                paymentPayload.creditCardToken = creditCardToken;
                
                paymentPayload.creditCard = {
                    holderName: creditCard.holderName,
                    number: creditCard.number.replace(/\s/g, ''),
                    expiryMonth: creditCard.expiryMonth.padStart(2, '0'),
                    expiryYear: creditCard.expiryYear,
                    ccv: creditCard.ccv
                };
                
                paymentPayload.creditCardHolderInfo = {
                    name: name,
                    email: email,
                    cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                    postalCode: postalCode.replace(/\D/g, ''),
                    addressNumber: addressNumber,
                    addressComplement: complement,
                    phone: whatsApp,
                    mobilePhone: whatsApp
                };
                break;

            default:
                throw new Error(`Método de pagamento inválido: ${paymentMethod}`);
        }

        console.log("🔄 Criando pagamento:", { 
            method: paymentMethod, 
            value: paymentPayload.value,
            payload: paymentPayload
        });

        const paymentRes = await fetch(`${process.env.ASAAS_BASE_URL}/payments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": process.env.ASAAS_API_KEY!
            },
            body: JSON.stringify(paymentPayload),
        });

        const payment = await paymentRes.json();

        console.log("📨 Resposta do pagamento:", payment);

        if (payment.errors) {
            console.error("❌ Erro no pagamento:", payment);
            throw new Error(`Erro ao criar pagamento: ${JSON.stringify(payment)}`);
        }

        console.log("✅ Pagamento criado:", payment.id, payment.status);

        // 6️⃣ Para PIX: Buscar informações completas do PIX
        let pixQrCode = null;
        let pixPayload = null;
        let pixExpirationDate = null;

        if (paymentMethod === 'PIX' && payment.id) {
            console.log("🔍 Buscando informações do PIX...");
            
            // Aguardar um pouco para o PIX ser processado
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const pixInfoRes = await fetch(`${process.env.ASAAS_BASE_URL}/payments/${payment.id}/pixQrCode`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "access_token": process.env.ASAAS_API_KEY!
                },
            });

            const pixInfo = await pixInfoRes.json();
            console.log("📱 Informações do PIX:", pixInfo);

            if (pixInfo.encodedImage) {
                pixQrCode = pixInfo.encodedImage;
                pixPayload = pixInfo.payload;
                pixExpirationDate = pixInfo.expirationDate;
                console.log("✅ QR Code PIX obtido com sucesso");
            } else {
                console.warn("⚠️ QR Code PIX não disponível ainda:", pixInfo);
                
                // Tentar alternativa: usar a invoiceUrl que contém o PIX
                if (payment.invoiceUrl) {
                    console.log("📄 Usando invoiceUrl como fallback:", payment.invoiceUrl);
                }
            }
        }

        // 7️⃣ Cria a assinatura (apenas mensalidade do plano) - APENAS para cartão
        let subscription = null;
        if (paymentMethod === 'CREDIT_CARD' && plano?.monthly_payment && plano.monthly_payment > 0) {
            const nextDueDate = new Date();
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            const formattedNextDueDate = nextDueDate.toISOString().split('T')[0];

            const subscriptionValue = plano.monthly_payment;

            const subscriptionPayload: any = {
                billingType: 'CREDIT_CARD',
                cycle: "MONTHLY",
                customer: customer.id,
                value: subscriptionValue,
                nextDueDate: formattedNextDueDate,
                description: `Mensalidade Seguro Auto - ${plano.category_name}`,
                externalReference: externalReference,
                creditCardToken: creditCardToken
            };

            const subscriptionRes = await fetch(`${process.env.ASAAS_BASE_URL}/subscriptions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "access_token": process.env.ASAAS_API_KEY!
                },
                body: JSON.stringify(subscriptionPayload),
            });

            subscription = await subscriptionRes.json();

            if (subscription.errors) {
                console.warn("⚠️ Erro ao criar assinatura:", subscription);
                subscription = null;
            } else {
                console.log("✅ Assinatura criada:", subscription.id);
            }
        }

        // 8️⃣ Prepara resposta baseada no método de pagamento
        let responseData: any = {
            success: true,
            customer: customer,
            payment: payment,
            subscription: subscription,
            summary: {
                plano: plano?.category_name,
                adesao: plano?.adesao || 0,
                mensalidade: plano?.monthly_payment || 0,
                servicosOpcionais: servicesTotal,
                quantidadeServicos: selectedServices.length,
                desconto: discount,
                total: finalValue
            }
        };

        // Adiciona URLs específicas por método
        switch (paymentMethod) {
            case 'PIX':
                responseData.pixQrCode = pixQrCode;
                responseData.pixPayload = pixPayload || payment.id; // Fallback para ID do pagamento
                responseData.pixExpirationDate = pixExpirationDate || payment.dueDate;
                responseData.invoiceUrl = payment.invoiceUrl;
                responseData.paymentId = payment.id; // Para debug
                break;

            case 'BOLETO':
                responseData.bankSlipUrl = payment.bankSlipUrl;
                responseData.identificador = payment.identificador;
                responseData.dueDate = payment.dueDate;
                responseData.invoiceUrl = payment.invoiceUrl;
                break;

            case 'CREDIT_CARD':
                responseData.invoiceUrl = payment.invoiceUrl;
                responseData.status = payment.status;
                responseData.transactionReceiptUrl = payment.transactionReceiptUrl;
                break;
        }

        console.log("🎉 Checkout finalizado:", {
            method: paymentMethod,
            hasPixQrCode: !!responseData.pixQrCode,
            hasPixPayload: !!responseData.pixPayload,
            invoiceUrl: responseData.invoiceUrl
        });

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("❌ Erro no checkout:", error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                details: error.response?.data || error
            },
            { status: 500 }
        );
    }
}