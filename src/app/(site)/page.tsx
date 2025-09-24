// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona automaticamente para /dashboard
  redirect('/dashboard');

  return null; // não precisa renderizar nada
}
