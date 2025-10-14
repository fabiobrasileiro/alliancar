import { NextResponse } from 'next/server';
import { customerService } from '../../../lib/services/costumerService';

export async function POST(request) {
  try {
    const customerData = await request.json();
    
    const result = await customerService.createCustomer(customerData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data: result.data },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}