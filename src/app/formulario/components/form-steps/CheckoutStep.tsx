// src/components/form-steps/CheckoutStep.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CheckoutStepProps {
  paymentUrl: string | null;
  qrCode: string | null;
  isSubmitting: boolean;
  formData: any;
}
interface CheckoutStepProps {
  isSubmitting: boolean;
  formData: any;
  onProcessPayment: (paymentData: any) => Promise<any>; // 👈 Nova prop obrigatória
}

export function CheckoutStep({ isSubmitting, formData, onProcessPayment }: CheckoutStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [cardData, setCardData] = useState({
    number: "2430 1695 1394 8900",
    expirationMonth: "01",
    expirationYear: "2050",
    cvv: "000",
    installment: "1",
    cardholderName: "Edward Alves Rabelo Neto",
    document: "029.245.541-01"
  });

  const [addressData, setAddressData] = useState({
    street: "Rua Paraíba",
    number: "01",
    complement: "",
    zipCode: "74663-520",
    neighborhood: "Goiânia 2",
    city: "Goiânia",
    state: "GO"
  });

  const [isTesting, setIsTesting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Novo estado para loading
  const [resultMessage, setResultMessage] = useState<string | null>(null); // Mensagem de resultado


  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setResultMessage(null);

    try {
      // Dados HARDCODE para teste (igual ao Postman)
      const requestData = {
        requestNumber: crypto.randomUUID(),
        card: {
          number: cardData.number.replace(/\s/g, ""),
          expirationMonth: cardData.expirationMonth,
          expirationYear: cardData.expirationYear,
          cvv: cardData.cvv,
          installment: parseInt(cardData.installment),
          amount: 1
        },
        client: {
          name: cardData.cardholderName,
          document: cardData.document.replace(/\D/g, ""),
          phoneNumber: formData.telefone_cliente?.replace(/\D/g, "") || "62999599619",
          email: formData.email_cliente || "teste@email.com",
          address: {
            codIbge: "5208707",
            street: addressData.street,
            number: addressData.number,
            complement: addressData.complement,
            zipCode: addressData.zipCode.replace(/\D/g, ""),
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state
          }
        },
        products: [
          {
            productName: "Aula Teste",
            idCheckout: "3978",
            quantity: 1,
            value: 1
          }
        ],
        callbackUrl: "http://localhost:3000/dashboard"
      };

      console.log("📤 Dados enviados para pagamento:", JSON.stringify(requestData, null, 2));

      // 👇 AGORA USA A FUNÇÃO DO PAI
      const result = await onProcessPayment(requestData);

      console.log("✅ Resposta do pagamento:", result);

      if (result.success) {
        setResultMessage("✅ Pagamento processado com sucesso! Verifique o console para detalhes.");
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
              <p className="text-sm">Dados hardcode do Postman sendo utilizados</p>
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
        <div className={`p-4 rounded-lg ${resultMessage.includes('✅')
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
        <>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Pagamento via PIX</h3>
            <p className="text-muted-foreground mb-4">
              Escaneie o QR Code ou clique no botão para pagar
            </p>
          </div>

          {/* {qrCode && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border">
                <img 
                  src={qrCode} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 mx-auto"
                />
                <p className="text-center text-sm mt-2">
                  Escaneie com seu app bancário
                </p>
              </div>
            </div>
          )}

          {paymentUrl && (
            <div className="text-center">
              <Button 
                onClick={handlePaymentRedirect}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                {isProcessing ? "Processando..." : "Pagar com PIX"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Você será redirecionado para finalizar o pagamento
              </p>
            </div>
          )} */}
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                <strong>💡 Dados de Teste Carregados:</strong> Todos os campos estão preenchidos
                com dados do Postman para facilitar o teste.
              </p>
            </div>

            <form  className="space-y-4">
              <h4 className="font-semibold text-lg mb-4">Dados do Cartão (Teste)</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    disabled={isTesting || isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    disabled={isTesting || isProcessing}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expYear">Ano</Label>
                  <Input
                    id="expYear"
                    value={cardData.expirationYear}
                    onChange={(e) => setCardData({ ...cardData, expirationYear: e.target.value })}
                    disabled={isTesting || isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installment">Parcelas</Label>
                  <Input
                    id="installment"
                    value={cardData.installment}
                    onChange={(e) => setCardData({ ...cardData, installment: e.target.value })}
                    disabled={isTesting || isProcessing}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">CPF do Titular</Label>
                <Input
                  id="document"
                  value={cardData.document}
                  onChange={(e) => setCardData({ ...cardData, document: e.target.value })}
                  disabled={isTesting || isProcessing}
                />
              </div>

              <h4 className="font-semibold text-lg mt-6 mb-4">Endereço de Cobrança (Teste)</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={addressData.zipCode}
                    onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                    disabled={isTesting || isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={addressData.street}
                    onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    disabled={isTesting || isProcessing}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={addressData.complement}
                    onChange={(e) => setAddressData({ ...addressData, complement: e.target.value })}
                    disabled={isTesting || isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={addressData.neighborhood}
                    onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })}
                    disabled={isTesting || isProcessing}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    disabled={isTesting || isProcessing}
                  />
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <h5 className="font-semibold mb-2">🔍 Dados que serão enviados:</h5>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify({
                    card: {
                      number: cardData.number.replace(/\s/g, ""),
                      expirationMonth: cardData.expirationMonth,
                      expirationYear: cardData.expirationYear,
                      cvv: cardData.cvv,
                      installment: parseInt(cardData.installment),
                      amount: 1
                    },
                    client: {
                      name: cardData.cardholderName,
                      document: cardData.document.replace(/\D/g, ""),
                      phoneNumber: formData.telefone_cliente?.replace(/\D/g, "") || "62999599619",
                      email: formData.email_cliente || "teste@email.com",
                      address: {
                        codIbge: "5208707",
                        street: addressData.street,
                        number: addressData.number,
                        complement: addressData.complement,
                        zipCode: addressData.zipCode.replace(/\D/g, ""),
                        neighborhood: addressData.neighborhood,
                        city: addressData.city,
                        state: addressData.state
                      }
                    }
                  }, null, 2)}
                </pre>
              </div>

              <Button
                type="button" // 👈 MUDE DE "submit" PARA "button"
                onClick={handleCardSubmit}
                className="w-full mt-6"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : isTesting ? (
                  "Testar Pagamento (Dados Hardcode)"
                ) : (
                  "Pagar com Cartão"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                💡 Todos os logs serão exibidos no console do navegador (F12)
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Modo Debug</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Abra o console (F12) para ver os dados enviados</li>
          <li>• Todos os campos estão preenchidos automaticamente</li>
          <li>• Clique no botão para testar a integração</li>
          <li>• Verifique a resposta da API no console</li>
        </ul>
      </div>
    </div>
  );
}