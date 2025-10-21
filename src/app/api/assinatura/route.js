// app/api/assinatura/route.js
import { NextResponse } from "next/server";
import { asaasService } from "../../../lib/services/asaasService"

export async function POST() {
  try {
    console.log('📥 Recebendo requisição para criar assinatura...');
    
    const result = await asaasService.criarFluxoCompleto();

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 400 }
      );
    }

    // Aqui você pode chamar suas funções handle para salvar no seu banco
    // await handleCustomerCreated(result.customer, supabase);
    // await handleSubscriptionCreated(result.subscription, supabase);
    // await handlePaymentCreated(result.payment, supabase);

    return NextResponse.json({
      success: true,
      message: "Fluxo completo executado com sucesso",
      data: {
        customerId: result.customer.id,
        subscriptionId: result.subscription.id,
        externalReference: result.externalReference,
        customer: result.customer,
        subscription: result.subscription,
        payment: result.payment
      }
    });

  } catch (error) {
    console.error("❌ Erro no endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}