import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
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
    .select("*")
    .eq("auth_id", user.id)
    .single();

  const { data: bankData } = await supabase
    .from("afiliado_bank_data")
    .select("*")
    .eq("afiliado_id", afiliado?.id)
    .single();

  return <PerfilClient initialAfiliado={afiliado ?? null} initialBankData={bankData ?? null} />;
}
