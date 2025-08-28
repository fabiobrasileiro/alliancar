import React, { Suspense } from "react";
import LoginForm from "./signin-form";

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="p-6 text-center text-slate-500">Carregando...</div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
