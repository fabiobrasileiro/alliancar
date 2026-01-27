import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AtividadesClient from "./AtividadesClient";

export default async function AtividadesPage() {
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
    .select("id")
    .eq("auth_id", user.id)
    .single();

  const afiliadoId = afiliado?.id ?? null;

  const { data: usuarios } = await supabase
    .from("afiliados")
    .select("id, nome_completo")
    .order("nome_completo");

  const { data: atividades } = await supabase
    .from("atividades")
    .select("*");

  return (
    <AtividadesClient
      initialAfiliadoId={afiliadoId}
      initialUsuarios={usuarios ?? []}
      initialAtividades={atividades ?? []}
    />
  );
}
