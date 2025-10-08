// src/components/form-steps/CheckoutStep.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CheckoutStepProps {
  isSubmitting: boolean;
  formData: any;
  onProcessPayment: (paymentData: any) => Promise<any>;
}

export function CheckoutStep({ isSubmitting, formData, onProcessPayment }: CheckoutStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("card");
  const [cardData, setCardData] = useState({
    number: "5162306219378829", // Cartão de teste Asaas
    expirationMonth: "09",
    expirationYear: "2026",
    cvv: "123",
    installment: "1",
    cardholderName: "John Doe",
    document: "86229406594"
  });

  const [addressData, setAddressData] = useState({
    street: "Rua Paraíba",
    number: "123",
    complement: "",
    zipCode: "41350190",
    neighborhood: "Centro",
    city: "Goiânia",
    state: "GO"
  });

  const [isTesting, setIsTesting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setResultMessage(null);

    try {
      // Dados formatados para o Asaas
      const requestData = {
        customer: "cus_000007068844", // ID do cliente no Asaas (hardcode para teste)
        value: 100.00, // Valor fixo para teste
        description: "Aula Teste - Pagamento via Checkout",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias à frente
        
        // Dados do cartão para tokenização
        creditCard: {
          holderName: cardData.cardholderName,
          number: cardData.number.replace(/\s/g, ""),
          expiryMonth: cardData.expirationMonth,
          expiryYear: cardData.expirationYear,
          ccv: cardData.cvv
        },
        
        // Dados do titular do cartão
        creditCardHolderInfo: {
          name: cardData.cardholderName,
          email: formData.email_cliente || "john.doe@example.com",
          cpfCnpj: cardData.document.replace(/\D/g, ""),
          postalCode: addressData.zipCode.replace(/\D/g, ""),
          addressNumber: addressData.number,
          addressComplement: addressData.complement,
          phone: formData.telefone_cliente?.replace(/\D/g, "") || "7134321432"
        },
        
        remoteIp: "127.0.0.1"
      };

      console.log("📤 Dados enviados para Asaas:", JSON.stringify(requestData, null, 2));

      // 👇 USA A FUNÇÃO DO PAI para processar no Asaas
      const result = await onProcessPayment(requestData);

      console.log("✅ Resposta do Asaas:", result);

      if (result.success) {
        setResultMessage(`✅ Pagamento criado com sucesso! ID: ${result.payment.id} | Status: ${result.payment.status}`);
        
        // Redirecionar ou mostrar sucesso
        if (result.payment.status === 'CONFIRMED') {
          setResultMessage("🎉 Pagamento aprovado! Redirecionando...");
          // setTimeout(() => {
          //   window.location.href = "/success";
          // }, 2000);
        }
      } else {
        setResultMessage(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Erro no pagamento:", error);
      setResultMessage("❌ Erro ao processar pagamento. Verifique o console para detalhes.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Processando seu pagamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Modo Teste */}
      {isTesting && (
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-700">
              <strong>🔧 MODO TESTE ATIVADO</strong>
              <p className="text-sm">Dados de teste do Asaas sendo utilizados</p>
              <p className="text-xs mt-1">
                Cartão: 5162 3062 1937 8829 | CVV: 123 | Validade: 09/2026
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setIsTesting(false)}
            >
              Desativar Teste
            </Button>
          </div>
        </div>
      )}

      {/* Mensagem de Resultado */}
      {resultMessage && (
        <div className={`p-4 rounded-lg ${
          resultMessage.includes('✅') || resultMessage.includes('🎉')
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {resultMessage}
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">Finalizar Pagamento</h3>

        <div className="flex justify-center gap-4 mb-6">
          <Button
            type="button"
            variant={paymentMethod === "pix" ? "default" : "outline"}
            onClick={() => setPaymentMethod("pix")}
          >
            PIX
          </Button>
          <Button
            type="button"
            variant={paymentMethod === "card" ? "default" : "outline"}
            onClick={() => setPaymentMethod("card")}
          >
            Cartão de Crédito
          </Button>
        </div>
      </div>

      {paymentMethod === "pix" ? (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Pagamento via PIX</h3>
          <p className="text-muted-foreground mb-4">
            Em breve disponível
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                <strong>💡 Dados de Teste Asaas:</strong> Todos os campos estão preenchidos
                com dados válidos para teste na sandbox do Asaas.
              </p>
            </div>

            <form className="space-y-4">
              <h4 className="font-semibold text-lg mb-4">Dados do Cartão (Teste Asaas)</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="5162 3062 1937 8829"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expMonth">Mês</Label>
                  <Input
                    id="expMonth"
                    value={cardData.expirationMonth}
                    onChange={(e) => setCardData({ ...cardData, expirationMonth: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="09"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expYear">Ano</Label>
                  <Input
                    id="expYear"
                    value={cardData.expirationYear}
                    onChange={(e) => setCardData({ ...cardData, expirationYear: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="2026"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installment">Parcelas</Label>
                  <Input
                    id="installment"
                    value={cardData.installment}
                    onChange={(e) => setCardData({ ...cardData, installment: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Nome no Cartão</Label>
                <Input
                  id="cardholderName"
                  value={cardData.cardholderName}
                  onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                  disabled={isTesting || isProcessing}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">CPF do Titular</Label>
                <Input
                  id="document"
                  value={cardData.document}
                  onChange={(e) => setCardData({ ...cardData, document: e.target.value })}
                  disabled={isTesting || isProcessing}
                  placeholder="862.294.065-94"
                />
              </div>

              <h4 className="font-semibold text-lg mt-6 mb-4">Endereço de Cobrança</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={addressData.zipCode}
                    onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="41350-190"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={addressData.street}
                    onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="Rua Paraíba"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={addressData.number}
                    onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={addressData.complement}
                    onChange={(e) => setAddressData({ ...addressData, complement: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="Apto 101"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={addressData.neighborhood}
                    onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="Centro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="Goiânia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    disabled={isTesting || isProcessing}
                    placeholder="GO"
                  />
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <h5 className="font-semibold mb-2">🔍 Dados que serão enviados para o Asaas:</h5>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify({
                    customer: "cus_000007068844",
                    value: 100.00,
                    description: "Aula Teste - Pagamento via Checkout",
                    creditCard: {
                      holderName: cardData.cardholderName,
                      number: cardData.number.replace(/\s/g, ""),
                      expiryMonth: cardData.expirationMonth,
                      expiryYear: cardData.expirationYear,
                      ccv: cardData.cvv
                    },
                    creditCardHolderInfo: {
                      name: cardData.cardholderName,
                      email: formData.email_cliente || "john.doe@example.com",
                      cpfCnpj: cardData.document.replace(/\D/g, ""),
                      postalCode: addressData.zipCode.replace(/\D/g, ""),
                      addressNumber: addressData.number,
                      addressComplement: addressData.complement,
                      phone: formData.telefone_cliente?.replace(/\D/g, "") || "7134321432"
                    }
                  }, null, 2)}
                </pre>
              </div>

              <Button
                type="button"
                onClick={handleCardSubmit}
                className="w-full mt-6"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando no Asaas...
                  </>
                ) : isTesting ? (
                  "Testar Pagamento Asaas"
                ) : (
                  "Pagar com Cartão"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                💡 Integração com Asaas - Todos os logs serão exibidos no console (F12)
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Modo Debug - Asaas</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Cartão de teste: 5162 3062 1937 8829</li>
          <li>• CVV: 123 | Validade: 09/2026</li>
          <li>• CPF: 862.294.065-94</li>
          <li>• Abra o console (F12) para ver os dados enviados</li>
          <li>• Verifique a resposta da API do Asaas no console</li>
        </ul>
      </div>
    </div>
  );
}