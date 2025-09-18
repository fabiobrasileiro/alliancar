// src/app/checkout-test/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function CheckoutTestPage() {
    const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [transactionData, setTransactionData] = useState<any>(null);

    // Dados HARDCODE para teste
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

    const handleCardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsProcessing(true);
        setResultMessage(null);
        setTransactionData(null);

        // Dados HARDCODE para teste - mesmo do Postman
        const requestData = {
            requestNumber: crypto.randomUUID(),
            card: {
                number: "2430169513948900",
                expirationMonth: "01",
                expirationYear: "2050",
                cvv: "000",
                installment: 1,
                amount: 100
            },
            client: {
                name: "Edward Alves Rabelo Neto",
                document: "02924554101",
                phoneNumber: "62999599619",
                email: "edwardneto@suitpay.app",
                address: {
                    codIbge: "5208707",
                    street: "Rua Paraíba",
                    number: "01",
                    complement: "",
                    zipCode: "74663520",
                    neighborhood: "Goiânia 2",
                    city: "Goiânia",
                    state: "GO"
                }
            },
            products: [
                {
                    productName: "Rastreador Veicular Premium",
                    idCheckout: "3978",
                    quantity: 1,
                    value: 100
                }
            ],
            callbackUrl: `${window.location.origin}/api/webhook/suitpay`
        };

        console.log("📤 Dados enviados para a API:", JSON.stringify(requestData, null, 2));

        try {
            const response = await fetch("https://sandbox.ws.suitpay.app/api/v3/gateway/card", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'ci': 'testesandbox_1687443996536',
                    'cs': '5b7d6ed3407bc8c7efd45ac9d4c277004145afb96752e1252c2082d3211fe901177e09493c0d4f57b650d2b2fc1b062d',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            console.log("✅ Resposta da API:", result);

            if (result.success) {
                setTransactionData(result.data);
                setResultMessage("✅ Pagamento aprovado! Transação processada com sucesso.");
            } else {
                setResultMessage(`❌ Erro: ${result.error || result.data?.msg || "Erro no processamento"}`);
            }
        } catch (error: any) {
            console.error("❌ Erro no pagamento:", error);
            setResultMessage(`❌ Erro de conexão: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout de Teste</h1>
                    <p className="text-gray-600">Página independente para testar integração com SuitPay</p>
                </div>

                {/* Método de Pagamento */}
                <Card className="mb-6">
                    <CardContent className="p-6">
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

                        {paymentMethod === "card" && (
                            <form onSubmit={handleCardSubmit} className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-700">
                                        <strong>💡 Dados de Teste Pré-carregados</strong> - Todos os campos estão preenchidos
                                        com dados de teste válidos para a SuitPay.
                                    </p>
                                </div>

                                <h3 className="text-lg font-semibold mb-4">Dados do Cartão</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Número do Cartão</Label>
                                        <Input
                                            value={cardData.number}
                                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>CVV</Label>
                                        <Input
                                            value={cardData.cvv}
                                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Mês Exp.</Label>
                                        <Input
                                            value={cardData.expirationMonth}
                                            onChange={(e) => setCardData({ ...cardData, expirationMonth: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ano Exp.</Label>
                                        <Input
                                            value={cardData.expirationYear}
                                            onChange={(e) => setCardData({ ...cardData, expirationYear: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Parcelas</Label>
                                        <Input
                                            value={cardData.installment}
                                            onChange={(e) => setCardData({ ...cardData, installment: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Nome no Cartão</Label>
                                    <Input
                                        value={cardData.cardholderName}
                                        onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>CPF do Titular</Label>
                                    <Input
                                        value={cardData.document}
                                        onChange={(e) => setCardData({ ...cardData, document: e.target.value })}
                                    />
                                </div>

                                <h3 className="text-lg font-semibold mt-6 mb-4">Endereço de Cobrança</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>CEP</Label>
                                        <Input
                                            value={addressData.zipCode}
                                            onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Rua</Label>
                                        <Input
                                            value={addressData.street}
                                            onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Número</Label>
                                        <Input
                                            value={addressData.number}
                                            onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Complemento</Label>
                                        <Input
                                            value={addressData.complement}
                                            onChange={(e) => setAddressData({ ...addressData, complement: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bairro</Label>
                                        <Input
                                            value={addressData.neighborhood}
                                            onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Cidade</Label>
                                        <Input
                                            value={addressData.city}
                                            onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Estado</Label>
                                        <Input
                                            value={addressData.state}
                                            onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                                    <h4 className="font-semibold mb-2">🔍 Dados que serão enviados:</h4>
                                    <pre className="text-xs overflow-auto">
                                        {JSON.stringify({
                                            card: {
                                                number: cardData.number.replace(/\s/g, ""),
                                                expirationMonth: cardData.expirationMonth,
                                                expirationYear: cardData.expirationYear,
                                                cvv: cardData.cvv,
                                                installment: parseInt(cardData.installment),
                                                amount: 100
                                            },
                                            client: {
                                                name: cardData.cardholderName,
                                                document: cardData.document.replace(/\D/g, ""),
                                                phoneNumber: "62999599619",
                                                email: "edwardneto@suitpay.app",
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
                                    type="submit"
                                    className="w-full mt-6"
                                    size="lg"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processando Pagamento...
                                        </>
                                    ) : (
                                        "Testar Pagamento com Cartão"
                                    )}
                                </Button>
                            </form>
                        )}

                        {paymentMethod === "pix" && (
                            <div className="text-center py-8">
                                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-4">
                                    <p className="text-yellow-700">
                                        ⚠️ Modo PIX em desenvolvimento
                                    </p>
                                </div>
                                <p className="text-gray-600">A integração PIX estará disponível em breve.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Resultado */}
                {resultMessage && (
                    <Card className={`mb-6 ${resultMessage.includes('✅')
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-2">
                                {resultMessage.includes('✅') ? '✅ Sucesso!' : '❌ Erro'}
                            </h3>
                            <p className="text-sm mb-3">{resultMessage}</p>

                            {transactionData && (
                                <div className="bg-white p-3 rounded border">
                                    <h4 className="font-medium mb-2">Dados da Transação:</h4>
                                    <pre className="text-xs overflow-auto">
                                        {JSON.stringify(transactionData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Informações de Debug */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-3">🔧 Informações para Debug</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>URL da API:</strong> https://sandbox.suitpay.com.br/api/v1/gateway/card</p>
                            <p><strong>Método:</strong> POST</p>
                            <p><strong>Headers:</strong> Content-Type, ci, cs</p>
                            <p><strong>Resposta esperada:</strong> Status 200 com transactionId</p>
                            <p className="text-xs mt-3">💡 Abra o console do navegador (F12) para ver logs detalhados</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}