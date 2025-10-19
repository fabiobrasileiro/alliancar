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
        break;
      }

      default:
        console.log(`Evento não tratado: ${event}`);
    }

    console.log("event:", event);
    console.log("checkout:", checkout);

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
    email: customer.email,
    nome: customer.name,
    cpf_cnpj: customer.cpfCnpj,
    celular: customer.phoneNumber,
    endereco: customer.address,
    numero: customer.addressNumber,
    complemento: customer.complement,
    cep: customer.postalCode,
    estado: customer.province,
    cidade: customer.cityName,
    afiliado_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  };

  const { error } = await supabase.from("contatos").insert(data);

  if (error) {
    console.error("Erro ao inserir no Supabase:", error);
  } else {
    console.log("Contato inserido com sucesso:", data.email);
  }
}

