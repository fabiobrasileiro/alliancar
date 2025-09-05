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
import { Badge } from "@/components/ui/badge";

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
  foto_perfil_url?: string;
}

const Afiliados = () => {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("dados_pessoais");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
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
    foto_perfil_url: ""
  });

  // Estados para endereço e bancos
  const [enderecos, setEnderecos] = useState<any[]>([]);
  const [bancos, setBancos] = useState<any[]>([]);

  // Buscar dados do perfil ao carregar
  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      setLoading(true);

      // Buscar usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar dados em paralelo
      const [perfilResponse, enderecosResponse, bancosResponse] = await Promise.all([
        // Perfil do usuário na tabela afiliados
        supabase
          .from("afiliados")
          .select("*")
          .eq("auth_id", user.id)
          .single(),

        // Endereços do usuário
        supabase
          .from("enderecos")
          .select("*")
          .eq("usuario_id", user.id),

        // Contas bancárias do usuário
        supabase
          .from("contas_bancarias")
          .select("*")
          .eq("usuario_id", user.id)
      ]);

      if (perfilResponse.data) {
        setPerfilId(perfilResponse.data.id);
        
        // Buscar endereço principal
        const enderecoPrincipal = enderecosResponse.data?.find(e => e.principal) || 
                                 enderecosResponse.data?.[0] || {};
        
        setFormData({
          name: perfilResponse.data.nome_completo?.split(" ")[0] || "",
          fullName: perfilResponse.data.nome_completo || "",
          registration: perfilResponse.data.cpf_cnpj || "",
          birthdate: "",
          phone: perfilResponse.data.telefone || "",
          mobile: perfilResponse.data.telefone || "",
          email: user.email || "",
          zipcode: enderecoPrincipal.cep || "",
          address: enderecoPrincipal.endereco || "",
          addressNumber: enderecoPrincipal.numero || "",
          addressComplement: enderecoPrincipal.complemento || "",
          addressNeighborhood: "",
          addressState: enderecoPrincipal.estado || "",
          addressCity: enderecoPrincipal.cidade || "",
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
          foto_perfil_url: perfilResponse.data.foto_perfil_url || ""
        });
      }

      if (enderecosResponse.data) setEnderecos(enderecosResponse.data);
      if (bancosResponse.data) setBancos(bancosResponse.data);

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
    if (!perfilId) {
      toast.error("Perfil não encontrado");
      return;
    }

    try {
      setSaving(true);

      // Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Atualizar perfil na tabela afiliados
      const { error: perfilError } = await supabase
        .from("afiliados")
        .update({
          nome_completo: formData.fullName,
          cpf_cnpj: formData.registration,
          telefone: formData.mobile,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", perfilId);

      if (perfilError) {
        throw perfilError;
      }

      // Verificar se já existe um endereço principal
      const enderecoExistente = enderecos.find(e => e.principal);

      if (enderecoExistente) {
        // Atualizar endereço existente
        const { error: enderecoError } = await supabase
          .from("enderecos")
          .update({
            cep: formData.zipcode,
            endereco: formData.address,
            numero: formData.addressNumber,
            complemento: formData.addressComplement,
            estado: formData.addressState,
            cidade: formData.addressCity,
            principal: true
          })
          .eq("id", enderecoExistente.id);

        if (enderecoError) {
          throw enderecoError;
        }
      } else {
        // Criar novo endereço
        const { error: enderecoError } = await supabase
          .from("enderecos")
          .insert({
            usuario_id: user.id,
            cep: formData.zipcode,
            endereco: formData.address,
            numero: formData.addressNumber,
            complemento: formData.addressComplement,
            estado: formData.addressState,
            cidade: formData.addressCity,
            principal: true
          });

        if (enderecoError) {
          throw enderecoError;
        }
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

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !perfilId) return;

      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem");
        return;
      }

      // Fazer upload para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${perfilId}-${Math.random()}.${fileExt}`;
      const filePath = `fotos-perfil/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('afiliados')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('afiliados')
        .getPublicUrl(filePath);

      // Atualizar perfil com a URL da foto
      const { error: updateError } = await supabase
        .from("afiliados")
        .update({ foto_perfil_url: publicUrl })
        .eq("id", perfilId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setFormData(prev => ({ ...prev, foto_perfil_url: publicUrl }));
      toast.success("Foto de perfil atualizada com sucesso!");

    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao atualizar foto de perfil");
    }
  };

  const handleDeleteFoto = async () => {
    if (!perfilId || !formData.foto_perfil_url) return;

    try {
      // Extrair caminho do arquivo da URL
      const urlParts = formData.foto_perfil_url.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('fotos-perfil')).join('/');

      // Deletar arquivo do storage
      const { error: deleteError } = await supabase.storage
        .from('afiliados')
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Remover URL do perfil
      const { error: updateError } = await supabase
        .from("afiliados")
        .update({ foto_perfil_url: null })
        .eq("id", perfilId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setFormData(prev => ({ ...prev, foto_perfil_url: "" }));
      toast.success("Foto de perfil removida com sucesso!");

    } catch (error) {
      console.error("Erro ao remover foto:", error);
      toast.error("Erro ao remover foto de perfil");
    }
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto p-4">
        <h3 className="text-2xl font-bold mb-5">Perfil do Afiliado</h3>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-5">
            <TabsTrigger value="dados_pessoais">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="foto_perfil">Foto de Perfil</TabsTrigger>
            <TabsTrigger value="dados_bancarios">Dados Bancários</TabsTrigger>
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
                <Label htmlFor="name">
                  Apelido
                </Label>
                <Input
                  id="name"
                  type="text"
                  maxLength={256}
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  maxLength={256}
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration">CPF/CNPJ</Label>
                <Input
                  id="registration"
                  type="text"
                  maxLength={18}
                  value={formData.registration}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">
                  WhatsApp com DDD<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  type="text"
                  maxLength={32}
                  value={formData.mobile}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-mail <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
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
                <Label htmlFor="zipcode">
                  CEP
                </Label>
                <Input
                  id="zipcode"
                  type="text"
                  maxLength={10}
                  value={formData.zipcode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Endereço
                </Label>
                <Input
                  id="address"
                  type="text"
                  maxLength={512}
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressNumber">
                  Número
                </Label>
                <Input
                  id="addressNumber"
                  type="text"
                  maxLength={32}
                  value={formData.addressNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressComplement">Complemento</Label>
                <Input
                  id="addressComplement"
                  type="text"
                  maxLength={64}
                  value={formData.addressComplement}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressState">
                  Estado
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
                    <SelectItem value="CE">Ceará</SelectItem>
                    <SelectItem value="DF">Distrito Federal</SelectItem>
                    <SelectItem value="ES">Espírito Santo</SelectItem>
                    <SelectItem value="GO">Goiás</SelectItem>
                    <SelectItem value="MA">Maranhão</SelectItem>
                    <SelectItem value="MT">Mato Grosso</SelectItem>
                    <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="PA">Pará</SelectItem>
                    <SelectItem value="PB">Paraíba</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="PE">Pernambuco</SelectItem>
                    <SelectItem value="PI">Piauí</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="RO">Rondônia</SelectItem>
                    <SelectItem value="RR">Roraima</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="SE">Sergipe</SelectItem>
                    <SelectItem value="TO">Tocantins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressCity">
                  Cidade
                </Label>
                <Input
                  id="addressCity"
                  type="text"
                  value={formData.addressCity}
                  onChange={handleInputChange}
                />
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
                  id="fotoPerfilInput"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFoto}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                <Image
                  width={128}
                  height={128}
                  src={formData.foto_perfil_url || "/placeholder-avatar.png"}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
                {formData.foto_perfil_url && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span 
                      className="text-white cursor-pointer text-sm"
                      onClick={() => document.getElementById('fotoPerfilInput')?.click()}
                    >
                      Alterar
                    </span>
                  </div>
                )}
              </div>

              {formData.foto_perfil_url && (
                <Button 
                  className="mt-4" 
                  variant="default"
                  onClick={handleDeleteFoto}
                >
                  Remover Foto
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dados_bancarios">
            <div className="mb-6 mt-5">
              <p className="text-gray-600">
                Gerencie suas contas bancárias para recebimento de comissões.
              </p>
            </div>

            {bancos.length > 0 ? (
              <div className="space-y-4">
                {bancos.map((banco) => (
                  <div key={banco.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold">{banco.banco}</h4>
                    <p>Agência: {banco.agencia}-{banco.digito_agencia}</p>
                    <p>Conta: {banco.conta}-{banco.digito_conta}</p>
                    {banco.pix && <p>PIX: {banco.pix}</p>}
                    {banco.principal && (
                      <Badge variant="default" className="mt-2">Principal</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma conta bancária cadastrada</p>
            )}

            <Button className="mt-4" onClick={() => {/* Lógica para adicionar conta bancária */}}>
              Adicionar Conta Bancária
            </Button>
          </TabsContent>

          <TabsContent value="dados_acesso">
            <div className="mb-6 mt-5">
              <p className="text-gray-600">
                Tenha em mente que ao alterar a sua senha, nós lhe pediremos que
                defina uma senha segura que contenha letras maiúsculas, minúsculas e números.
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
                {saving ? "Atualizando..." : "Atualizar Senha"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default Afiliados;