import { asaasClient } from "@/lib/asaas";
import { NextRequest, NextResponse } from "next/server";

// app/api/asaas/subscriptions/route.ts
export async function POST(request: NextRequest) {
  try {
    const subscriptionData = await request.json();

    const payload = {
      ...subscriptionData,
      split: [
        {
          walletId: process.env.ASAAS_MAIN_WALLET_ID,
          percentualValue: 70, // 70% para você
        },
        {
          walletId: subscriptionData.affiliateWalletId,
          percentualValue: 30, // 30% para afiliado
        }
      ]
    };

    const response = await fetch(`${asaasClient.baseURL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasClient.apiKey!
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar assinatura' }, { status: 500 });
  }
}