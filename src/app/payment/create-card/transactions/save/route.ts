// src/app/api/transactions/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction, requestData, formData, timestamp } = body;

    // Criar cliente Supabase dinamicamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        transaction_id: transaction.transactionId,
        status: transaction.statusTransaction,
        response_message: transaction.msg,
        acquirer_message: transaction.acquirerMessage,
        card_token: transaction.cardToken,
        request_data: requestData,
        form_data: formData,
        created_at: timestamp
      }])
      .select();

    if (error) {
      console.error('Erro ao salvar transação:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    });

  } catch (error: any) {
    console.error('Erro ao salvar transação:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}