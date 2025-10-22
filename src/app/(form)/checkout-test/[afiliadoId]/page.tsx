// src/app/checkout-test/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function CheckoutTestPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [checkoutData, setCheckoutData] = useState<any>(null);

    // Dados para o Asaas - INICIALMENTE VAZIOS
    const [formData, setFormData] = useState({
        // Dados do cliente
        nome: "",
        email: "",
        telefone: "",
        cpfCnpj: "",

        // Dados do veículo
        placa: "",
        marca: "",
        modelo: "",

        // Dados de endereço
        endereco: "",
        numero: "",
        complemento: "",
        cep: "",
        cidade: "",
        estado: "",

        // Valor do pagamento
        valor: 200.00
    });

    const handleAsaasSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/assinatura", {
                method: "POST",
            });

            const result = await response.json();
            console.log("======= RESPOSTA DA NOSSA API =======");
            console.log("✅ Resposta completa:", result);
            console.log("✅ Success:", result.success);
            console.log("✅ Resultado:", result.resultado.link);
            if (result.resultado) {
                console.log("✅ Campos no resultado:", Object.keys(result.resultado));
            }
            console.log("======================================");
            
            if (result.success) {
                setCheckoutData(result);
                setResultMessage("✅ Checkout criado com sucesso! Redirecionando...");

                const paymentLink = ``

                window.location.href = result.resultado.link;
            } else {
                setResultMessage(`❌ Erro: ${result.error || "Falha ao criar checkout"}`);
            }
        } catch (error: any) {
            console.error("❌ Erro no checkout:", error);
            setResultMessage(`❌ Erro de conexão: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 🎯 Dados de teste rápidos
    const preencherDadosTeste = () => {
        setFormData({
            nome: "João Silva",
            email: "joao.silva@email.com",
            telefone: "71981418710",
            cpfCnpj: "86229406594",
            placa: "ABC1D23",
            marca: "Honda",
            modelo: "Civic",
            endereco: "Rua das Flores",
            numero: "123",
            complemento: "Apto 45",
            cep: "01234567",
            cidade: "São Paulo",
            estado: "SP",
            valor: 200.00
        });
        setResultMessage("✅ Dados de teste carregados!");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Contratar Seguro</h1>
                    <p className="text-gray-600">Preencha os dados para gerar o pagamento</p>
                </div>

                {/* Botão de Teste Rápido */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">💡 Teste Rápido</p>
                                <p className="text-sm text-gray-600">Preencha automaticamente com dados de teste</p>
                            </div>
                            <Button onClick={preencherDadosTeste} variant="outline">
                                Preencher Dados Teste
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-700">
                                <strong>🚀 Checkout Asaas</strong> - Preencha os dados e será redirecionado para o ambiente seguro de pagamento.
                            </p>
                        </div>

                        <form onSubmit={handleAsaasSubmit} className="space-y-6">
                            {/* Dados Pessoais */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nome Completo *</Label>
                                        <Input
                                            value={formData.nome}
                                            onChange={(e) => updateField('nome', e.target.value)}
                                            placeholder="Seu nome completo"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Telefone *</Label>
                                        <Input
                                            value={formData.telefone}
                                            onChange={(e) => updateField('telefone', e.target.value)}
                                            placeholder="(11) 99999-9999"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>CPF/CNPJ</Label>
                                        <Input
                                            value={formData.cpfCnpj}
                                            onChange={(e) => updateField('cpfCnpj', e.target.value)}
                                            placeholder="123.456.789-00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dados do Veículo */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Dados do Veículo</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Placa *</Label>
                                        <Input
                                            value={formData.placa}
                                            onChange={(e) => updateField('placa', e.target.value)}
                                            placeholder="ABC1D23"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Marca *</Label>
                                        <Input
                                            value={formData.marca}
                                            onChange={(e) => updateField('marca', e.target.value)}
                                            placeholder="Honda"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Modelo *</Label>
                                        <Input
                                            value={formData.modelo}
                                            onChange={(e) => updateField('modelo', e.target.value)}
                                            placeholder="Civic"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>CEP</Label>
                                        <Input
                                            value={formData.cep}
                                            onChange={(e) => updateField('cep', e.target.value)}
                                            placeholder="01234-567"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Endereço</Label>
                                        <Input
                                            value={formData.endereco}
                                            onChange={(e) => updateField('endereco', e.target.value)}
                                            placeholder="Rua das Flores"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Número</Label>
                                        <Input
                                            value={formData.numero}
                                            onChange={(e) => updateField('numero', e.target.value)}
                                            placeholder="123"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Complemento</Label>
                                        <Input
                                            value={formData.complemento}
                                            onChange={(e) => updateField('complemento', e.target.value)}
                                            placeholder="Apto 45"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cidade</Label>
                                        <Input
                                            value={formData.cidade}
                                            onChange={(e) => updateField('cidade', e.target.value)}
                                            placeholder="São Paulo"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Estado</Label>
                                        <Input
                                            value={formData.estado}
                                            onChange={(e) => updateField('estado', e.target.value)}
                                            placeholder="SP"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Valor */}


                            <Button
                                type="submit"
                                className="w-full mt-6"
                                size="lg"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Criando Checkout...
                                    </>
                                ) : (
                                    "Gerar Pagamento no Asaas"
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

                            {checkoutData && checkoutData.checkoutUrl && (
                                <div className="mt-4">
                                    <p className="text-sm mb-2">Ou clique no link abaixo:</p>
                                    <a
                                        href={checkoutData.checkoutUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                                    >
                                        {checkoutData.checkoutUrl}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Informações */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-3">ℹ️ Como Funciona</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>1. Preencha os dados ou use "Preencher Dados Teste"</p>
                            <p>2. Clique em "Gerar Pagamento no Asaas"</p>
                            <p>3. Será redirecionado para o ambiente seguro do Asaas</p>
                            <p>4. Pague com cartão ou PIX</p>
                            <p>5. Retorne automaticamente para o sistema</p>
                            <p className="text-xs mt-3 font-semibold">💡 Cartão de teste: 4111 1111 1111 1111</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}