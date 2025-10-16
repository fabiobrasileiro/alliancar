// app/api/checkout/route.js - VERSÃO FUNCIONAL
import { NextResponse } from "next/server";
import { simpleCheckout } from "@/lib/services/simpleCheckout";

export async function POST() {
  try {
    const result = await simpleCheckout.criarCheckout();

    return Response.json(result);

  } catch (error) {
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
