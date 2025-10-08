// app/api/asaas/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { asaasClient } from '@/lib/asaas';

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();
    
    console.log('📝 Criando cliente no Asaas:', customerData);

    const response = await fetch(`${asaasClient.baseURL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasClient.apiKey!
      },
      body: JSON.stringify(customerData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro do Asaas:', data);
      return NextResponse.json({ 
        error: data.errors?.[0]?.description || 'Erro ao criar cliente',
        details: data 
      }, { status: response.status });
    }

    console.log('✅ Cliente criado com sucesso:', data);
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao criar cliente',
      details: error.message 
    }, { status: 500 });
  }
}