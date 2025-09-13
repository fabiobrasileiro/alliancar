// src/components/FormProgress.tsx
import { cn } from '@/lib/utils'

interface FormProgressProps {
  currentStep: number
  steps: Array<{ number: string; label: string }>
}

export function FormProgress({ currentStep, steps }: FormProgressProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div
            className={cn(
              "flex flex-col items-center justify-center",
              index < steps.length - 1 && "mr-4"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                currentStep >= index
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-muted-foreground text-muted-foreground"
              )}
            >
              {step.number}
            </div>
            <span
              className={cn(
                "text-sm mt-2 font-medium",
                currentStep >= index ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-16 h-1 mx-4 transition-colors",
                currentStep > index ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}