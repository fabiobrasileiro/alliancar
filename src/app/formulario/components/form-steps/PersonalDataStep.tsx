// src/components/form-steps/PersonalDataStep.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../types/form-types";

interface PersonalDataStepProps {
  form: UseFormReturn<FormValues>;
}

export function PersonalDataStep({ form }: PersonalDataStepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="nome_cliente"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="Seu nome completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="telefone_cliente"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Whatsapp</FormLabel>
            <FormControl>
              <Input placeholder="(11) 99999-9999" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email_cliente"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="seu@email.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}