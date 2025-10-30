interface ProgressStepsProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
    const steps = [
        "Dados Pessoais",
        "Endereço",
        "Veículo",
        "Plano",
        "Pagamento"
    ];

    return (
        <div className="mb-8">
            <div className="flex justify-between mb-2">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`flex-1 text-center text-sm font-medium ${
                            index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-500'
                        }`}
                    >
                        {step}
                    </div>
                ))}
            </div>
            <div className="flex bg-gray-200 rounded-full h-2">
                {steps.map((_, index) => (
                    <div
                        key={index}
                        className={`flex-1 ${
                            index + 1 <= currentStep 
                                ? 'bg-blue-600' 
                                : 'bg-gray-300'
                        } ${index === 0 ? 'rounded-l-full' : ''} ${
                            index === steps.length - 1 ? 'rounded-r-full' : ''
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}