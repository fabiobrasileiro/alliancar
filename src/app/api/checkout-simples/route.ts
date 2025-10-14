// app/api/checkout/route.js - VERSÃO FUNCIONAL
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    const ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3";
    
    if (!ASAAS_API_KEY) {
      throw new Error("ASAAS_API_KEY não encontrada no .env");
    }

    const body = await request.json();
    console.log("📥 Dados do formulário:", body);

    // 🛡️ Validação
    if (!body.nome || !body.email || !body.telefone || !body.placa) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos obrigatórios: nome, email, telefone, placa",
        },
        { status: 400 }
      );
    }

    // 1. Criar ou buscar cliente existente
    let customerId;
    
    // Primeiro tenta buscar cliente por email
    console.log("🔍 Buscando cliente existente...");
    const searchResponse = await fetch(`${ASAAS_BASE_URL}/customers?email=${encodeURIComponent(body.email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
    });

    const searchResult = await searchResponse.json();
    
    if (searchResponse.ok && searchResult.data && searchResult.data.length > 0) {
      // Usa cliente existente
      customerId = searchResult.data[0].id;
      console.log("✅ Cliente existente encontrado:", customerId);
    } else {
      // Cria novo cliente
      console.log("👤 Criando novo cliente...");
      const customerData = {
        name: body.nome,
        email: body.email,
        phone: body.telefone.replace(/\D/g, ""),
        cpfCnpj: body.cpfCnpj?.replace(/\D/g, "") || "00000000000",
        postalCode: body.cep?.replace(/\D/g, "") || "00000000",
        address: body.endereco || "Endereço não informado",
        addressNumber: body.numero || "S/N",
        complement: body.complemento || "",
        province: body.estado || "SP",
        city: body.cidade || "São Paulo",
      };

      const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: ASAAS_API_KEY,
        },
        body: JSON.stringify(customerData),
      });

      const customerResult = await customerResponse.json();

      if (!customerResponse.ok) {
        console.error("❌ Erro ao criar cliente:", customerResult);
        return NextResponse.json(
          { success: false, error: customerResult.errors?.[0]?.description },
          { status: 400 }
        );
      }

      customerId = customerResult.id;
      console.log("✅ Novo cliente criado:", customerId);
    }

    // 2. Criar COBRANÇA (não checkout) - funciona sem domínio configurado
    console.log("💰 Criando cobrança...");
    const paymentData = {
      customer: customerId,
      billingType: "CREDIT_CARD", 
      value: parseFloat(body.valor) || 200.00,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias
      description: `Seguro Veicular - ${body.placa} - ${body.marca} ${body.modelo}`,
      externalReference: `seguro_${body.placa}_${Date.now()}`,
    };

    const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResult = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error("❌ Erro ao criar cobrança:", paymentResult);
      return NextResponse.json(
        { success: false, error: paymentResult.errors?.[0]?.description },
        { status: 400 }
      );
    }

    console.log("✅ Cobrança criada:", paymentResult.id);

    // 3. Gerar link para pagamento
    let paymentUrl;
    
    if (paymentResult.billingType === "CREDIT_CARD") {
      // Para cartão, usa o link da fatura
      paymentUrl = paymentResult.invoiceUrl || `https://sandbox.asaas.com/i/${paymentResult.id}`;
    } else if (paymentResult.billingType === "BOLETO") {
      // Para boleto
      paymentUrl = paymentResult.bankSlipUrl;
    } else if (paymentResult.billingType === "PIX") {
      // Para PIX
      paymentUrl = paymentResult.invoiceUrl;
    }

    console.log("🔗 URL de pagamento:", paymentUrl);

    return NextResponse.json({
      success: true,
      paymentUrl: paymentUrl,
      paymentId: paymentResult.id,
      customerId: customerId,
      billingType: paymentResult.billingType,
      status: paymentResult.status,
      message: `Cobrança criada com sucesso! Status: ${paymentResult.status}`
    });

  } catch (error: any) {
    console.error("❌ Erro no processamento:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}