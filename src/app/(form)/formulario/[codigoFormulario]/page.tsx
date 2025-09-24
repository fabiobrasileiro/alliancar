// src/app/formulario/[codigo_formulario]/page.tsx
import { MultiStepForm } from "../components/MultiStepForm";

interface PageProps {
  params: Promise<{
    codigoFormulario: string;
  }>;
}

export default async function FormularioPage({ params }: PageProps) {
  const { codigoFormulario } = await params;
  console.log('codigo:', codigoFormulario)
  return <MultiStepForm codigoFormulario={codigoFormulario} />;
}

// Gera páginas estáticas se necessário
export async function generateStaticParams() {
  return [];
}
