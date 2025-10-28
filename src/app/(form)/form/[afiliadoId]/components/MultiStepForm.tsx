"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import ProgressSteps from "./ProgressSteps";
import PersonalDataStep from "./steps/PersonalDataStep";
import AddressStep from "./steps/AddressStep";
import VehicleStep from "./steps/VehicleStep";
import PlanSelectionStep from "./steps/PlanSelectionStep";
import PaymentStep from "./steps/PaymentStep";
import OrderSummary from "./OrderSummary";
import PlanSummary from "./PlanSummary";

interface CreditCard {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
}

interface CreditCardHolderInfo {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement: string;
    phone: string;
    mobilePhone: string;
}

interface VehicleInfo {
    plate: string;
    vehicleType: string;
    brand: string;
    year: string;
    model: string;
    state: string;
    city: string;
    isTaxiApp: boolean;
    observations: string;
}

interface FormState {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    mobilePhone: string;
    address: string;
    addressNumber: string;
    complement: string;
    province: string;
    postalCode: string;
    value: string;
    description: string;
    creditCard: CreditCard;
    creditCardHolderInfo: CreditCardHolderInfo;
    externalReference: string | undefined;
    vehicleInfo: VehicleInfo;
}
export default function MultiStepForm() {
    const { afiliadoId } = useParams<{ afiliadoId?: string }>();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Serviços opcionais
    const optionalServices = [
        { id: "38966", name: "Assistência 24H 500km", price: 32.10 },
        { id: "39000", name: "Danos a Terceiros 100 Mil", price: 43.10 },
        { id: "37208", name: "Colisão, Incêndio, Vidros, Lanterna e Carro Reserva 7 dias", price: 40.20 },
        { id: "38896", name: "Carro Reserva 15 dias (7 dias* + 8 dias adicionais)", price: 10.00 },
        { id: "38897", name: "Carro Reserva 30 dias (7 dias* + 23 dias adicionais)", price: 18.00 },
    ];



    const [form, setForm] = useState<FormState>({
        name: "fabio",
        email: "",
        cpfCnpj: "",
        phone: "",
        mobilePhone: "",
        address: "",
        addressNumber: "",
        complement: "",
        province: "",
        postalCode: "",
        value: "200",
        externalReference: afiliadoId,
        description: "Assinatura Plano Pró",
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

    // Valores fixos do pedido
    const orderValues = {
        monthly: 187.60,
        membership: 250.00,
        installation: 150.00,
        total: 400.00
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setForm(prev => ({
                ...prev,
                vehicleInfo: {
                    ...prev.vehicleInfo,
                    [name]: checked
                }
            }));
        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            creditCard: {
                ...prev.creditCard,
                [name]: value
            }
        }));
    };

    const handleVehicleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setForm(prev => ({
                ...prev,
                vehicleInfo: {
                    ...prev.vehicleInfo,
                    [name]: checked
                }
            }));
        } else {
            setForm(prev => ({
                ...prev,
                vehicleInfo: {
                    ...prev.vehicleInfo,
                    [name]: value
                }
            }));
        }
    };

    const handleCouponApply = () => {
        if (coupon.toUpperCase() === "DESCONTO10") {
            setDiscount(40);
        } else {
            setDiscount(0);
        }
    };

    const handleCouponRemove = () => {
        setCoupon("");
        setDiscount(0);
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    discount,
                    finalValue: orderValues.total - discount
                }),
            });

            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setResult({ success: false, message: "Erro ao processar checkout" });
        } finally {
            setLoading(false);
        }
    }

    const totalWithDiscount = orderValues.total - discount;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>

            <ProgressSteps currentStep={step} totalSteps={5} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <PersonalDataStep
                                form={form}
                                onChange={handleChange}
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
                            />
                        )}

                        {step === 4 && (
                            <PlanSelectionStep
                                onBack={prevStep}
                                onNext={nextStep}
                                selectedServices={selectedServices}
                                onServicesChange={setSelectedServices}
                            />
                        )}

                        {step === 5 && (
                            <PaymentStep
                                form={form}
                                onChange={handleCreditCardChange}
                                onBack={prevStep}
                                onSubmit={handleSubmit}
                                loading={loading}
                            />
                        )}
                    </form>
                </div>

                {/* Sidebar - Mostra resumo diferente para cada step */}
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
                        />
                    )
                )}
            </div>

            {result && (
                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}