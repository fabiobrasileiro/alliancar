// app/api/asaas/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { asaasClient } from '@/lib/asaas';

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json();
    
    console.log('💰 Criando pagamento no Asaas:', paymentData);

    const response = await fetch(`${asaasClient.baseURL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasClient.apiKey!
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro do Asaas:', data);
      return NextResponse.json({ 
        error: data.errors?.[0]?.description || 'Erro ao criar pagamento',
        details: data 
      }, { status: response.status });
    }

    console.log('✅ Pagamento criado com sucesso:', data);
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao criar pagamento',
      details: error.message 
    }, { status: 500 });
  }
}