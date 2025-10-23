import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

// Converte DD/MM/YYYY para YYYY-MM-DD
function formatDateToISO(dateStr: string) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

// Inserir ou atualizar pagamento
async function upsertPayment(payment: any, status: string, supabase: any) {
  const {
    id,
    customer,
    subscription,
    billingType,
    value,
    dueDate,
    description,
    externalReference,
    creditCard,
    afiliadoId,
  } = payment;

  const { error, data } = await supabase
    .from("payments")
    .upsert({
      id,
      customer,
      subscription: subscription || null,
      billing_type: billingType,
      value,
      due_date: formatDateToISO(dueDate),
      description,
      external_reference: externalReference,
      status,
      credit_card_number: creditCard?.number || null,
      credit_card_holder_name: creditCard?.holderName || null,
      credit_card_expiry_month: creditCard?.expiryMonth || null,
      credit_card_expiry_year: creditCard?.expiryYear || null,
      credit_card_ccv: creditCard?.ccv || null,
      afiliado_id: afiliadoId,
      updated_at: new Date(),
    })
    .select();

  if (error) console.error("Erro ao upsert payment:", error);
  else console.log(`Pagamento ${status} inserido/atualizado:`, data?.[0]?.id);
}

// Criar ou atualizar subscription
async function upsertSubscription(subscription: any, supabase: any) {
  const {
    id,
    customer,
    billingType,
    cycle,
    value,
    nextDueDate,
    description,
    externalReference,
    afiliadoId,
  } = subscription;

  const { error, data } = await supabase
    .from("subscriptions")
    .upsert({
      id,
      customer,
      billing_type: billingType,
      cycle,
      value,
      next_due_date: formatDateToISO(nextDueDate),
      description,
      external_reference: externalReference,
      afiliado_id: afiliadoId,
      updated_at: new Date(),
    })
    .select();

  if (error) console.error("Erro ao upsert subscription:", error);
  else console.log("Subscription inserida/atualizada:", data?.[0]?.id);
}

export async function POST(request: NextRequest) {
  const supabase = createClient(); // Service Role Key recomendado aqui

  try {
    const body = await request.json();
    const { event, payment, subscription } = body;

    switch (event) {
      case "PAYMENT_CONFIRMED":
        await upsertPayment(payment, "CONFIRMED", supabase);
        break;

      case "PAYMENT_RECEIVED":
        await upsertPayment(payment, "RECEIVED", supabase);
        break;

      case "SUBSCRIPTION_CREATED":
        await upsertSubscription(subscription, supabase);
        break;

      default:
        console.log(`Evento não tratado: ${event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { received: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
