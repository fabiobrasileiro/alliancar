"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        await createClient().auth.signOut();
      } finally {
        router.replace("/login");
      }
    };
    run();
  }, [router]);

  return <div className="p-6 text-center text-slate-600">Saindo...</div>;
}
