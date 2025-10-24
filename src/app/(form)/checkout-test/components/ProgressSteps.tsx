interface ProgressStepsProps {
  currentStep: number;
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: 'Seus Dados' },
    { number: 2, label: 'Dados do Veículo' },
    { number: 3, label: 'Endereço' }
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step.number <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step.number.toString().padStart(2, '0')}
              </div>
              <span className={`text-sm font-medium mt-2 ${
                step.number <= currentStep ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${
                step.number < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}