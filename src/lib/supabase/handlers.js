// lib/supabase/handlers.js
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
        observations: customer.observations,
        municipal_inscription: customer.municipalInscription,
        state_inscription: customer.stateInscription,
        additional_emails: customer.additionalEmails,
        deleted: customer.deleted,
        city: customer.city,
        city_name: customer.cityName,
        country: customer.country,
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
        max_payments: subscription.maxPayments,
        external_reference: subscription.externalReference,
        status: subscription.status,
        deleted: subscription.deleted,
        credit_card_token: subscription.creditCardToken,
        credit_card_number: subscription.creditCardNumber,
        credit_card_holder_name: subscription.creditCardHolderName,
        credit_card_expiry_month: subscription.creditCardExpiryMonth,
        credit_card_expiry_year: subscription.creditCardExpiryYear,
        credit_card_ccv: subscription.creditCardCcv,
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
        payment_date: payment.paymentDate,
        confirmed_date: payment.confirmedDate,
        client_payment_date: payment.clientPaymentDate,
        invoice_url: payment.invoiceUrl,
        invoice_number: payment.invoiceNumber,
        deleted: payment.deleted,
        anticipated: payment.anticipated,
        anticipable: payment.anticipable,
        credit_card_token: payment.creditCardToken,
        credit_card_number: payment.creditCardNumber,
        credit_card_holder_name: payment.creditCardHolderName,
        credit_card_expiry_month: payment.creditCardExpiryMonth,
        credit_card_expiry_year: payment.creditCardExpiryYear,
        credit_card_ccv: payment.creditCardCcv,
        split: payment.split,
        afiliado_id: afiliado_id
    };

    const { error } = await supabase.from("payments").insert(data);
    if (error) {
        console.error("❌ Erro ao salvar payment:", error);
        throw error;
    }
    console.log("✅ Payment salvo no banco:", payment.id);
}