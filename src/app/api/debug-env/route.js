import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    // Server-side variables
    ASAAS_API_KEY: process.env.ASAAS_API_KEY ? '*** configurada ***' : 'NÃO CONFIGURADA',
    ASAAS_BASE_URL: process.env.ASAAS_BASE_URL || 'NÃO CONFIGURADA',
    
    // Client-side variables
    NEXT_PUBLIC_ASAAS_API_KEY: process.env.NEXT_PUBLIC_ASAAS_API_KEY ? '*** configurada ***' : 'NÃO CONFIGURADA',
    NEXT_PUBLIC_ASAAS_BASE_URL: process.env.NEXT_PUBLIC_ASAAS_BASE_URL || 'NÃO CONFIGURADA',
    
    // Node environment
    NODE_ENV: process.env.NODE_ENV
  };

  return NextResponse.json(envVars);
}