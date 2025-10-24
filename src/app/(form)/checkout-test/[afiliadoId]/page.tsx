"use client";

import { useState } from "react";
import ProgressSteps from "../components/ProgressSteps";
import FormStep1 from "../components/FormStep1";
import FormStep2 from "../components/FormStep2";
import FormStep3 from "../components/FormStep3";


interface FormState {
    pwrClntNm: string;
    pwrCltPhn: string;
    pwrClntMl: string;
    pwrVhclPlt: string;
    pwrVhclTyp: string;
    pwrVhclBrnch: string;
    pwrVhclYr: string;
    pwrVhclMdl: string;
    pwrStt: string;
    pwrCt: string;
    taxiApp: boolean;
    pwrObs: string;
}

export default function FormPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [form, setForm] = useState<FormState>({
        pwrClntNm: "",
        pwrCltPhn: "",
        pwrClntMl: "",
        pwrVhclPlt: "",
        pwrVhclTyp: "0",
        pwrVhclBrnch: "0",
        pwrVhclYr: "0",
        pwrVhclMdl: "0",
        pwrStt: "0",
        pwrCt: "0",
        taxiApp: false,
        pwrObs: "",
    });

    // Handle change para campos normais
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // Navegação entre steps
    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // Submit do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/submit-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    pwrCnsltnt: "4lli4nc4r",
                    pwrCmpnHsh: "4lli4nc4r club487",
                    pwrFrmCode: "DOarNyQe",
                    pwrPplnClmn: "1",
                    pwrLdSrc: "14588"
                }),
            });

            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setResult({ success: false, message: "Erro ao enviar formulário" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <img
                        src="https://alliancarclube.com.br/wp-content/uploads/2025/07/LOGOTIPO-ALLIANCAR-02.svg"
                        alt="Alliancar Clube"
                        className="h-12 mx-auto"
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <ProgressSteps currentStep={currentStep} />

                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    {currentStep === 1 && "Seus Dados"}
                    {currentStep === 2 && "Dados do Veículo"}
                    {currentStep === 3 && "Endereço"}
                </h2>

                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit}>
                        <input type="hidden" id="pwrCnsltnt" value="4lli4nc4r" />

                        {currentStep === 1 && (
                            <FormStep1
                                form={form}
                                onChange={handleChange}
                                onNext={nextStep}
                            />
                        )}

                        {currentStep === 2 && (
                            <FormStep2
                                form={form}
                                onChange={handleChange}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}

                        {currentStep === 3 && (
                            <FormStep3
                                form={form}
                                onChange={handleChange}
                                onBack={prevStep}
                                onSubmit={handleSubmit}
                                loading={loading}
                            />
                        )}
                    </form>

                    {result && (
                        <div className="mt-6 p-4 bg-gray-100 rounded">
                            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}