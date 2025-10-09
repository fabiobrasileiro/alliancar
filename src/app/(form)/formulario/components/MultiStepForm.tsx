// src/components/MultiStepForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { FormProgress } from "./FormProgress";
import { PersonalDataStep } from "./form-steps/PersonalDataStep";

import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FormNavigation } from "@/components/FormNavigation";
import { AddressStep } from "./form-steps/AddressStep";
import { VehicleDataStep } from "./form-steps/VehicleDataStep";
import { CheckoutStep } from "./form-steps/CheckoutStep";

interface MarcaVeiculo {
  id: number;
  nome: string;
}

interface ModeloVeiculo {
  id: number;
  nome: string;
  marca_id: number;
  ano: number;
}

interface Estado {
  id: number;
  nome: string;
  uf: string;
}

interface Cidade {
  id: number;
  nome: string;
  estado_id: number;
}

interface MultiStepFormProps {
  codigoFormulario?: string;
}

const formSchema = z.object({
  nome_cliente: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone_cliente: z.string().min(10, "Telefone inválido"),
  email_cliente: z.string().email("Email inválido"),
  placa_veiculo: z.string().min(7, "Placa deve ter 7 caracteres").max(7),
  tipo_veiculo: z.string().min(1, "Selecione o tipo de veículo"),
  marca_veiculo: z.string().min(1, "Selecione a marca"),
  ano_veiculo: z.string().min(1, "Selecione o ano"),
  modelo_veiculo: z.string().min(1, "Selecione o modelo"),
  estado: z.string().min(1, "Selecione o estado"),
  cidade: z.string().min(1, "Selecione a cidade"),
  taxi_aplicativo: z.boolean().default(false),
  observacoes: z.string().optional(),
  pipeline_coluna: z.string().default("1"),
  fonte_lead: z.string().default("14588"),
  codigo_formulario: z.string(),
  
});


type FormValues = z.infer<typeof formSchema>;

const steps = [
  { number: "01", label: "Seus Dados" },
  { number: "02", label: "Dados do Veículo" },
  { number: "03", label: "Endereço" },
  { number: "04", label: "Pagamento" }, // Nova etapa
];

export function MultiStepForm({ codigoFormulario }: MultiStepFormProps) {
  console.log(codigoFormulario)
  const { currentStepIndex, isFirstStep, isLastStep, next, back } = useMultiStepForm(4);
  const [marcasVeiculos, setMarcasVeiculos] = useState<MarcaVeiculo[]>([]);
  const [modelosVeiculos, setModelosVeiculos] = useState<ModeloVeiculo[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      codigo_formulario: codigoFormulario || "",
      pipeline_coluna: "",
      fonte_lead: "",
      taxi_aplicativo: false,
      nome_cliente: "",
      telefone_cliente: "",
      email_cliente: "",
      placa_veiculo: "",
      tipo_veiculo: "",
      marca_veiculo: "",
      ano_veiculo: "",
      modelo_veiculo: "",
      estado: "",
      cidade: "",
      observacoes: "",
    },
  });

  const processPayment = async (paymentData: any) => {
    console.log("💳 Processando pagamento:", paymentData);

    try {
      const response = await fetch("/api/payments/credit-card", {
         method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Erro no processamento do pagamento:", error);
      throw error;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
    gerarAnos();
  }, []);

  // Carregar modelos quando marca ou ano mudar
  useEffect(() => {
    const marcaId = form.watch("marca_veiculo");
    const ano = form.watch("ano_veiculo");
    if (marcaId && ano) {
      carregarModelosVeiculos(marcaId, ano);
    }
  }, [form.watch("marca_veiculo"), form.watch("ano_veiculo")]);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    const estadoId = form.watch("estado");
    if (estadoId) {
      carregarCidades(estadoId);
    }
  }, [form.watch("estado")]);

  const carregarDadosIniciais = async () => {
    try {
      const [marcasResponse, estadosResponse] = await Promise.all([
        supabase.from("marcas_veiculos").select("*").order("nome"),
        supabase.from("estados").select("*").order("nome"),
      ]);

      if (marcasResponse.data) setMarcasVeiculos(marcasResponse.data);
      if (estadosResponse.data) setEstados(estadosResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const carregarModelosVeiculos = async (marcaId: string, ano: string) => {
    try {
      const { data } = await supabase
        .from("modelos_veiculos")
        .select("*")
        .eq("marca_id", marcaId)
        .order("nome");

      if (data) setModelosVeiculos(data);
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
    }
  };

  const carregarCidades = async (estadoId: string) => {
    try {
      const { data } = await supabase
        .from("cidades")
        .select("*")
        .eq("estado_id", estadoId)
        .order("nome");

      if (data) setCidades(data);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
    }
  };

  const gerarAnos = () => {
    const anoAtual = new Date().getFullYear();
    const anosArray = Array.from({ length: 30 }, (_, i) => anoAtual - i);
    setAnos(anosArray);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Se tiver codigo_formulario na URL, usa ele
      const formData = {
        ...data,
        codigo_formulario: codigoFormulario || data.codigo_formulario,
      };

      const { error } = await supabase.from("formularios").insert([formData]);

      if (error) throw error;
      alert("Formulário enviado com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      alert("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    console.log("💾 Salvando dados no Supabase...");

    setIsSubmitting(true);
    try {
      const formData = form.getValues();
      const finalData = {
        ...formData,
        codigo_formulario: codigoFormulario || formData.codigo_formulario,
      };

      // Apenas salvar no Supabase
      const { error } = await supabase.from("formularios").insert([finalData]);

      if (error) throw error;

      console.log("✅ Dados salvos. Indo para checkout...");
      next(); // Vai para a etapa 4 (checkout)

    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // MODIFICAR: handleNext
  const handleNext = async () => {
    // Se está na etapa 3 (endereço), salva dados e vai para checkout
    if (currentStepIndex === 2) {
      await handleFinalSubmit();
      return;
    }

    const fields = getStepFields(currentStepIndex);
    const isValid = await form.trigger(fields as any);

    if (isValid) {
      next();
    }
  };

  const getStepFields = (stepIndex: number): (keyof FormValues)[] => {
    switch (stepIndex) {
      case 0:
        return ["nome_cliente", "telefone_cliente", "email_cliente"];
      case 1:
        return [
          "placa_veiculo",
          "tipo_veiculo",
          "marca_veiculo",
          "ano_veiculo",
          "modelo_veiculo",
        ];
      case 2:
        return ["estado", "cidade"];
      case 3: // Checkout não tem validação de campos
        return [];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://alliancarclube.com.br/wp-content/uploads/2025/07/LOGOTIPO-ALLIANCAR-02.svg"
            alt="Alliancar Clube"
            className="mx-auto h-16 w-auto"
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <FormProgress currentStep={currentStepIndex} steps={steps} />

            <h2 className="text-2xl font-bold text-center mb-6">
              {currentStepIndex === 0 && "Seus Dados"}
              {currentStepIndex === 1 && "Dados do Veículo"}
              {currentStepIndex === 2 && "Endereço"}
              {currentStepIndex === 3 && "Pagamento"}
            </h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFinalSubmit)}
                className="space-y-6"
              >
                {/* Renderizar o passo atual
                {currentStepIndex === 0 && <PersonalDataStep form={form} />}
                {currentStepIndex === 1 && (
                  <VehicleDataStep
                    form={form}
                    marcasVeiculos={marcasVeiculos}
                    modelosVeiculos={modelosVeiculos}
                    anos={anos}
                  />
                )}
                {currentStepIndex === 2 && (
                  <AddressStep
                    form={form}
                    estados={estados}
                    cidades={cidades}
                  />
                )} */}
                {currentStepIndex === 0 && (
                  <CheckoutStep
                    isSubmitting={isSubmitting}
                    formData={form.getValues()}
                    onProcessPayment={processPayment} // 👈 PASSA A FUNÇÃO DE PAGAMENTO
                  />
                )}

                {/* Botões de navegação - esconder na etapa de checkout
                {currentStepIndex !== 3 && (
                  <FormNavigation
                    isFirstStep={isFirstStep}
                    isLastStep={isLastStep}
                    isSubmitting={isSubmitting}
                    onBack={back}
                    onNext={handleNext}
                  />
                )} */}
              </form>
            </Form>

            {currentStepIndex !== 3 && (
              <p className="text-xs text-muted-foreground mt-6">
                Ao preencher o formulário, concordo em receber comunicações e
                estou de acordo com os{" "}
                <a
                  href="https://site.powercrm.com.br/termos-e-condicoes/"
                  target="_blank"
                  className="text-primary underline"
                >
                  termos de uso
                </a>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

  );
}