import { asaasService } from '@/services/asaasService';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('📦 Dados recebidos para pagamento:', body);

    // ✅ FLUXO CORRETO: Primeiro tokenizar o cartão
    const tokenizeData = {
      creditCard: {
        holderName: body.creditCard.holderName,
        number: body.creditCard.number.replace(/\s/g, ''),
        expiryMonth: body.creditCard.expiryMonth,
        expiryYear: body.creditCard.expiryYear,
        ccv: body.creditCard.ccv
      },
      creditCardHolderInfo: {
        name: body.creditCardHolderInfo.name,
        email: body.creditCardHolderInfo.email,
        cpfCnpj: body.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ''),
        postalCode: body.creditCardHolderInfo.postalCode.replace(/\D/g, ''),
        addressNumber: body.creditCardHolderInfo.addressNumber,
        addressComplement: body.creditCardHolderInfo.addressComplement || '',
        phone: body.creditCardHolderInfo.phone.replace(/\D/g, '')
      },
      customer: body.customer, // ID do cliente no Asaas
      remoteIp: body.remoteIp || '127.0.0.1'
    };

    console.log('🔐 Tokenizando cartão...');
    const tokenResult = await asaasService.tokenizeCreditCard(tokenizeData);
    
    if (!tokenResult.creditCardToken) {
      throw new Error('Falha ao tokenizar cartão');
    }

    console.log('✅ Cartão tokenizado:', tokenResult.creditCardToken);

    // ✅ Agora criar o pagamento com o token
    const paymentData = {
      customer: body.customer,
      billingType: 'CREDIT_CARD',
      value: body.value,
      description: body.description || 'Pagamento via checkout',
      dueDate: body.dueDate || new Date().toISOString().split('T')[0],
      creditCardToken: tokenResult.creditCardToken
    };

    console.log('💰 Criando pagamento com token...');
    const payment = await asaasService.createPaymentWithToken(paymentData);
    
    console.log('✅ Pagamento criado com sucesso:', payment.id);
    
    return NextResponse.json({
      success: true,
      payment: payment,
      token: tokenResult.creditCardToken
    });
    
  } catch (error) {
    console.error('💥 Erro ao processar pagamento:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}