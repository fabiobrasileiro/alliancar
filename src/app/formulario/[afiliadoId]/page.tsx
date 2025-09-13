// src/app/formulario/[afiliadoId]/page.tsx
import { MultiStepForm } from '../components/MultiStepForm'

interface PageProps {
  params: {
    afiliadoId: string
  }
}

export default function FormularioPage({ params }: PageProps) {
  return <MultiStepForm afiliadoId={params.afiliadoId} />
}

// Gera páginas estáticas se necessário
export async function generateStaticParams() {
  return []
}