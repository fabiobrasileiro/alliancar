// src/components/form-steps/VehicleDataStep.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues, MarcaVeiculo, ModeloVeiculo } from "../types/form-types";


interface VehicleDataStepProps {
  form: UseFormReturn<FormValues>;
  marcasVeiculos: MarcaVeiculo[];
  modelosVeiculos: ModeloVeiculo[];
  anos: number[];
}

export function VehicleDataStep({ form, marcasVeiculos, modelosVeiculos, anos }: VehicleDataStepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="placa_veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placa</FormLabel>
            <FormControl>
              <Input placeholder="ABC1234" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tipo_veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo do veículo</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">
                  Carro ou utilitário pequeno
                </SelectItem>
                <SelectItem value="2">Moto</SelectItem>
                <SelectItem value="3">
                  Caminhão ou micro-ônibus
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="marca_veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca do veículo</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {marcasVeiculos.map((marca) => (
                  <SelectItem
                    key={marca.id}
                    value={marca.id.toString()}
                  >
                    {marca.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ano_veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ano do modelo</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="modelo_veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {modelosVeiculos.map((modelo) => (
                  <SelectItem
                    key={modelo.id}
                    value={modelo.id.toString()}
                  >
                    {modelo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}