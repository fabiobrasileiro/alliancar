"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    cnpj: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const referralId = searchParams.get('referral');
  const tipoParam = searchParams.get('tipo'); // 'gerente' ou null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Formatação automática do CNPJ
    if (id === 'cnpj') {
      const cleanValue = value.replace(/\D/g, '');
      let formattedValue = cleanValue;
      
      if (cleanValue.length <= 2) {
        formattedValue = cleanValue;
      } else if (cleanValue.length <= 5) {
        formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
      } else if (cleanValue.length <= 8) {
        formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
      } else if (cleanValue.length <= 12) {
        formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
      } else {
        formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`;
      }
      
      setFormData(prev => ({
        ...prev,
        [id]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const validateCNPJ = (cnpj: string) => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    return cleanCNPJ.length === 14;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validações
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName || !formData.cnpj) {
      setMessage({ type: 'error', text: "Todos os campos são obrigatórios" });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: "As senhas não coincidem" });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: "A senha deve ter pelo menos 6 caracteres" });
      setLoading(false);
      return;
    }

    if (!validateCNPJ(formData.cnpj)) {
      setMessage({ type: 'error', text: "CNPJ deve ter 14 dígitos" });
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const cleanCNPJ = formData.cnpj.replace(/\D/g, '');

      // 1. Verifica se o CNPJ já existe
      const { data: existingAfiliado, error: checkError } = await supabase
        .from('afiliados')
        .select('id')
        .eq('cnpj', cleanCNPJ)
        .single();

      if (existingAfiliado) {
        setMessage({ type: 'error', text: "CNPJ já cadastrado" });
        setLoading(false);
        return;
      }

      // 2. Verifica se o email já existe
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('afiliados')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingEmail) {
        setMessage({ type: 'error', text: "Email já cadastrado" });
        setLoading(false);
        return;
      }

      // 3. Cria o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome_completo: formData.fullName,
            name: formData.fullName,
            cnpj: cleanCNPJ
          },
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        setMessage({ type: 'error', text: `Erro no cadastro: ${authError.message}` });
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setMessage({ type: 'error', text: "Erro ao criar usuário" });
        setLoading(false);
        return;
      }

      // 4. Cria o afiliado manualmente na tabela
      console.log('Criando afiliado para user:', authData.user.id);
      
      const { data: afiliadoData, error: afiliadoError } = await supabase
        .from('afiliados')
        .insert({
          auth_id: authData.user.id,
          nome_completo: formData.fullName,
          email: formData.email,
          cnpj: cleanCNPJ,
          ativo: true,
          tipo: tipoParam || 'afiliado', // Se vier tipo=gerente, cria como gerente
          porcentagem_comissao: 0.03, // Inicia com 3%
          valor_adesao: 0.00,
          meta: 2500.00,
          super_admin: false,
          referral_id: referralId || null // Salva o referral_id do afiliado que indicou
        })
        .select()
        .single();

      if (afiliadoError) {
        console.error('Error creating afiliado:', afiliadoError);
        
        // Se der erro ao criar afiliado, tenta deletar o usuário criado
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        setMessage({ type: 'error', text: `Erro ao criar afiliado: ${afiliadoError.message}` });
        setLoading(false);
        return;
      }

      // SUCCESSO!
      console.log('Afiliado criado:', afiliadoData);
      
      setMessage({ 
        type: 'success', 
        text: "✅ Conta criada com sucesso! Afiliado registrado. Verifique seu email para confirmar a conta." 
      });
      
      // Limpa o form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        cnpj: ""
      });

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      console.error("Unexpected error:", err);
      setMessage({ type: 'error', text: `Erro inesperado: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Criar Conta Afiliado
            </CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={18}
                />
                <p className="text-xs text-muted-foreground">Apenas números serão salvos</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha (mín. 6 caracteres)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {message && (
                <div className={`text-sm text-center p-3 rounded ${
                  message.type === 'error' 
                    ? "text-red-600 bg-red-50 border border-red-200" 
                    : "text-green-600 bg-green-50 border border-green-200"
                }`}>
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-5"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar Conta Afiliado"}
              </Button>

              <div className="text-center mb-7">
                <span className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Fazer login
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}