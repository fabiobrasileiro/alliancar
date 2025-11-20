"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressSteps from "./ProgressSteps";
import PersonalDataStep from "./steps/PersonalDataStep";
import AddressStep from "./steps/AddressStep";
import VehicleStep from "./steps/VehicleStep";
import PlanSelectionStep from "./steps/PlanSelectionStep";
import PaymentStep from "./steps/PaymentStep";
import OrderSummary from "./OrderSummary";
import PlanSummary from "./PlanSummary";
import { FormState, InsurancePlan, OrderValues } from "./steps/types";

const optionalServices = [
    { id: "assistencia_24h", name: "Assistência 24H", price: 32.10 },
    { id: "danos_terceiros", name: "Danos a Terceiros", price: 43.10 },
    { id: "vidros", name: "Vidros", price: 25.00 },
];
interface PixData {
    qrCode: string;
    payload: string;
    expirationDate: string;
}

export default function MultiStepForm() {
    const { afiliadoId } = useParams<{ afiliadoId?: string }>();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [planoEncontrado, setPlanoEncontrado] = useState<InsurancePlan | null>(null);
    const [pixData, setPixData] = useState<PixData | null>(null);

    const calculateOrderValues = (): OrderValues => {
        const servicesTotal = optionalServices
            .filter(service => selectedServices.includes(service.id))
            .reduce((total, service) => total + service.price, 0);

        const subtotal = (planoEncontrado?.adesao || 0) + servicesTotal;

        return {
            monthly: planoEncontrado?.monthly_payment || 0,
            membership: planoEncontrado?.adesao || 0,
            services: servicesTotal,
            subtotal: subtotal,
            total: subtotal
        };
    };

    const [orderValues, setOrderValues] = useState<OrderValues>(calculateOrderValues());

    useEffect(() => {
        setOrderValues(calculateOrderValues());
    }, [planoEncontrado, selectedServices]);

    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        cpfCnpj: "",
        whatsApp: "",
        street: "",
        addressNumber: "",
        complement: "",
        province: "",
        postalCode: "",
        value: "0",
        externalReference: afiliadoId,
        paymentMethod: "", // ← IMPORTANTE: Iniciar vazio
        description: `Seguro Auto - ${planoEncontrado?.category_name || 'Plano'}`,
        creditCard: {
            holderName: "",
            number: "",
            expiryMonth: "",
            expiryYear: "",
            ccv: "",
        },
        creditCardHolderInfo: {
            name: "",
            email: "",
            cpfCnpj: "",
            postalCode: "",
            addressNumber: "",
            addressComplement: "",
            phone: "",
            mobilePhone: "",
        },
        vehicleInfo: {
            plate: "",
            vehicleType: "",
            brand: "",
            year: "",
            model: "",
            state: "",
            city: "",
            isTaxiApp: false,
            observations: ""
        }
    });

    useEffect(() => {
        const newTotal = orderValues.total - discount;
        setForm(prev => ({
            ...prev,
            value: newTotal > 0 ? newTotal.toString() : "0",
            description: `Seguro Auto - ${planoEncontrado?.category_name || 'Plano'} - ${form.vehicleInfo.model || ''}`
        }));
    }, [orderValues, discount, planoEncontrado, form.vehicleInfo.model]);

    const handlePlanoEncontrado = (plano: InsurancePlan | null) => {
        setPlanoEncontrado(plano);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // Se for um campo do cartão de crédito (creditCard.field)
        if (name.startsWith('creditCard.')) {
            const fieldName = name.replace('creditCard.', '');
            setForm(prev => ({
                ...prev,
                creditCard: {
                    ...prev.creditCard,
                    [fieldName]: value
                }
            }));
        }
        // Se for um campo do vehicleInfo
        else if (name.startsWith('vehicleInfo.')) {
            const fieldName = name.replace('vehicleInfo.', '');
            setForm(prev => ({
                ...prev,
                vehicleInfo: {
                    ...prev.vehicleInfo,
                    [fieldName]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
                }
            }));
        }
        // Campos normais
        else {
            setForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
            }));
        }
    };


    const handlePersonalDataChange = (name: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e); // Reutiliza a lógica do handleChange principal
    };

    const handleVehicleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            vehicleInfo: {
                ...prev.vehicleInfo,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
            }
        }));
    };

    const handleCouponApply = () => {
        if (coupon.toUpperCase() === "DESCONTO10") {
            setDiscount(40);
        } else {
            setDiscount(0);
            alert("Cupom inválido");
        }
    };

    const handleCouponRemove = () => {
        setCoupon("");
        setDiscount(0);
    };

    const nextStep = () => {
        if (step < 5) setStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    // No handleSubmit do MultiStepForm, adicione:
    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.paymentMethod) {
        alert("Por favor, selecione um método de pagamento");
        return;
    }

    // Validações específicas para cartão de crédito
    if (form.paymentMethod === "CREDIT_CARD") {
        if (!form.creditCard.holderName?.trim() || 
            !form.creditCard.number?.trim() || 
            !form.creditCard.expiryMonth?.trim() || 
            !form.creditCard.expiryYear?.trim() || 
            !form.creditCard.ccv?.trim()) {
            alert("Por favor, preencha todos os dados do cartão de crédito");
            return;
        }

        // Validação básica do número do cartão
        const cleanCardNumber = form.creditCard.number.replace(/\s/g, '');
        if (cleanCardNumber.length < 13) {
            alert("Número do cartão inválido");
            return;
        }

        // Validação do CVV
        if (form.creditCard.ccv.length < 3) {
            alert("CVV inválido");
            return;
        }
    }

    setLoading(true);

    try {
        const finalValue = orderValues.total - discount;

        console.log("🔄 Enviando dados para API...", {
            paymentMethod: form.paymentMethod,
            finalValue: finalValue
        });

        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Dados pessoais
                name: form.name,
                email: form.email,
                whatsApp: form.whatsApp,
                cpfCnpj: form.cpfCnpj,

                // Endereço
                street: form.street,
                addressNumber: form.addressNumber,
                complement: form.complement,
                province: form.province,
                postalCode: form.postalCode,

                // Identificação
                externalReference: form.externalReference,
                description: form.description,
                paymentMethod: form.paymentMethod,

                // Valores
                finalValue: finalValue,
                discount: discount,

                // Plano e serviços
                plano: planoEncontrado,
                selectedServices: selectedServices,
                servicesTotal: orderValues.services,

                // Veículo
                vehicleInfo: form.vehicleInfo,

                // Dados do cartão (apenas para crédito)
                creditCard: form.paymentMethod === "CREDIT_CARD" ? {
                    holderName: form.creditCard.holderName,
                    number: form.creditCard.number,
                    expiryMonth: form.creditCard.expiryMonth,
                    expiryYear: form.creditCard.expiryYear,
                    ccv: form.creditCard.ccv
                } : null
            }),
        });

        const data = await res.json();
        console.log("📨 Resposta completa da API:", data);

        setResult(data);

        if (data.success) {
            // Tratamento diferente para cada método
            if (form.paymentMethod === "PIX") {
                
                console.log("🔍 Verificando dados PIX:", {
                    hasQrCode: !!data.pixQrCode,
                    hasPayload: !!data.pixPayload,
                    hasInvoiceUrl: !!data.invoiceUrl,
                    payment: data.payment
                });

                if (data.pixQrCode) {
                    // Mostrar modal com QR Code PIX
                    setPixData({
                        qrCode: data.pixQrCode,
                        payload: data.pixPayload,
                        expirationDate: data.pixExpirationDate
                    });
                    console.log("✅ Modal PIX aberto com QR Code");

                } else if (data.invoiceUrl) {
                    // Fallback: redirecionar para invoice que contém o PIX
                    console.log("🔀 Fallback: redirecionando para invoice URL");
                    window.open(data.invoiceUrl, '_blank');
                    alert("Pagamento PIX criado! Você será redirecionado para a página de pagamento.");
                } else {
                    console.error("❌ Dados PIX insuficientes:", data);
                    alert("Pagamento PIX criado, mas não foi possível gerar o QR Code. Entre em contato com o suporte.");
                }
            } else if (form.paymentMethod === "BOLETO" && data.bankSlipUrl) {
                // Abrir boleto em nova aba
                window.open(data.bankSlipUrl, '_blank');
                alert("Boleto gerado com sucesso! Verifique sua caixa de entrada.");
            } else if (form.paymentMethod === "CREDIT_CARD") {
                if (data.invoiceUrl) {
                    // Redirecionar para página da fatura
                    window.location.href = data.invoiceUrl;
                } else if (data.status === "CONFIRMED") {
                    alert("Pagamento com cartão confirmado com sucesso!");
                } else {
                    alert("Pagamento com cartão processado! Aguarde a confirmação.");
                }
            } else {
                alert("Pagamento processado com sucesso!");
            }
        } else {
            console.error("❌ Erro na API:", data);
            alert("Erro no processamento: " + (data.error || data.message || "Tente novamente"));
        }

    } catch (err: any) {
        console.error("❌ Erro no checkout:", err);
        setResult({ success: false, message: "Erro ao processar checkout" });
        alert("Erro ao processar o pagamento. Tente novamente.");
    } finally {
        setLoading(false);
    }
}

    const totalWithDiscount = orderValues.total - discount;

    return (
        <div className="max-w-6xl mx-auto p-6 my-14 bg-gray-900 shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Checkout Seguro Auto</h2>

            <ProgressSteps currentStep={step} totalSteps={5} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <PersonalDataStep
                                form={form}
                                onChange={handlePersonalDataChange}
                                onNext={nextStep}
                            />
                        )}

                        {step === 2 && (
                            <AddressStep
                                form={form}
                                onChange={handleChange}
                                onBack={prevStep}
                                onNext={nextStep}
                            />
                        )}

                        {step === 3 && (
                            <VehicleStep
                                form={form}
                                onChange={handleVehicleInfoChange}
                                onBack={prevStep}
                                onNext={nextStep}
                                onPlanoEncontrado={handlePlanoEncontrado}
                            />
                        )}

                        {step === 4 && (
                            <PlanSelectionStep
                                onBack={prevStep}
                                onNext={nextStep}
                                selectedServices={selectedServices}
                                onServicesChange={setSelectedServices}
                                plano={planoEncontrado}
                                vehicleInfo={form.vehicleInfo}
                            />
                        )}

                        {step === 5 && (
                            <PaymentStep
                                form={form}
                                onChange={handleCreditCardChange}
                                onBack={prevStep}
                                onSubmit={handleSubmit}
                                loading={loading}
                                plano={planoEncontrado}
                            />
                        )}
                    </form>
                </div>

                {(step === 3 || step === 4 || step === 5) && (
                    step === 4 ? (
                        <PlanSummary
                            orderValues={orderValues}
                            coupon={coupon}
                            discount={discount}
                            totalWithDiscount={totalWithDiscount}
                            selectedServices={selectedServices}
                            optionalServices={optionalServices}
                            onCouponChange={setCoupon}
                            onCouponApply={handleCouponApply}
                            onCouponRemove={handleCouponRemove}
                            plano={planoEncontrado}
                        />
                    ) : (
                        <OrderSummary
                            orderValues={orderValues}
                            coupon={coupon}
                            discount={discount}
                            totalWithDiscount={totalWithDiscount}
                            onCouponChange={setCoupon}
                            onCouponApply={handleCouponApply}
                            onCouponRemove={handleCouponRemove}
                            plano={planoEncontrado}
                        />
                    )
                )}
            </div>

            {result && !result.success && (
                <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded text-red-700">
                    <strong>Erro:</strong> {result.message}
                </div>
            )}
        </div>
    );
}