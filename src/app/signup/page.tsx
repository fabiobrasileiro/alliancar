import React, { Suspense } from "react";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-slate-500">Carregando...</div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
