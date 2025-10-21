import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(request) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { event, checkout } = body;

    switch (event) {
      case "CHECKOUT_PAID": {
        await handlePaymentCreated(checkout, supabase);
        await handleCobrancas(checkout, supabase);
        break;
      }

      default:
        console.log(`Evento não tratado: ${event}`);
    }

    console.log("event:", event);
    console.log("checkout:", checkout);
    console.log("checkout:", checkout.customerData);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

async function handlePaymentCreated(checkout, supabase) {
  const customer = checkout.customerData;

  if (!customer) {
    console.log("⚠️ Nenhum customerData encontrado no checkout:", checkout.id);
    return;
  }

  const data = {
    id: customer.id,
    email: customer.email,
    nome: customer.name,
    cpf_cnpj: customer.cpfCnpj,
    telefone: customer.phoneNumber,
    endereco: customer.address,
    numero: customer.addressNumber,
    complemento: customer.complement,
    cep: customer.postalCode,
    estado: customer.province,
    cidade: customer.cityName,
    afiliado_id: checkout.externalReference
  };

  const { error } = await supabase.from("clientes").insert(data);

  if (error) {
    console.error("Erro ao inserir no Supabase:", error);
  } else {
    console.log("Contato inserido com sucesso:", data.email);
  }
}

async function handleCobrancas(checkout, supabase) {
  if (!checkout) {
    console.log("⚠️ Nenhum checkout encontrado");
    return;
  }

  const data = {
    id: checkout.id,
    link: checkout.link,
    status: checkout.status,
    external_reference: checkout.externalReference,
    billing_types: checkout.billingTypes,
    charge_types: checkout.chargeTypes,
    items: checkout.items,
    subscription_cycle: checkout.subscription?.cycle,
    subscription_next_due_date: checkout.subscription?.nextDueDate,
    subscription_end_date: checkout.subscription?.endDate,
    installment: checkout.installment,
    split: checkout.split,
    customer: checkout.customer,
    afiliado_id: checkout.externalReference,
    value: checkout.items?.[0]?.value
  };

  const { error } = await supabase.from("cobrancas").insert(data);

  if (error) {
    console.error("❌ Erro ao inserir cobrança no Supabase:", error);
  } else {
    console.log("✅ Cobrança inserida com sucesso:", checkout.id);
    console.log("💰 Status:", checkout.status);
    console.log("👤 Afiliado ID:", checkout.externalReference);
  }
}