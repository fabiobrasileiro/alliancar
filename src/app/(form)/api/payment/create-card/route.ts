// src/app/api/payment/create-card/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Credenciais de teste da SuitPay
    const CI = 'testesandbox_1687443996536';
    const CS = '5b7d6ed3407bc8c7efd45ac9d4c277004145afb96752e1252c2082d3211fe901177e09493c0d4f57b650d2b2fc1b062d';

    console.log('📤 Enviando para SuitPay:', JSON.stringify(body, null, 2));

    // Fazer a requisição para a API da SuitPay
    const suitpayResponse = await fetch('https://sandbox.ws.suitpay.app/api/v3/gateway/card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ci': CI,
        'cs': CS
      },
      body: JSON.stringify(body)
    });

    // Verificar se a resposta é JSON
    const contentType = suitpayResponse.headers.get('content-type');
    
    let result;

    if (contentType?.includes('application/json')) {
      result = await suitpayResponse.json();
    } else {
      const text = await suitpayResponse.text();
      console.log('📥 Resposta não-JSON:', text);
      result = { message: text };
    }

    console.log('✅ Resposta da SuitPay:', JSON.stringify(result, null, 2));

    if (suitpayResponse.ok) {
      return NextResponse.json({
        success: true,
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || result.msg || 'Erro ao processar pagamento',
        details: result
      }, { status: suitpayResponse.status });
    }

  } catch (error: any) {
    console.error('❌ Erro no processamento:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}