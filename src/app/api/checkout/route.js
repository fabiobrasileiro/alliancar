import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();

        // Extrair dados do body incluindo serviços opcionais
        const {
            name,
            email,
            phone,
            cpfCnpj,
            mobilePhone,
            address,
            addressNumber,
            complement,
            province,
            postalCode,
            externalReference,
            description,
            finalValue,
            plano,
            selectedServices = [],
            servicesTotal = 0,
            discount = 0
        } = body;

        // 1️⃣ Cria o cliente
        const customerRes = await fetch(`${process.env.ASAAS_BASE_URL}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": process.env.ASAAS_API_KEY
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                cpfCnpj: cpfCnpj,
                address: address,
                addressNumber: addressNumber,
                complement: complement,
                province: province,
                postalCode: postalCode,
                externalReference: externalReference,
                notificationDisabled: false,
                additionalEmails: email,
                groupName: "insurance_customers",
                mobilePhone: mobilePhone || phone,
            }),
        });

        const customer = await customerRes.json();

        // 2️⃣ Cria o pagamento (com serviços opcionais)
        const today = new Date();
        const dueDate = new Date();

        dueDate.setDate(today.getDate() + 3); // Vencimento em 3 dias

        const formattedDueDate = dueDate.toISOString().split('T')[0];

        // Descrição detalhada incluindo serviços opcionais
        const paymentDescription = plano
            ? `Seguro Auto ${plano.category_name} - ${plano.vehicle_range}${selectedServices.length > 0 ? ` + ${selectedServices.length} serviço(s) opcional(is)` : ''}`
            : `Seguro Auto${selectedServices.length > 0 ? ` + ${selectedServices.length} serviço(s) opcional(is)` : ''}`;

        const paymentRes = await fetch(`${process.env.ASAAS_BASE_URL}/payments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": process.env.ASAAS_API_KEY
            },
            body: JSON.stringify({
                billingType: "CREDIT_CARD",
                customer: customer.id,
                value: finalValue, // Já inclui serviços opcionais e desconto
                dueDate: formattedDueDate,
                description: paymentDescription,
                daysAfterDueDateToRegistrationCancellation: 1,
                externalReference: externalReference,

            }),
        });
        const payment = await paymentRes.json();

        // 3️⃣ Cria a assinatura (apenas mensalidade do plano, sem serviços opcionais)
        const nextDueDate = new Date();
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);

        const formattedNextDueDate = nextDueDate.toISOString().split('T')[0];

        // Valor da assinatura é apenas a mensalidade do plano
        const subscriptionValue = plano?.monthly_payment || 200;

        const subscriptionRes = await fetch(`${process.env.ASAAS_BASE_URL}/subscriptions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": process.env.ASAAS_API_KEY
            },
            body: JSON.stringify({
                billingType: 'CREDIT_CARD',
                cycle: "MONTHLY",
                customer: customer.id,
                value: subscriptionValue,
                nextDueDate: formattedNextDueDate,
                description: `Mensalidade Seguro Auto - ${plano?.category_name || 'Plano'}`,
                externalReference: externalReference,
                split: [
                    {
                        "walletId": "8c114af3-ecc2-48ac-9529-33d654061948",
                        "percentualValue": 20
                    },
                    {
                        "walletId": "44b7be70-b6be-4f34-be9e-b4ad33a10f9d",
                        "percentualValue": 20
                    },
                ]
            }),
        });
        const subscription = await subscriptionRes.json();

        return NextResponse.json({
            success: true,
            customer,
            payment,
            subscription,
            checkoutUrl: payment.invoiceUrl || payment.bankSlipUrl,
            summary: {
                plano: plano?.category_name,
                adesao: plano?.adesao || 0,
                mensalidade: plano?.monthly_payment || 0,
                servicosOpcionais: servicesTotal,
                quantidadeServicos: selectedServices.length,
                desconto: discount,
                total: finalValue
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}