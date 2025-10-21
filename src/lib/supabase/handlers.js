// lib/supabase/handlers.js
async function handleCustomerCreated(customer, supabase) {
    const data = {
        id: customer.id,
        email: customer.email,
        nome: customer.name,
        cpf_cnpj: customer.cpfCnpj,
        telefone: customer.phone,
        endereco: customer.address,
        numero: customer.addressNumber,
        complemento: customer.complement,
        cep: customer.postalCode,
        estado: customer.province,
        afiliado_id: customer.externalReference
    };

    const { error } = await supabase.from("clientes").insert(data);
    if (error) console.error("Erro ao salvar customer:", error);
    else console.log("✅ Customer salvo no banco:", customer.id);
}

async function handleSubscriptionCreated(subscription, supabase) {
    const data = {
        id: subscription.id,
        status: subscription.status,
        external_reference: subscription.externalReference,
        value: subscription.value,
        billing_types: [subscription.billingType],
        charge_types: ["RECURRENT"],
        subscription_cycle: subscription.cycle,
        subscription_next_due_date: subscription.nextDueDate,
        subscription_end_date: subscription.endDate,
        customer: subscription.customer,
        afiliado_id: subscription.externalReference,
        description: subscription.description
    };

    const { error } = await supabase.from("cobrancas").insert(data);
    if (error) console.error("Erro ao salvar subscription:", error);
    else console.log("✅ Subscription salva no banco:", subscription.id);
}