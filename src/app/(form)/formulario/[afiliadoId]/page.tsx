// src/app/formulario/[afiliadoId]/page.tsx
import { MultiStepForm } from "../components/MultiStepForm";

interface PageProps {
  params: Promise<{
    afiliadoId: string;
  }>;
}

export default async function FormularioPage({ params }: PageProps) {
  const { afiliadoId } = await params;
  return <MultiStepForm afiliadoId={afiliadoId} />;
}

// Gera páginas estáticas se necessário
export async function generateStaticParams() {
  return [];
}
