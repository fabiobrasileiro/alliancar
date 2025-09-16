// Hook simples de toast - pode ser substituído por biblioteca específica
import { useState, useCallback } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: string }>>(
    [],
  );

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = options.duration || 3000;

    // Mostrar toast no console por enquanto (pode ser substituído por uma biblioteca como Sonner)
    console.log(
      `Toast ${options.variant || "default"}: ${options.title}`,
      options.description,
    );

    setToasts((prev) => [...prev, { ...options, id }]);

    // Remove o toast após o duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return { toast };
}
