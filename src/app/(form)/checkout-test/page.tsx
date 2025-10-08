// src/app/checkout-test/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutTestPage() {
    const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "boleto">("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [transactionData, setTransactionData] = useState<any>(null);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);

    // Dados do cliente
    const [customerData, setCustomerData] = useState({
        name: "Edward Alves Rabelo Neto",
        email: "edwardneto@suitpay.app",
        cpfCnpj: "02924554101",
        phone: "62999599619"
    });

    // Dados do pagamento
    const [paymentData, setPaymentData] = useState({
        value: 100.00,
        description: "Rastreador Veicular Premium",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 dias a partir de hoje
    });

    // Dados do cartão (para pagamento direto)
    const [cardData, setCardData] = useState({
        number: "2430 1695 1394 8900",
        expirationMonth: "01",
        expirationYear: "2050",
        cvv: "000",
        cardholderName: "Edward Alves Rabelo Neto",
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

    // Função para criar cliente no Asaas
    const createCustomer = async () => {
        const customerPayload = {
            name: customerData.name,
            email: customerData.email,
            cpfCnpj: customerData.cpfCnpj.replace(/\D/g, ""),
            mobilePhone: customerData.phone.replace(/\D/g, ""),
            address: addressData.street,
            addressNumber: addressData.number,
            complement: addressData.complement,
            province: addressData.neighborhood,
            postalCode: addressData.zipCode.replace(/\D/g, ""),
            city: addressData.city,
            state: addressData.state
        };

        console.log("📝 Criando cliente:", customerPayload);

        const response = await fetch("/api/asaas/customers", {
            method: "POST",
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'access_token': 'aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjNkNzUyZDNlLThlNTUtNDg5My1hMGM1LTE0YzRmMmI0YmRhNDo6JGFhY2hfNTgwYTcxN2UtOTg0YS00MTE2LWEyOTAtNWRlYTJhMzg5M2Zm'
            },
            body: JSON.stringify(customerPayload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Erro ao criar cliente");
        }

        if (result.id) {
            return result.id;
        } else {
            throw new Error("ID do cliente não retornado");
        }
    };

    // Função para criar cobrança
    const createPayment = async (customerId: string) => {
        const paymentPayload = {
            customer: customerId,
            billingType: paymentMethod.toUpperCase(), // PIX, CREDIT_CARD, BOLETO
            value: paymentData.value,
            dueDate: paymentData.dueDate,
            description: paymentData.description,
            externalReference: `TEST_${Date.now()}`,
        };

        // Remove o callback se não for necessário
        // Adiciona callback apenas se quiser redirecionamento

        // Se for cartão, adiciona dados do cartão
        if (paymentMethod === "card") {
            Object.assign(paymentPayload, {
                creditCard: {
                    holderName: cardData.cardholderName,
                    number: cardData.number.replace(/\s/g, ""),
                    expiryMonth: cardData.expirationMonth,
                    expiryYear: cardData.expirationYear,
                    ccv: cardData.cvv
                },
                creditCardHolderInfo: {
                    name: customerData.name,
                    email: customerData.email,
                    cpfCnpj: customerData.cpfCnpj.replace(/\D/g, ""),
                    postalCode: addressData.zipCode.replace(/\D/g, ""),
                    addressNumber: addressData.number,
                    addressComplement: addressData.complement,
                    phone: customerData.phone.replace(/\D/g, ""),
                    mobilePhone: customerData.phone.replace(/\D/g, "")
                }
            });
        }

        console.log("💰 Criando cobrança:", paymentPayload);

        const response = await fetch("/api/asaas/payments", {
            method: "POST",
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'access_token': 'aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjNkNzUyZDNlLThlNTUtNDg5My1hMGM1LTE0YzRmMmI0YmRhNDo6JGFhY2hfNTgwYTcxN2UtOTg0YS00MTE2LWEyOTAtNWRlYTJhMzg5M2Zm'
            },
            body: JSON.stringify(paymentPayload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Erro ao criar cobrança");
        }

        if (result.id) {
            return result;
        } else {
            throw new Error("ID do pagamento não retornado");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsProcessing(true);
        setResultMessage(null);
        setTransactionData(null);
        setPaymentLink(null);

        try {
            console.log("🚀 Iniciando processo de cobrança...");

            // 1. Criar cliente
            const customerId = await createCustomer();
            console.log("✅ Cliente criado:", customerId);

            // 2. Criar cobrança
            const paymentResult = await createPayment(customerId);
            console.log("✅ Cobrança criada:", paymentResult);

            setTransactionData(paymentResult);

            // 3. Gerar link de pagamento baseado no tipo
            if (paymentMethod === "pix" && paymentResult.pixQrCode) {
                setPaymentLink(paymentResult.invoiceUrl);
                setResultMessage("✅ Cobrança PIX criada! Use o QR Code ou link para pagar.");
            } else if (paymentMethod === "boleto" && paymentResult.bankSlipUrl) {
                setPaymentLink(paymentResult.bankSlipUrl);
                setResultMessage("✅ Boleto gerado! Use o link para visualizar e pagar.");
            } else if (paymentMethod === "card" && paymentResult.status === "CONFIRMED") {
                setResultMessage("✅ Pagamento com cartão aprovado! Transação concluída.");
            } else {
                setPaymentLink(paymentResult.invoiceUrl);
                setResultMessage("✅ Cobrança criada! Use o link para realizar o pagamento.");
            }

        } catch (error: any) {
            console.error("❌ Erro no processo:", error);
            setResultMessage(`❌ Erro: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerador de Cobranças - Asaas</h1>
                    <p className="text-gray-600">Crie cobranças reais para teste com PIX, Cartão e Boleto</p>
                </div>

                {/* Formulário Principal */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Método de Pagamento */}
                            <div>
                                <Label className="text-lg font-semibold mb-3 block">Método de Pagamento</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { value: "pix", label: "PIX", desc: "Pagamento instantâneo" },
                                        { value: "card", label: "Cartão", desc: "Crédito à vista" },
                                        { value: "boleto", label: "Boleto", desc: "Pagamento em até 3 dias" }
                                    ].map((method) => (
                                        <Button
                                            key={method.value}
                                            type="button"
                                            variant={paymentMethod === method.value ? "default" : "outline"}
                                            onClick={() => setPaymentMethod(method.value as any)}
                                            className="flex-1 min-w-[120px] h-auto py-3"
                                        >
                                            <div className="text-center">
                                                <div className="font-semibold">{method.label}</div>
                                                <div className="text-xs opacity-70">{method.desc}</div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Informações da Cobrança */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Valor (R$)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={paymentData.value}
                                        onChange={(e) => setPaymentData({ ...paymentData, value: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Data de Vencimento</Label>
                                    <Input
                                        type="date"
                                        value={paymentData.dueDate}
                                        onChange={(e) => setPaymentData({ ...paymentData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Textarea
                                    value={paymentData.description}
                                    onChange={(e: { target: { value: any; }; }) => setPaymentData({ ...paymentData, description: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Dados do Cliente */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nome Completo</Label>
                                        <Input
                                            value={customerData.name}
                                            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>CPF/CNPJ</Label>
                                        <Input
                                            value={customerData.cpfCnpj}
                                            onChange={(e) => setCustomerData({ ...customerData, cpfCnpj: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={customerData.email}
                                            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Telefone</Label>
                                        <Input
                                            value={customerData.phone}
                                            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dados do Cartão (apenas para cartão) */}
                            {paymentMethod === "card" && (
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-semibold mb-4">Dados do Cartão</h3>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-blue-700">
                                            <strong>💡 Dados de Teste</strong> - Use cartões de teste do Asaas Sandbox
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Número do Cartão</Label>
                                            <Input
                                                value={cardData.number}
                                                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>CVV</Label>
                                            <Input
                                                value={cardData.cvv}
                                                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Mês de Expiração</Label>
                                            <Input
                                                value={cardData.expirationMonth}
                                                onChange={(e) => setCardData({ ...cardData, expirationMonth: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Ano de Expiração</Label>
                                            <Input
                                                value={cardData.expirationYear}
                                                onChange={(e) => setCardData({ ...cardData, expirationYear: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Nome no Cartão</Label>
                                        <Input
                                            value={cardData.cardholderName}
                                            onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Endereço */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-4">Endereço</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>CEP</Label>
                                        <Input
                                            value={addressData.zipCode}
                                            onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Rua</Label>
                                        <Input
                                            value={addressData.street}
                                            onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Número</Label>
                                        <Input
                                            value={addressData.number}
                                            onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                                            required
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
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Cidade</Label>
                                        <Input
                                            value={addressData.city}
                                            onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Estado</Label>
                                        <Input
                                            value={addressData.state}
                                            onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
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
                                        Gerando Cobrança...
                                    </>
                                ) : (
                                    `Gerar Cobrança ${paymentMethod.toUpperCase()}`
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Resultado */}
                {resultMessage && (
                    <Card className={`mb-6 ${resultMessage.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-2">
                                {resultMessage.includes('✅') ? '✅ Sucesso!' : '❌ Erro'}
                            </h3>
                            <p className="text-sm mb-3">{resultMessage}</p>

                            {paymentLink && (
                                <div className="mt-4">
                                    <a
                                        href={paymentLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        🔗 Acessar Link de Pagamento
                                    </a>
                                </div>
                            )}

                            {transactionData && (
                                <div className="bg-white p-3 rounded border mt-4">
                                    <h4 className="font-medium mb-2">Dados da Transação:</h4>
                                    <pre className="text-xs overflow-auto">
                                        {JSON.stringify(transactionData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Informações de Uso */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-3">💡 Como usar</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>PIX:</strong> Gera QR Code e copia e cola</p>
                            <p><strong>Cartão:</strong> Processa pagamento instantâneo</p>
                            <p><strong>Boleto:</strong> Gera boleto bancário para pagamento</p>
                            <p className="text-xs mt-3">⚠️ Use apenas dados de teste em ambiente sandbox</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}