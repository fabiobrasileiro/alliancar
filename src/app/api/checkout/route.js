import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        // const body = {
        //     "name": "John Doe",
        //     "cpfCnpj": "24971563792",
        //     "email": "john.doe@asaas.com.br",
        //     "phone": "4738010919",
        //     "mobilePhone": "4799376637",
        //     "address": "Av. Paulista",
        //     "addressNumber": "150",
        //     "complement": "Sala 201",
        //     "province": "Centro",
        //     "postalCode": "01310-000",
        //     "externalReference": "12987382",
        //     "notificationDisabled": false,
        //     "additionalEmails": "john.doe@asaas.com,john.doe.silva@asaas.com.br",
        //     "groupName": "customers",
        //     "externalReference": "83a47952-1bfb-4f62-96c9-884e50efbc26",


        //     // Payments
        //     "billingType": "CREDIT_CARD",
        //     "customer": "cus_000007143938",
        //     "value": 150,
        //     "dueDate": "2026-11-01",
        //     "description": "Pedido 056984",
        //     "daysAfterDueDateToRegistrationCancellation": 1,
        //     "externalReference": "83a47952-1bfb-4f62-96c9-884e50efbc26",

        //     // Subscription
        //     "billingType": "CREDIT_CARD",
        //     "cycle": "MONTHLY",
        //     "customer": "cus_000007143938",
        //     "value": 200,
        //     "nextDueDate": "2026-10-23",
        //     "description": "Assinatura Plano Pró",
        //     "externalReference": "83a47952-1bfb-4f62-96c9-884e50efbc26"
        // };

        // 1️⃣ Cria o cliente
        
        const body = await request.json();

        const customerRes = await fetch(`${process.env.ASAAS_BASE_URL}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": process.env.ASAAS_API_KEY
            },

            body: JSON.stringify({
                name: body.name,
                email: body.email,
                phone: body.phone,
                cpfCnpj: body.cpfCnpj,
                address: body.address,
                addressNumber: body.addressNumber,
                complement: body.complement,
                province: body.province,
                postalCode: body.postalCode,
                externalReference: body.externalReference,
                notificationDisabled: body.notificationDisabled,
                additionalEmails: body.additionalEmails,
                groupName: body.groupName,
                mobilePhone: body.mobilePhone,
            }),
        });
        const customer = await customerRes.json();

        //2️⃣ Cria o pagamento
        const paymentRes = await fetch(`${process.env.ASAAS_BASE_URL}/payments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": process.env.ASAAS_API_KEY
            },

            body: JSON.stringify({
                billingType: "CREDIT_CARD",
                customer: customer.id,
                value: 150,
                dueDate: "2026-11-01",
                description: body.description,
                daysAfterDueDateToRegistrationCancellation: 1,
                externalReference: body.externalReference,       
                   
            }),
        });
        const payment = await paymentRes.json();

        // 3️⃣ Cria a assinatura
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
                value: 200,
                nextDueDate: "2026-10-23",
                description: body.description,
                externalReference: body.externalReference
            }),
        });
        const subscription = await subscriptionRes.json();

        // ✅ Retorna tudo junto
        return NextResponse.json({
            success: true,
            customer,
            payment,
            subscription,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
