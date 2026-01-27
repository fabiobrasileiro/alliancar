import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import LinksPersonalizadosClient from "./LinksPersonalizadosClient";

export default async function LinksPersonalizadosPage() {
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
    .select("id, nome_completo, valor_adesao")
    .eq("auth_id", user.id)
    .single();

  return <LinksPersonalizadosClient initialAfiliado={afiliado ?? null} />;
}

