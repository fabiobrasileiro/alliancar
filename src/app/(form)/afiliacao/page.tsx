import React, { Suspense } from "react";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-white">Carregando...</div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
