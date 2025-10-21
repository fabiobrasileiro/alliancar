// app/api/webhook/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log("📨 Webhook recebido:", JSON.stringify(body, null, 2));

    // Estrutura do webhook do Asaas é diferente do checkout
    const event = body.event;
    const payment = body.payment;
    const subscription = body.subscription;
    const customer = body.customer;

    console.log("🔔 Evento:", event);
    
    // Diferentes tipos de eventos têm estruturas diferentes
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CREATED') {
      console.log("💰 Payment data:", payment);
      console.log("👤 Customer do payment:", payment?.customer);
      // Aqui você pode processar o payment
    } 
    else if (event === 'SUBSCRIPTION_CREATED') {
      console.log("📅 Subscription data:", subscription);
      console.log("👤 Customer da subscription:", subscription?.customer);
      // Aqui você pode processar a subscription
    }
    else if (event === 'CUSTOMER_CREATED') {
      console.log("👤 Customer data:", customer);
      // Aqui você pode processar o customer
    }
    else {
      console.log("ℹ️ Outro tipo de evento:", event);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}