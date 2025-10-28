interface ProgressStepsProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
    return (
        <div className="flex justify-between mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num) => (
                <div key={num} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= num ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    }`}>
                        {num}
                    </div>
                    {num < totalSteps && <div className="w-8 h-1 bg-gray-200 mx-2"></div>}
                </div>
            ))}
        </div>
    );
}