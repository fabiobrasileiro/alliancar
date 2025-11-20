import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("📨 Webhook recebido:", body.event);
    console.log("📦 Payload:", body);

    const event = body.event;
    const payment = body.payment;
    const subscription = body.subscription;

    // CORREÇÃO: Pegar customerId de forma segura
    const customerId = subscription?.customer || payment?.customer;

    const afiliado_id =
      body.externalReference ||
      payment?.externalReference ||
      subscription?.externalReference;

    console.log("🔑 Afiliado ID:", afiliado_id);
    console.log("👤 Customer ID:", customerId);

    // Tratamento para todos os métodos de pagamento
    if (
      event === "PAYMENT_CONFIRMED" ||
      event === "PAYMENT_RECEIVED" ||
      event === "PAYMENT_OVERDUE"
    ) {
      await handlePayment(payment, afiliado_id);
      // CORREÇÃO: Só chamar handleCustomer se tiver customerId
      if (customerId) {
        await handleCustomer(customerId, afiliado_id);
      }
    } else if (
      event === "SUBSCRIPTION_CREATED" ||
      event === "SUBSCRIPTION_UPDATED" ||
      event === "SUBSCRIPTION_ACTIVATED"
    ) {
      await handleSubscription(subscription, afiliado_id);
      // CORREÇÃO: Só chamar handleCustomer se tiver customerId
      if (customerId) {
        await handleCustomer(customerId, afiliado_id);
      }
    } else if (event === "PAYMENT_CREATED") {
      // Pagamento criado (PIX/Boleto aguardando pagamento)
      await handlePayment(payment, afiliado_id);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

// CORREÇÃO: Adicionar afiliado_id como parâmetro
const handleCustomer = async (customerId: string, afiliado_id: string) => {
  try {
    // CORREÇÃO: Adicionar headers com API key
    const customerRes = await fetch(
      `${process.env.ASAAS_BASE_URL}/customers/${customerId}`,
      {
        headers: {
          "access_token": process.env.ASAAS_API_KEY!
        }
      }
    );

    if (!customerRes.ok) {
      throw new Error(`Erro ao buscar customer: ${customerRes.status}`);
    }

    const customerData = await customerRes.json();

    // CORREÇÃO: Mapeamento correto dos campos
    const data = {
      id: customerData.id,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      mobile_phone: customerData.mobilePhone,
      cpf_cnpj: customerData.cpfCnpj,
      address: customerData.address,
      address_number: customerData.addressNumber,
      complement: customerData.complement,
      province: customerData.province,
      postal_code: customerData.postalCode,
      city: customerData.city,
      city_name: customerData.cityName,
      country: customerData.country,
      external_reference: customerData.externalReference,
      notification_disabled: customerData.notificationDisabled,
      additional_emails: customerData.additionalEmails,
      observations: customerData.observations,
      municipal_inscription: customerData.municipalInscription,
      state_inscription: customerData.stateInscription,
      group_name: customerData.groupName || "customers", // CORREÇÃO: usar groupName da API
      deleted: customerData.deleted || false, // CORREÇÃO: usar deleted em vez de canDelete
      afiliado_id: afiliado_id, // CORREÇÃO: usar o afiliado_id do parâmetro
      updated_at: new Date().toISOString()
    };

    console.log("💾 Salvando customer:", customerData.id);

    const { error } = await supabase.from("customers").upsert(data);

    if (error) {
      console.error("❌ Erro ao salvar customer:", error);
    } else {
      console.log("✅ Customer salvo com sucesso:", customerData.id);
    }

  } catch (error) {
    console.error("❌ Erro em handleCustomer:", error);
  }
};

// Função para salvar pagamento com TODOS os campos (atualizada para PIX/Boleto)
async function handlePayment(payment: any, afiliado_id: string) {
  try {
    const paymentData = {
      // Identificação
      id: payment.id,
      customer: payment.customer,
      subscription: payment.subscription,

      // Dados do pagamento
      value: payment.value,
      net_value: payment.netValue,
      original_value: payment.originalValue,
      interest_value: payment.interestValue,
      billing_type: payment.billingType,
      due_date: payment.dueDate,
      original_due_date: payment.originalDueDate,

      // Descrição
      description: payment.description,
      external_reference: payment.externalReference,
      installment_number: payment.installmentNumber,

      // Status
      status: payment.status?.toLowerCase(),
      deleted: payment.deleted,
      anticipated: payment.anticipated,
      anticipable: payment.anticipable,

      // Datas importantes
      payment_date: payment.paymentDate,
      confirmed_date: payment.confirmedDate,
      client_payment_date: payment.clientPaymentDate,
      credit_date: payment.creditDate,
      estimated_credit_date: payment.estimatedCreditDate,

      // Informações da fatura
      invoice_url: payment.invoiceUrl,
      invoice_number: payment.invoiceNumber,
      transaction_receipt_url: payment.transactionReceiptUrl,

      // Informações do boleto
      nosso_numero: payment.nossoNumero,
      bank_slip_url: payment.bankSlipUrl,
      last_invoice_viewed_date: payment.lastInvoiceViewedDate,
      last_bank_slip_viewed_date: payment.lastBankSlipViewedDate,
      postal_service: payment.postalService,

      // Cartão de crédito
      credit_card_token: payment.creditCard?.creditCardToken,
      credit_card_number: payment.creditCard?.creditCardNumber,
      credit_card_holder_name: payment.creditCard?.creditCardHolderName,
      credit_card_expiry_month: payment.creditCard?.creditCardExpiryMonth,
      credit_card_holder_email: payment.creditCard?.creditCardHolderEmail,
      credit_card_expiry_year: payment.creditCard?.creditCardExpiryYear,
      credit_card_ccv: payment.creditCard?.creditCardCcv,
      credit_card_brand: payment.creditCard?.creditCardBrand,

      // PIX
      pix_qr_code: payment.pixQrCode,
      pix_payload: payment.pixPayload,
      pix_transaction: payment.pixTransaction,
      pix_expiration_date: payment.expirationDate,

      // Descontos e multas
      discount_value: payment.discount?.value,
      discount_limit_date: payment.discount?.limitDate,
      discount_due_date_limit_days: payment.discount?.dueDateLimitDays,
      discount_type: payment.discount?.type,

      fine_value: payment.fine?.value,
      fine_type: payment.fine?.type,

      interest_value_payment: payment.interest?.value,
      interest_type: payment.interest?.type,

      // Split de pagamento
      split: payment.split,
      escrow: payment.escrow,
      refunds: payment.refunds,

      // Checkout
      checkout_session: payment.checkoutSession,
      payment_link: payment.paymentLink,

      // Relacionamento
      afiliado_id: afiliado_id,

      // Timestamps
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("payments").upsert(paymentData);

    if (error) {
      console.error("❌ Erro ao salvar pagamento:", error);
    } else {
      console.log("✅ Pagamento salvo com TODOS os campos:", payment.id);
    }
  } catch (error) {
    console.error("❌ Erro em handlePayment:", error);
  }
}

// Função para salvar assinatura com TODOS os campos
async function handleSubscription(subscription: any, afiliado_id: string) {
  try {
    // Converter data do formato brasileiro para ISO
    const nextDueDate = subscription.nextDueDate?.includes("/")
      ? subscription.nextDueDate.split("/").reverse().join("-")
      : subscription.nextDueDate;

    const subscriptionData = {
      // Identificação
      id: subscription.id,
      customer: subscription.customer,

      // Dados da assinatura
      value: subscription.value,
      billing_type: subscription.billingType,
      next_due_date: nextDueDate,
      cycle: subscription.cycle,

      // Descrição
      description: subscription.description,
      external_reference: subscription.externalReference,

      // Status
      status: subscription.status?.toLowerCase(),
      deleted: subscription.deleted,

      // Datas
      end_date: subscription.endDate,
      max_payments: subscription.maxPayments,

      // Cartão de crédito
      credit_card_token: subscription.creditCard?.creditCardToken,
      credit_card_number: subscription.creditCard?.creditCardNumber,
      credit_card_holder_name: subscription.creditCard?.creditCardHolderName,
      credit_card_expiry_month: subscription.creditCard?.creditCardExpiryMonth,
      credit_card_expiry_year: subscription.creditCard?.creditCardExpiryYear,
      credit_card_ccv: subscription.creditCard?.creditCardCcv,
      credit_card_brand: subscription.creditCard?.creditCardBrand,

      // Checkout
      checkout_session: subscription.checkoutSession,
      payment_link: subscription.paymentLink,

      // Multas e juros
      fine_value: subscription.fine?.value,
      fine_type: subscription.fine?.type,

      interest_value: subscription.interest?.value,
      interest_type: subscription.interest?.type,

      // Split
      split: subscription.split,

      // Serviço postal
      send_payment_by_postal_service: subscription.sendPaymentByPostalService,

      // Relacionamento
      afiliado_id: afiliado_id,

      // Timestamps
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("subscriptions")
      .upsert(subscriptionData);

    if (error) {
      console.error("❌ Erro ao salvar assinatura:", error);
    } else {
      console.log("✅ Assinatura salva com TODOS os campos:", subscription.id);
    }
  } catch (error) {
    console.error("❌ Erro em handleSubscription:", error);
  }
}