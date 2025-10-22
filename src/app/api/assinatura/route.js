// app/api/assinatura/route.js
import { NextResponse } from "next/server";
import { asaasService } from "@/lib/services/asaasService";
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Funções handlers inline (ou importe de um arquivo separado)
async function handleCustomerCreated(customer, supabase, afiliado_id) {
    const data = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        mobile_phone: customer.mobilePhone,
        cpf_cnpj: customer.cpfCnpj,
        postal_code: customer.postalCode,
        address: customer.address,
        address_number: customer.addressNumber,
        complement: customer.complement,
        province: customer.province,
        external_reference: customer.externalReference,
        notification_disabled: customer.notificationDisabled,
        deleted: customer.deleted || false,
        afiliado_id: afiliado_id
    };

    const { error } = await supabase.from("customers").insert(data);
    if (error) {
        console.error("❌ Erro ao salvar customer:", error);
        throw error;
    }
    console.log("✅ Customer salvo no banco:", customer.id);
}

async function handleSubscriptionCreated(subscription, supabase, afiliado_id) {
    const data = {
        id: subscription.id,
        customer: subscription.customer,
        billing_type: subscription.billingType,
        value: subscription.value,
        next_due_date: subscription.nextDueDate,
        cycle: subscription.cycle,
        description: subscription.description,
        end_date: subscription.endDate,
        external_reference: subscription.externalReference,
        status: subscription.status,
        deleted: subscription.deleted || false,
        afiliado_id: afiliado_id
    };

    const { error } = await supabase.from("subscriptions").insert(data);
    if (error) {
        console.error("❌ Erro ao salvar subscription:", error);
        throw error;
    }
    console.log("✅ Subscription salva no banco:", subscription.id);
}

async function handlePaymentCreated(payment, supabase, afiliado_id) {
    if (!payment) {
        console.log("⚠️ Nenhum payment para salvar");
        return;
    }

    const data = {
        id: payment.id,
        customer: payment.customer,
        subscription: payment.subscription,
        billing_type: payment.billingType,
        value: payment.value,
        due_date: payment.dueDate,
        description: payment.description,
        external_reference: payment.externalReference,
        status: payment.status,
        deleted: payment.deleted || false,
        afiliado_id: afiliado_id
    };

    const { error } = await supabase.from("payments").insert(data);
    if (error) {
        console.error("❌ Erro ao salvar payment:", error);
        throw error;
    }
    console.log("✅ Payment salvo no banco:", payment.id);
}

export async function POST() {
  try {
    console.log('📥 Recebendo requisição para criar assinatura...');
    
    const result = await asaasService.criarFluxoCompleto();

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    // Salvar tudo no Supabase
    const afiliado_id = result.externalReference;
    
    await handleCustomerCreated(result.customer, supabase, afiliado_id);
    await handleSubscriptionCreated(result.subscription, supabase, afiliado_id);
    await handlePaymentCreated(result.payment, supabase, afiliado_id);

    return NextResponse.json({
      success: true,
      message: "Fluxo completo executado e salvo no banco",
      data: {
        customerId: result.customer.id,
        subscriptionId: result.subscription.id,
        paymentId: result.payment?.id,
        afiliado_id: afiliado_id
      }
    });

  } catch (error) {
    console.error("❌ Erro no endpoint:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}