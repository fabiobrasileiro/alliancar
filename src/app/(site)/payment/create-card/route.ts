// src/app/api/payment/create-card/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Headers da requisição
    const ci = request.headers.get('ci');
    const cs = request.headers.get('cs');
    
    if (!ci || !cs) {
      return NextResponse.json(
        { success: false, error: 'Credenciais não fornecidas' },
        { status: 401 }
      );
    }

    // Fazer a requisição para a API da SuitPay
    const suitpayResponse = await fetch('https://api.suitpay.com.br/api/v1/gateway/card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ci': ci,
        'cs': cs
      },
      body: JSON.stringify(body)
    });

    const result = await suitpayResponse.json();

    if (suitpayResponse.ok) {
      return NextResponse.json({
        success: true,
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || 'Erro ao processar pagamento'
      }, { status: suitpayResponse.status });
    }

  } catch (error: any) {
    console.error('Erro no pagamento com cartão:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}