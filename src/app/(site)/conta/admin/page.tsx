import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AdminSaquesClient from "./AdminSaquesClient";

export default async function AdminSaques() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Usuário não autenticado</p>
          <p className="text-gray-400 mt-2">Faça login novamente</p>
        </div>
      </div>
    );
  }

  const { data: afiliado } = await supabase
    .from("afiliados")
    .select("super_admin")
    .eq("auth_id", user.id)
    .single();

  if (!afiliado?.super_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Acesso não autorizado</p>
        </div>
      </div>
    );
  }

  const { data: saques } = await supabase
    .from("saques")
    .select(`
      *,
      afiliado:afiliados(nome_completo, email)
    `)
    .order("criado_em", { ascending: false });

  return <AdminSaquesClient initialSaques={saques ?? []} />;
}
