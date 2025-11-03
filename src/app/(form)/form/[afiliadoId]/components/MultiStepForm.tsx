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

const optionalServices = [
    { id: "38966", name: "Assistência 24H 500km", price: 32.10 },
    { id: "39000", name: "Danos a Terceiros 100 Mil", price: 43.10 },
    { id: "37208", name: "Colisão, Incêndio, Vidros, Lanterna e Carro Reserva 7 dias", price: 40.20 },
    { id: "38896", name: "Carro Reserva 15 dias (7 dias* + 8 dias adicionais)", price: 10.00 },
    { id: "38897", name: "Carro Reserva 30 dias (7 dias* + 23 dias adicionais)", price: 18.00 },
];

export default function MultiStepForm() {
    const { afiliadoId } = useParams<{ afiliadoId?: string }>();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [planoEncontrado, setPlanoEncontrado] = useState<any>(null);

    // Função para calcular valores
    const calculateOrderValues = () => {
        const servicesTotal = optionalServices
            .filter(service => selectedServices.includes(service.id))
            .reduce((total, service) => total + service.price, 0);

        const subtotal = (planoEncontrado?.adesao || 0) +
            (planoEncontrado?.monthly_payment || 0) +
            150.00 + // instalação
            servicesTotal;

        return {
            monthly: planoEncontrado?.monthly_payment || 0,
            membership: planoEncontrado?.adesao || 0,
            installation: 150.00,
            services: servicesTotal,
            subtotal: subtotal,
            total: subtotal
        };
    };

    // Estado para orderValues
    const [orderValues, setOrderValues] = useState(calculateOrderValues());

    // Atualizar orderValues quando plano ou serviços mudarem
    useEffect(() => {
        setOrderValues(calculateOrderValues());
    }, [planoEncontrado, selectedServices]);

    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        cpfCnpj: "",
        phone: "",
        mobilePhone: "",
        address: "",
        addressNumber: "",
        complement: "",
        province: "",
        postalCode: "",
        value: orderValues.total.toString(),
        externalReference: afiliadoId,
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

    // Atualizar valor total quando orderValues mudar
    useEffect(() => {
        const newTotal = orderValues.total - discount;
        setForm(prev => ({
            ...prev,
            value: newTotal.toString(),
            description: `Seguro Auto - ${planoEncontrado?.category_name || 'Plano'} - ${form.vehicleInfo.model || ''}`
        }));
    }, [orderValues, discount, planoEncontrado, form.vehicleInfo.model]);

    const handlePlanoEncontrado = (plano: any) => {
        setPlanoEncontrado(plano);
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
            const finalValue = orderValues.total - discount;

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // Dados pessoais
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    cpfCnpj: form.cpfCnpj,
                    mobilePhone: form.mobilePhone,

                    // Endereço
                    address: form.address,
                    addressNumber: form.addressNumber,
                    complement: form.complement,
                    province: form.province,
                    postalCode: form.postalCode,

                    // Identificação
                    externalReference: form.externalReference,
                    description: form.description,

                    // Valores
                    finalValue: finalValue,
                    discount: discount,

                    // Plano e serviços
                    plano: planoEncontrado,
                    selectedServices: selectedServices,
                    servicesTotal: orderValues.services
                }),
            });

            const data = await res.json();
            setResult(data);

            if (data.success && data.checkoutUrl) {
            }
            
        } catch (err) {
            console.error(err);
            setResult({ success: false, message: "Erro ao processar checkout" });
        } finally {
            setLoading(false);
        }
    }

    const totalWithDiscount = orderValues.total - discount;

    return (
        <div className="max-w-6xl mx-auto p-6 my-14 bg-bg shadow-lg rounded-lg ">
            <h2 className="text-2xl font-bold mb-6 text-center">Checkout Seguro Auto</h2>

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

                {/* Sidebar */}
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

            {result && (
                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}