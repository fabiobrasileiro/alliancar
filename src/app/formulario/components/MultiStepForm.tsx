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
  afiliadoId?: string;
}

const formSchema = z.object({
  afiliado_id: z.string().optional(),
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
  consultor: z.string().default("4lli4nc4r"),
  campanha_hash: z.string().default("4lli4nc4r club487"),
  codigo_formulario: z.string().default("DOarNyQe"),
  pipeline_coluna: z.string().default("1"),
  fonte_lead: z.string().default("14588"),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { number: "01", label: "Seus Dados" },
  { number: "02", label: "Dados do Veículo" },
  { number: "03", label: "Endereço" },
  { number: "04", label: "Pagamento" }, // Nova etapa
];

export function MultiStepForm({ afiliadoId }: MultiStepFormProps) {
  const { currentStepIndex, isFirstStep, isLastStep, next, back } = useMultiStepForm(4);
  const [marcasVeiculos, setMarcasVeiculos] = useState<MarcaVeiculo[]>([]);
  const [modelosVeiculos, setModelosVeiculos] = useState<ModeloVeiculo[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      afiliado_id: afiliadoId || "",
      consultor: "4lli4nc4r",
      campanha_hash: "4lli4nc4r club487",
      codigo_formulario: "DOarNyQe",
      pipeline_coluna: "1",
      fonte_lead: "14588",
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
      // Se tiver afiliadoId na URL, usa ele
      const formData = {
        ...data,
        afiliado_id: afiliadoId || data.afiliado_id,
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
    setIsSubmitting(true);
    try {
      const formData = form.getValues();
      const finalData = {
        ...formData,
        afiliado_id: afiliadoId || formData.afiliado_id,
      };

      // 1. Salvar no Supabase
      const { error } = await supabase.from("formularios").insert([finalData]);
      if (error) throw error;

      // 2. Criar pagamento - FORMATO EXATO que a API aceita
      const requestData = {
        requestNumber: crypto.randomUUID(),
        card: {
          number: "2430169513948900", // SEM espaços
          expirationMonth: "01",
          expirationYear: "2050",
          cvv: "000",
          installment: 1,
          amount: 1 // Valor em reais (R$ 1,00)
        },
        client: {
          name: "Edward Alves Rabelo Neto", // Nome fixo para teste
          document: "02924554101", // SEM pontuação
          phoneNumber: "62999599619", // SEM pontuação
          email: "edwardneto@suitpay.app", // Email fixo para teste
          address: {
            codIbge: "5208707",
            street: "Rua Paraíba",
            number: "01",
            complement: "",
            zipCode: "74663520", // SEM hífen
            neighborhood: "Goiânia 2",
            city: "Goiânia",
            state: "GO"
          }
        },
        products: [
          {
            productName: "Aula Teste",
            idCheckout: "3978",
            quantity: 1,
            value: 1 // Valor em reais (R$ 1,00)
          }
        ],
        callbackUrl: "https://webhook.site/" // URL exata do exemplo
      };

      console.log("📤 Dados enviados para API:", JSON.stringify(requestData, null, 2));

      const paymentResponse = await fetch("/api/payment/create-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData)
      });

      console.log("📥 Status da resposta:", paymentResponse.status);

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error("❌ Erro HTTP:", paymentResponse.status, errorText);
        throw new Error(`Erro: ${paymentResponse.status} - ${errorText}`);
      }

      const paymentResult = await paymentResponse.json();
      console.log("📦 Resultado do pagamento:", paymentResult);

      if (paymentResult.success) {
        console.log("✅ Pagamento criado com sucesso");
        setPaymentUrl(paymentResult.paymentUrl || null);
        setQrCode(paymentResult.qrCode || null);
        console.log("🔄 Chamando next() para ir para etapa 4");
        next();
      } else {
        console.error("❌ Erro no pagamento:", paymentResult.error);
        throw new Error(paymentResult.error || "Erro ao criar pagamento");
      }

    } catch (error) {
      console.error("💥 Erro completo no handleFinalSubmit:", error);
      alert("Erro ao processar pagamento. Verifique o console para detalhes.");
    } finally {
      console.log("🏁 Finalizando handleFinalSubmit");
      setIsSubmitting(false);
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

  const handleNext = async () => {
    console.log("🔄 handleNext chamado, step atual:", currentStepIndex);

    // Se está na etapa 3 (endereço), vai para o checkout
    if (currentStepIndex === 2) {
      console.log("🚀 Indo para handleFinalSubmit...");
      await handleFinalSubmit();
      return;
    }

    const fields = getStepFields(currentStepIndex);
    console.log("✅ Validando campos:", fields);

    const isValid = await form.trigger(fields as any);
    console.log("📋 Validação result:", isValid);

    if (isValid) {
      console.log("✅ Campos válidos, indo para próximo step");
      next();
    } else {
      console.log("❌ Campos inválidos");
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
                {/* Renderizar o passo atual */}
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
                )}
                {currentStepIndex === 3 && (
                  <CheckoutStep
                    paymentUrl={paymentUrl}
                    qrCode={qrCode}
                    isSubmitting={isSubmitting}
                    formData={form.getValues()}
                  />
                )}

                {/* Botões de navegação - esconder na etapa de checkout */}
                {currentStepIndex !== 3 && (
                  <FormNavigation
                    isFirstStep={isFirstStep}
                    isLastStep={isLastStep}
                    isSubmitting={isSubmitting}
                    onBack={back}
                    onNext={handleNext}
                  />
                )}
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