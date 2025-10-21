import { NextResponse } from 'next/server';
import { cobrancasService } from '@/lib/services/cobrancasServices';

export async function POST() {
  try {
    console.log('📨 Recebida requisição POST para sincronizar cobranças');
    const result = await cobrancasService.sincronizarCobrancas();
    
    if (result.success) {
      console.log('✅ Sincronização concluída:', result.message);
      return NextResponse.json(result);
    } else {
      console.log('❌ Sincronização falhou:', result.error);
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('💥 Erro na API:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// GET para testar se está salvando
export async function GET() {
  try {
    const { data, error } = await cobrancasService.supabase
      .from('cobrancas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}