import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { vistoriaService } from "@/lib/vistoria-service";

type AfiliadoRow = {
    id: string;
    referral_id?: string | null;
    porcentagem_comissao?: number | null;
    tipo?: string | null;
    [key: string]: any;
};

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const toPercent = (value?: number | null) => {
    if (!value || Number.isNaN(value)) return 0;
    return value * 100;
};

const getWalletId = (afiliado?: AfiliadoRow | null) => {
    if (!afiliado) return null;
    return (
        afiliado.wallet_id ||
        afiliado.walletId ||
        afiliado.asaas_wallet_id ||
        afiliado.asaasWalletId ||
        afiliado.carteira_id ||
        null
    );
};

const buildSplit = (walletId: string, percentualValue: number) => ({
    walletId,
    fixedValue: 0,
    percentualValue,
    totalFixedValue: 0
});

const addSplit = (
    splits: Array<ReturnType<typeof buildSplit>>,
    walletId: string | null,
    percentualValue: number
) => {
    if (!walletId || percentualValue <= 0) return;
    if (splits.some((split) => split.walletId === walletId)) return;
    splits.push(buildSplit(walletId, percentualValue));
};

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

        // ✅ VALIDAÇÃO: Verificar se o valor final é válido (maior que 0)
        const paymentValue = parseFloat(finalValue);
        if (!paymentValue || isNaN(paymentValue) || paymentValue <= 0) {
            console.error("❌ Valor inválido:", { finalValue, paymentValue });
            return NextResponse.json(
                { 
                    success: false, 
                    error: "O valor do pagamento deve ser maior que R$ 0,00. Por favor, selecione um plano de seguro ou adicione serviços opcionais.",
                    details: {
                        receivedValue: finalValue,
                        parsedValue: paymentValue,
                        hasPlano: !!plano,
                        servicesTotal: servicesTotal,
                        discount: discount
                    }
                },
                { status: 400 }
            );
        }

        // ✅ VALIDAÇÃO: Verificar se há um plano ou serviços selecionados
        if (!plano && (!selectedServices || selectedServices.length === 0)) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "É necessário selecionar um plano de seguro antes de finalizar o pagamento.",
                    details: {
                        hasPlano: !!plano,
                        selectedServicesCount: selectedServices?.length || 0
                    }
                },
                { status: 400 }
            );
        }

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
        
        // 🔍 LOG TEMPORÁRIO: Verificar API Key
        const apiKey = process.env.ASAAS_API_KEY;
        console.log("🔑 DEBUG API Key:", {
            exists: !!apiKey,
            length: apiKey?.length || 0,
            startsWith: apiKey?.substring(0, 10) || "N/A",
            endsWith: apiKey?.substring(apiKey?.length - 10) || "N/A",
            hasDollarSign: apiKey?.startsWith("$") || false,
            baseUrl: process.env.ASAAS_BASE_URL
        });

        const customerRes = await fetch(`${process.env.ASAAS_BASE_URL}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": apiKey!
            },
            body: JSON.stringify(customerPayload),
        });

        // 🔍 LOG TEMPORÁRIO: Verificar resposta antes do parse
        console.log("📡 DEBUG Resposta do Asaas:", {
            status: customerRes.status,
            statusText: customerRes.statusText,
            ok: customerRes.ok,
            headers: Object.fromEntries(customerRes.headers.entries())
        });

        const responseText = await customerRes.text();
        console.log("📄 DEBUG Body da resposta (primeiros 500 chars):", responseText.substring(0, 500));
        
        let customer;
        try {
            customer = JSON.parse(responseText);
        } catch (parseError) {
            console.error("❌ Erro ao fazer parse do JSON:", parseError);
            console.error("📄 Body completo:", responseText);
            throw new Error(`Erro ao fazer parse da resposta do Asaas: ${parseError}`);
        }

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

        // 5️⃣ Buscar afiliado e gerente para splits
        let afiliado: AfiliadoRow | null = null;
        let gerente: AfiliadoRow | null = null;

        if (externalReference) {
            const { data: afiliadoData, error: afiliadoError } = await supabase
                .from("afiliados")
                .select("*")
                .eq("id", externalReference)
                .single();

            if (afiliadoError) {
                console.warn("⚠️ Não foi possível carregar afiliado:", afiliadoError.message);
            } else {
                afiliado = afiliadoData as AfiliadoRow;
            }

            if (afiliado?.referral_id) {
                const { data: gerenteData, error: gerenteError } = await supabase
                    .from("afiliados")
                    .select("*")
                    .eq("id", afiliado.referral_id)
                    .single();

                if (gerenteError) {
                    console.warn("⚠️ Não foi possível carregar gerente:", gerenteError.message);
                } else {
                    gerente = gerenteData as AfiliadoRow;
                }
            }
        }

        const gerenteQualifica =
            !!gerente &&
            ((gerente.porcentagem_comissao ?? 0) >= 0.09 || gerente.tipo === "gerente");

        const afiliadoWalletId = getWalletId(afiliado);
        const gerenteWalletId = gerenteQualifica ? getWalletId(gerente) : null;
        const fernandoWalletId = process.env.ASAAS_WALLET_FERNANDO || null;
        const marcelWalletId = process.env.ASAAS_WALLET_MARCEL || null;
        const nivaldoWalletId = process.env.ASAAS_WALLET_NIVALDO || null;

        // 6️⃣ Split do pagamento (adesão): 100% para o afiliado
        const paymentSplits: Array<ReturnType<typeof buildSplit>> = [];
        addSplit(paymentSplits, afiliadoWalletId, 100);

        if (paymentSplits.length === 0) {
            console.warn("⚠️ Nenhum split configurado para adesão (walletId do afiliado ausente).");
        }

        const paymentSplitPercent = paymentSplits.reduce(
            (sum, split) => sum + split.percentualValue,
            0
        );

        console.log("💰 Configurando splits do pagamento:", {
            paymentSplitPercent,
            paymentSplits
        });

        // 6️⃣ Cria o pagamento baseado no método escolhido COM SPLITS
        // Garantir que o valor está formatado corretamente (2 casas decimais)
        const formattedValue = paymentValue.toFixed(2);
        
        let paymentPayload: any = {
            customer: customer.id,
            value: formattedValue,
            dueDate: formattedDueDate,
            description: paymentDescription,
            externalReference: externalReference
        };

        if (paymentSplits.length > 0) {
            paymentPayload.split = paymentSplits;
        }

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

        console.log("🔄 Criando pagamento com splits:", { 
            method: paymentMethod, 
            value: paymentPayload.value,
            splits: paymentPayload.split
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

        // 7️⃣ Para PIX: Buscar informações completas do PIX
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

        // 8️⃣ Cria a assinatura (apenas mensalidade do plano) - APENAS para cartão COM SPLITS
        let subscription = null;
        if (paymentMethod === 'CREDIT_CARD' && plano?.monthly_payment && plano.monthly_payment > 0) {
            const nextDueDate = new Date();
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            const formattedNextDueDate = nextDueDate.toISOString().split('T')[0];

            const subscriptionValue = plano.monthly_payment;

            // Configurar splits também para a assinatura (mensalidade)
            const commissionPoolPercent = 30;
            const fernandoPercent = 15;
            const afiliadoPercent = toPercent(afiliado?.porcentagem_comissao);
            const gerentePercent = gerenteQualifica ? toPercent(gerente?.porcentagem_comissao) : 0;

            const usedPercent = fernandoPercent + afiliadoPercent + gerentePercent;
            if (usedPercent > commissionPoolPercent) {
                console.warn("⚠️ Soma de percentuais acima do pool mensal:", {
                    commissionPoolPercent,
                    usedPercent,
                    fernandoPercent,
                    afiliadoPercent,
                    gerentePercent
                });
            }
            const remainingPercent = Math.max(0, commissionPoolPercent - usedPercent);
            const marcelPercent = remainingPercent / 2;
            const nivaldoPercent = remainingPercent / 2;

            const subscriptionSplits: Array<ReturnType<typeof buildSplit>> = [];
            addSplit(subscriptionSplits, fernandoWalletId, fernandoPercent);
            addSplit(subscriptionSplits, afiliadoWalletId, afiliadoPercent);
            addSplit(subscriptionSplits, gerenteWalletId, gerentePercent);
            addSplit(subscriptionSplits, marcelWalletId, marcelPercent);
            addSplit(subscriptionSplits, nivaldoWalletId, nivaldoPercent);

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

            if (subscriptionSplits.length > 0) {
                subscriptionPayload.split = subscriptionSplits;
            }

            console.log("🔄 Criando assinatura com splits:", {
                value: subscriptionValue,
                splits: subscriptionSplits,
                usedPercent,
                remainingPercent
            });

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
                console.log("✅ Assinatura criada com splits:", subscription.id);
            }
        }

        // 9️⃣ PREPARAR DADOS PARA VISTORIA
        console.log("📋 Preparando dados para vistoria...");
        
        const customerData = {
            name,
            email,
            telefone: whatsApp,
            cidade: province,
            endereco: {
                street,
                numero: addressNumber,
                complemento: complement,
                cidade: province,
                estado: "SP" // Você pode extrair do CEP se necessário
            }
        };

        const vehicleData = {
            placa: vehicleInfo?.placa || "",
            marca: vehicleInfo?.marca || "",
            modelo: vehicleInfo?.modelo || "",
            anoFabricacao: vehicleInfo?.anoFabricacao || "",
            anoModelo: vehicleInfo?.anoModelo || "",
            cor: vehicleInfo?.cor || "",
            chassi: vehicleInfo?.chassi || ""
        };

        // Criar dados da vistoria
        const vistoriaData = await vistoriaService.criarDadosVistoria(
            vehicleData.placa,
            customerData,
            vehicleData,
            { payment, subscription }
        );

        // Enviar para sistema de vistoria
        const vistoriaResponse = await vistoriaService.enviarParaVistoria(vistoriaData);

        // 🔟 Calcular valores dos splits para exibir no resumo
        // paymentValue já foi definido no início da função
        const splitValues = paymentSplits.map(split => ({
            walletId: split.walletId,
            percentual: split.percentualValue,
            valor: (paymentValue * split.percentualValue) / 100
        }));

        // 🔄 Prepara resposta baseada no método de pagamento
        let responseData: any = {
            success: true,
            customer: customer,
            payment: payment,
            subscription: subscription,
            vistoria: vistoriaResponse, // Inclui dados da vistoria na resposta
            splits: {
                afiliados: splitValues,
                totalPercentual: paymentSplitPercent,
                remainingPercentual: 100 - paymentSplitPercent,
                valorTotal: paymentValue
            },
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
                responseData.pixPayload = pixPayload || payment.id;
                responseData.pixExpirationDate = pixExpirationDate || payment.dueDate;
                responseData.invoiceUrl = payment.invoiceUrl;
                responseData.paymentId = payment.id;
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

        console.log("🎉 Checkout finalizado com vistoria:", {
            method: paymentMethod,
            vistoriaUrl: vistoriaResponse.vistoriaUrl,
            hasPixQrCode: !!responseData.pixQrCode
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