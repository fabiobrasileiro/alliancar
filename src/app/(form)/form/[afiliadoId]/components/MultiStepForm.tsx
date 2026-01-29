"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProgressSteps from "./ProgressSteps";
import PersonalDataStep from "./steps/PersonalDataStep";
import AddressStep from "./steps/AddressStep";
import VehicleStep from "./steps/VehicleStep";
import PlanSelectionStep from "./steps/PlanSelectionStep";
import PaymentStep from "./steps/PaymentStep";
import OrderSummary from "./OrderSummary";
import PlanSummary from "./PlanSummary";
import { FormState, InsurancePlan, OrderValues } from "./steps/types";
import PaymentResult from "./PaymentResult";
import ThankYouPage from "./ThankYouPage";

const optionalServices = [
    { id: "assistencia_24h", name: "Assistência 24H", price: 32.10 },
    { id: "danos_terceiros", name: "Danos a Terceiros", price: 43.10 },
    { id: "vidros", name: "Vidros", price: 25.00 },
];

export default function MultiStepForm() {
    const { afiliadoId } = useParams<{ afiliadoId?: string }>();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [planoEncontrado, setPlanoEncontrado] = useState<InsurancePlan | null>(null);
    const [customMembership, setCustomMembership] = useState<number | null>(null);
    const [showPaymentResult, setShowPaymentResult] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);


    const adesaoParam = useMemo(() => searchParams.get("adesao") || "", [searchParams]);

    useEffect(() => {
        if (!adesaoParam) return;
        const limpo = adesaoParam.replace(",", ".").replace(/[^\d\.]/g, "");
        const parsed = parseFloat(limpo);
        if (Number.isFinite(parsed) && parsed > 0) {
            setCustomMembership(parsed);
        }
    }, [adesaoParam]);

    const orderValues = useMemo<OrderValues>(() => {
        const servicesTotal = optionalServices
            .filter((service) => selectedServices.includes(service.id))
            .reduce((total, service) => total + service.price, 0);

        const membershipValue = (customMembership ?? planoEncontrado?.adesao) || 0;
        const subtotal = membershipValue + servicesTotal;

        return {
            monthly: planoEncontrado?.monthly_payment || 0,
            membership: membershipValue,
            services: servicesTotal,
            subtotal: subtotal,
            total: subtotal
        };
    }, [customMembership, planoEncontrado, selectedServices]);

    const planDescription = useMemo(
        () => `Seguro Auto - ${planoEncontrado?.category_name || 'Plano'}`,
        [planoEncontrado?.category_name]
    );

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
        paymentMethod: "",
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
            observations: "",
            category: "",
            fipeValue: "",
            privateUse: true
        }
    });

    useEffect(() => {
        const newTotal = orderValues.total - discount;
        setForm((prev) => ({
            ...prev,
            value: newTotal > 0 ? newTotal.toString() : "0",
            description: planDescription
        }));
    }, [orderValues.total, discount, planDescription]);

    const handlePlanoEncontrado = (plano: InsurancePlan | null) => {
        setPlanoEncontrado(plano);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

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
        handleChange(e);
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
        if (step < 5) {
            setStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    const handleBackToPayment = () => {
        setShowPaymentResult(false);
        setResult(null);
    };

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

            const cleanCardNumber = form.creditCard.number.replace(/\s/g, '');
            if (cleanCardNumber.length < 13) {
                alert("Número do cartão inválido");
                return;
            }

            if (form.creditCard.ccv.length < 3) {
                alert("CVV inválido");
                return;
            }
        }

        // ✅ VALIDAÇÃO: Verificar se há um plano selecionado
        if (!planoEncontrado && !customMembership) {
            alert("Por favor, selecione um plano de seguro antes de finalizar o pagamento.");
            return;
        }

        // ✅ VALIDAÇÃO: Calcular e validar o valor final
        const finalValue = orderValues.total - discount;
        
        if (finalValue <= 0 || isNaN(finalValue)) {
            alert("O valor total deve ser maior que R$ 0,00. Por favor, selecione um plano ou adicione serviços opcionais.");
            console.error("❌ Valor inválido:", {
                orderValues,
                discount,
                finalValue,
                planoEncontrado: planoEncontrado?.category_name,
                customMembership,
                selectedServices
            });
            return;
        }

        const phoneDigits = form.whatsApp.replace(/\D/g, "");
        if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
            alert("Telefone inválido. Informe DDD + número com 10 ou 11 dígitos (ex.: (11) 99999-9999).");
            return;
        }

        setLoading(true);

        try {
            console.log("🔄 Enviando dados para API...", {
                paymentMethod: form.paymentMethod,
                finalValue: finalValue,
                planoEncontrado: planoEncontrado?.category_name,
                customMembership: customMembership,
                orderValues: orderValues
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
            setShowPaymentResult(true);

            if (data.success) {
                // Verifica se o pagamento foi confirmado (especialmente para cartão)
                const isPaymentConfirmed =
                    data.payment?.status === 'CONFIRMED' ||
                    data.payment?.status === 'RECEIVED' ||
                    form.paymentMethod === 'PIX' || // PIX considera como confirmado já que o usuário vai pagar
                    form.paymentMethod === 'BOLETO'; // Boleto também considera como "confirmado" na criação

                if (isPaymentConfirmed) {
                    console.log("✅ Pagamento confirmado, mostrando página de agradecimento");
                    setShowThankYou(true);
                } else {
                    console.log("📋 Pagamento criado, mostrando instruções");
                    setShowPaymentResult(true);
                }
            } else {
                console.error("❌ Erro na API:", data);
                setShowPaymentResult(true);
            }

        } catch (err: any) {
            console.error("❌ Erro no checkout:", err);
            setResult({
                success: false,
                message: "Erro ao processar checkout",
                error: err.message
            });
            setShowPaymentResult(true);
        } finally {
            setLoading(false);
        }
    }

    const totalWithDiscount = orderValues.total - discount;

    // Se temos resultado e devemos mostrar a tela de resultado
    if (showPaymentResult && result) {
        return (
            <PaymentResult
                result={result}
                paymentMethod={form.paymentMethod}
                onBack={handleBackToPayment}
                orderValues={orderValues}
                plano={planoEncontrado}
            />
        );
    }

    // Adicione a função para redirecionar:
    const handleRedirectToHome = () => {
        // Você pode redirecionar para a página inicial ou fazer o que precisar
        window.location.href = '/'; // ou a URL que você quiser
    };

    // Adicione a função para reiniciar o formulário:
    const handleResetForm = () => {
        setShowThankYou(false);
        setShowPaymentResult(false);
        setResult(null);
        setStep(1);
        // Limpar outros estados se necessário
    };

    if (showThankYou && result?.success) {
        return (
            <ThankYouPage
                paymentData={{
                    paymentId: result.payment?.id || result.paymentId,
                    paymentMethod: form.paymentMethod,
                    invoiceUrl: result.invoiceUrl,
                    status: result.payment?.status || 'CONFIRMED'
                }}
                orderValues={orderValues}
                plano={planoEncontrado}
                onRedirect={handleRedirectToHome}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 my-14 bg-gray-900 shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Checkout Seguro Auto</h2>

            <ProgressSteps currentStep={step} totalSteps={5} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <div className={step === 1 ? "block" : "hidden"}>
                            <PersonalDataStep
                                form={form}
                                onChange={handlePersonalDataChange}
                                onNext={nextStep}
                            />
                        </div>

                        <div className={step === 2 ? "block" : "hidden"}>
                            <AddressStep
                                form={form}
                                onChange={handleChange}
                                onBack={prevStep}
                                onNext={nextStep}
                            />
                        </div>

                        <div className={step === 3 ? "block" : "hidden"}>
                            <VehicleStep
                                form={form}
                                onChange={handleVehicleInfoChange}
                                onBack={prevStep}
                                onNext={nextStep}
                                onPlanoEncontrado={handlePlanoEncontrado}
                            />
                        </div>

                        <div className={step === 4 ? "block" : "hidden"}>
                            <PlanSelectionStep
                                onBack={prevStep}
                                onNext={nextStep}
                                selectedServices={selectedServices}
                                onServicesChange={setSelectedServices}
                                plano={planoEncontrado}
                                vehicleInfo={form.vehicleInfo}
                            />
                        </div>

                        <div className={step === 5 ? "block" : "hidden"}>
                            <PaymentStep
                                form={form}
                                onChange={handleCreditCardChange}
                                onBack={prevStep}
                                onSubmit={handleSubmit}
                                loading={loading}
                                plano={planoEncontrado}
                                orderValues={orderValues}
                                totalWithDiscount={totalWithDiscount}
                                paymentResult={result}
                            />
                        </div>
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
        </div>
    );
}