"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const perfis = () => {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("dados_pessoais");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfisId, setperfisId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    registration: "",
    birthdate: "",
    phone: "",
    mobile: "",
    email: "",
    zipcode: "",
    address: "",
    addressNumber: "",
    addressComplement: "",
    addressNeighborhood: "",
    addressState: "",
    addressCity: "",
    currentPassword: "",
    password: "",
    passwordConfirmation: "",
  });

  interface FormData {
    name: string;
    fullName: string;
    registration: string;
    birthdate: string;
    phone: string;
    mobile: string;
    email: string;
    zipcode: string;
    address: string;
    addressNumber: string;
    addressComplement: string;
    addressNeighborhood: string;
    addressState: string;
    addressCity: string;
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
  }

  // Buscar dados do perfil ao carregar
  useEffect(() => {
    fetchperfis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchperfis = async () => {
    try {
      setLoading(true);

      // Buscar usuário autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar perfil do usuário
      const { data, error } = await supabase
        .from("perfis")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        toast.error("Erro ao carregar perfil");
        return;
      }

      if (data) {
        setperfisId(data.id);
        setFormData({
          name: data.nome_completo?.split(" ")[0] || "",
          fullName: data.nome_completo || "",
          registration: data.cpf_cnpj || "",
          birthdate: "",
          phone: data.telefone || "",
          mobile: data.telefone || "",
          email: user.email || "",
          zipcode: data.cep || "",
          address: data.endereco || "",
          addressNumber: data.numero || "",
          addressComplement: data.complemento || "",
          addressNeighborhood: "",
          addressState: data.estado || "",
          addressCity: data.cidade || "",
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
        });
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSavePersonalData = async () => {
    if (!perfisId) {
      toast.error("Perfil não encontrado");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("perfis")
        .update({
          nome_completo: formData.fullName,
          cpf_cnpj: formData.registration,
          telefone: formData.phone,
          cep: formData.zipcode,
          endereco: formData.address,
          numero: formData.addressNumber,
          complemento: formData.addressComplement,
          estado: formData.addressState,
          cidade: formData.addressCity,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", perfisId);

      if (error) {
        throw error;
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!formData.password || !formData.passwordConfirmation) {
      toast.error("Por favor, preencha todos os campos de senha");
      return;
    }

    if (formData.password !== formData.passwordConfirmation) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Senha alterada com sucesso!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        password: "",
        passwordConfirmation: "",
      }));
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto p-4">
        <h3 className="text-2xl font-bold mb-5">Perfil</h3>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-5">
            <TabsTrigger value="dados_pessoais">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="foto_perfil">Foto de Perfil</TabsTrigger>
            <TabsTrigger value="dados_acesso">Dados de Acesso</TabsTrigger>
          </TabsList>

          <TabsContent value="dados_pessoais">
            <div className="mb-4">
              <p className="text-gray-600">
                Aqui você pode configurar suas informações pessoais.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="dataName">
                  Apelido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataName"
                  type="text"
                  maxLength={256}
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFullName">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataFullName"
                  type="text"
                  maxLength={256}
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataRegistration">CPF/CNPJ</Label>
                <Input
                  id="dataRegistration"
                  type="text"
                  maxLength={18}
                  value={formData.registration}
                  onChange={handleInputChange}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataBirthdate">
                  Data de Nascimento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataBirthdate"
                  type="text"
                  maxLength={10}
                  value={formData.birthdate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPhone">Telefone Comercial com DDD</Label>
                <Input
                  id="dataPhone"
                  type="text"
                  maxLength={32}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataMobile">
                  WhatsApp com DDD<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataMobile"
                  type="text"
                  maxLength={32}
                  value={formData.mobile}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEmail">
                  E-mail <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataEmail"
                  type="email"
                  maxLength={128}
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            <div className="mb-4">
              <h4 className="text-lg font-semibold">Endereço</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="dataZipcode">
                  CEP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataZipcode"
                  type="text"
                  maxLength={10}
                  value={formData.zipcode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAddress">
                  Endereço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataAddress"
                  type="text"
                  maxLength={512}
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAddressNumber">
                  Número <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataAddressNumber"
                  type="text"
                  maxLength={32}
                  value={formData.addressNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAddressComplement">Complemento</Label>
                <Input
                  id="dataAddressComplement"
                  type="text"
                  maxLength={64}
                  value={formData.addressComplement}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAddressNeighborhood">
                  Bairro <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataAddressNeighborhood"
                  type="text"
                  maxLength={64}
                  value={formData.addressNeighborhood}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAddressState">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.addressState}
                  onValueChange={(value) =>
                    setFormData({ ...formData, addressState: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">Acre</SelectItem>
                    <SelectItem value="AL">Alagoas</SelectItem>
                    <SelectItem value="AP">Amapá</SelectItem>
                    <SelectItem value="AM">Amazonas</SelectItem>
                    <SelectItem value="BA">Bahia</SelectItem>
                    {/* Outros estados aqui */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAddressCity">
                  Cidade <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.addressCity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, addressCity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="616">Salvador</SelectItem>
                    <SelectItem value="281">Abaíra</SelectItem>
                    {/* Outras cidades aqui */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSavePersonalData}
              className="mt-4"
              disabled={loading || saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </TabsContent>

          <TabsContent value="foto_perfil">
            <div className="mt-5">
              <Label>Faça upload da sua foto de perfil</Label>
              <div className="mt-4">
                <Input
                  id="perfisPictureInput"
                  type="file"
                  className="hidden"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                <Image
                  width={150}
                  height={150}
                  id="perfisPictureImg"
                  src="/"
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white cursor-pointer">Alterar</span>
                </div>
              </div>

              <Button className="mt-4">Deletar</Button>
            </div>
          </TabsContent>

          <TabsContent value="dados_acesso">
            <div className="mb-6 mt-5">
              <p className="text-gray-600">
                Tenha em mente que ao alterar a sua senha, nós lhe pediremos que
                defina uma senha de segurança que contenha letras maiúsculas e
                minúsculas e números. Isso é para a sua própria segurança.
              </p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  value={formData.passwordConfirmation}
                  onChange={handleInputChange}
                />
              </div>

              <Button onClick={handleSavePassword} disabled={saving}>
                {saving ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default perfis;
