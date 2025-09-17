// src/components/FormNavigation.tsx
import { Button } from "@/components/ui/button";

interface FormNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function FormNavigation({ 
  isFirstStep, 
  isLastStep, 
  isSubmitting, 
  onBack, 
  onNext 
}: FormNavigationProps) {
  return (
    <div className="flex justify-between pt-6">
      {!isFirstStep && (
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
      )}

      {isFirstStep && <div />}

      {!isLastStep ? (
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      ) : (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar"}
        </Button>
      )}
    </div>
  );
}