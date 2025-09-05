"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    if (error) {
      setErrorMessage(
        error.message || "Falha ao entrar. Verifique suas credenciais.",
      );
      return;
    }
    const redirectTo = searchParams.get("redirectedFrom") || "/";
    router.replace(redirectTo);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setIsLoading(false);
    if (error) {
      setErrorMessage(
        error.message || "Não foi possível enviar o link. Tente novamente.",
      );
      return;
    }
    setSuccessMessage(
      "Se o e-mail existir, enviaremos um link para recuperar a senha.",
    );
  };

  return (
    <div className="flex items-center h-screen justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">
            {isResetMode ? "Recuperar senha" : "Acesse a sua conta"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8">
          <form
            className="grid gap-4"
            onSubmit={isResetMode ? handleResetPasswordSubmit : handleSubmit}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!isResetMode && (
              <div className="grid gap-2 mb-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {errorMessage && (
              <div className="text-sm text-red-600">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="text-sm text-green-600">{successMessage}</div>
            )}

            <div className="flex items-center justify-between">
              {!isResetMode ? (
                <button
                  type="button"
                  className="text-sm text-blue-700 hover:underline"
                  onClick={() => {
                    setIsResetMode(true);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                >
                  Esqueci minha senha
                </button>
              ) : (
                <button
                  type="button"
                  className="text-sm text-slate-600 hover:underline"
                  onClick={() => {
                    setIsResetMode(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                >
                  Voltar ao login
                </button>
              )}

              <Button
                type="submit"
                disabled={isLoading || (isResetMode && !email)}
              >
                {isResetMode
                  ? isLoading
                    ? "Enviando..."
                    : "Enviar link"
                  : isLoading
                    ? "Entrando..."
                    : "Acessar"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-slate-600 text-center w-full">
            Não tem uma conta?{" "}
            <Link
              href="/signup"
              className="text-blue-700 hover:underline font-medium"
            >
              Criar conta
            </Link>
          </p>
          
        </CardFooter>
      </Card>
    </div>
  );
}
