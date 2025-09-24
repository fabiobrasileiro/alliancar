"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import {
  FormData,
  Endereco,
  Banco,
  Bucket,
  NovoBanco,
} from "./components/types";
import { DadosPessoaisForm } from "./components/DadosPessoaisForm";
import { FotoPerfilTab } from "./components/FotoPerfilTab";
import { DadosBancariosTab } from "./components/DadosBancariosTab";
import { DadosAcessoTab } from "./components/DadosAcessoTab";

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
    foto_perfil_url: "",
  });
  const { user } = useUser();

  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [bucket, setBucket] = useState<Bucket[]>([]);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        toast.error("Usuário não autenticado");
        return;
      }

      const [perfilResponse, enderecosResponse, bancosResponse] =
        await Promise.all([
          supabase
            .from("afiliados")
            .select("*")
            .eq("auth_id", authUser.id)
            .single(),
          supabase.from("enderecos").select("*").eq("afiliado_id", authUser.id),
          supabase
            .from("contas_bancarias")
            .select("*")
            .eq("afiliado_id", authUser.id),
        ]);

      if (perfilResponse.error) throw perfilResponse.error;
      if (enderecosResponse.error) throw enderecosResponse.error;
      if (bancosResponse.error) throw bancosResponse.error;

      if (perfilResponse.data) {
        setPerfilId(perfilResponse.data.id);
        const enderecoPrincipal =
          enderecosResponse.data?.find((e) => e.principal) ||
          enderecosResponse.data?.[0] ||
          {};

        setFormData((prev) => ({
          ...prev,
          name: perfilResponse.data.nome_completo?.split(" ")[0] || "",
          fullName: perfilResponse.data.nome_completo || "",
          registration: perfilResponse.data.cpf_cnpj || "",
          phone: perfilResponse.data.telefone || "",
          mobile: perfilResponse.data.telefone || "",
          email: authUser.email || "",
          zipcode: enderecoPrincipal.cep || "",
          address: enderecoPrincipal.logradouro || "",
          addressNumber: enderecoPrincipal.numero || "",
          addressComplement: enderecoPrincipal.complemento || "",
          addressNeighborhood: enderecoPrincipal.bairro || "",
          addressState: enderecoPrincipal.estado || "",
          addressCity: enderecoPrincipal.cidade || "",
          foto_perfil_url: perfilResponse.data.foto_perfil_url || "",
        }));
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
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePersonalData = async () => {
    if (!perfilId) {
      toast.error("Perfil não encontrado");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      if (perfilError) throw perfilError;

      // Verificar se já existe um endereço principal
      const enderecoExistente = enderecos.find((e) => e.principal);

      if (enderecoExistente) {
        // Atualizar endereço existente
        const { error: enderecoError } = await supabase
          .from("enderecos")
          .update({
            cep: formData.zipcode,
            logradouro: formData.address, // Alterado para logradouro
            numero: formData.addressNumber,
            complemento: formData.addressComplement,
            estado: formData.addressState,
            cidade: formData.addressCity,
            bairro: formData.addressNeighborhood, // Alterado para bairro
            principal: true,
          })
          .eq("id", enderecoExistente.id);

        if (enderecoError) throw enderecoError;
      } else {
        // Criar novo endereço
        const { error: enderecoError } = await supabase
          .from("enderecos")
          .insert({
            afiliado_id: user.id, // Alterado para afiliado_id
            cep: formData.zipcode,
            logradouro: formData.address, // Alterado para logradouro
            numero: formData.addressNumber,
            complemento: formData.addressComplement,
            estado: formData.addressState,
            cidade: formData.addressCity,
            bairro: formData.addressNeighborhood, // Alterado para bairro
            principal: true,
          });

        if (enderecoError) throw enderecoError;
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

      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione um arquivo de imagem");
        return;
      }

      // Buscar usuário autenticado para obter o ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `fotos-perfil/${user.id}/${fileName}`; // Inclui user ID no path

      const { error: uploadError } = await supabase.storage
        .from("afiliados")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("afiliados").getPublicUrl(filePath);

      // Atualizar perfil com a URL da foto
      const { error: updateError } = await supabase
        .from("afiliados")
        .update({ foto_perfil_url: publicUrl })
        .eq("id", perfilId);

      if (updateError) {
        throw updateError;
      }

      setFormData((prev) => ({ ...prev, foto_perfil_url: publicUrl }));
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao atualizar foto de perfil");
    }
  };

  const handleDeleteFoto = async () => {
    if (!perfilId || !formData.foto_perfil_url) return;

    try {
      // Buscar usuário autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Extrair caminho do arquivo da URL
      const url = new URL(formData.foto_perfil_url);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.indexOf("afiliados");
      const filePath = pathParts.slice(bucketIndex + 1).join("/");

      // Deletar arquivo do storage
      const { error: deleteError } = await supabase.storage
        .from("afiliados")
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

      setFormData((prev) => ({ ...prev, foto_perfil_url: "" }));
      toast.success("Foto de perfil removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      toast.error("Erro ao remover foto de perfil");
    }
  };
  // No seu componente principal (Afiliados.tsx)
  const handleAddBanco = async (bancoData: NovoBanco) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Se for principal, remover principal de outras contas
      if (bancoData.principal) {
        await supabase
          .from("contas_bancarias")
          .update({ principal: false })
          .eq("afiliado_id", user.id);
      }

      const { error } = await supabase
        .from("contas_bancarias")
        .insert([{ ...bancoData, afiliado_id: user.id }]);

      if (error) throw error;

      toast.success("Conta bancária adicionada com sucesso!");
      fetchPerfil(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      toast.error("Erro ao adicionar conta bancária");
    }
  };

  const handleEditBanco = async (id: string, bancoData: NovoBanco) => {
    try {
      // Se for principal, remover principal de outras contas
      if (bancoData.principal) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        await supabase
          .from("contas_bancarias")
          .update({ principal: false })
          .eq("afiliado_id", user?.id)
          .neq("id", id);
      }

      const { error } = await supabase
        .from("contas_bancarias")
        .update(bancoData)
        .eq("id", id);

      if (error) throw error;

      toast.success("Conta bancária atualizada com sucesso!");
      fetchPerfil();
    } catch (error) {
      console.error("Erro ao editar conta:", error);
      toast.error("Erro ao editar conta bancária");
    }
  };

  const handleDeleteBanco = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contas_bancarias")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Conta bancária excluída com sucesso!");
      fetchPerfil();
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast.error("Erro ao excluir conta bancária");
    }
  };

  const handleSetPrincipal = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Remover principal de todas as contas
      await supabase
        .from("contas_bancarias")
        .update({ principal: false })
        .eq("afiliado_id", user?.id);

      // Definir esta conta como principal
      const { error } = await supabase
        .from("contas_bancarias")
        .update({ principal: true })
        .eq("id", id);

      if (error) throw error;

      toast.success("Conta principal definida com sucesso!");
      fetchPerfil();
    } catch (error) {
      console.error("Erro ao definir conta principal:", error);
      toast.error("Erro ao definir conta principal");
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
            <DadosPessoaisForm
              formData={formData}
              loading={loading}
              saving={saving}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onSave={handleSavePersonalData}
            />
          </TabsContent>

          <TabsContent value="foto_perfil">
            <FotoPerfilTab
              fotoPerfilUrl={formData.foto_perfil_url || ""}
              onUploadFoto={handleUploadFoto}
              onDeleteFoto={handleDeleteFoto}
            />
          </TabsContent>

          <TabsContent value="dados_bancarios">
            <DadosBancariosTab
              bancos={bancos}
              onAddBanco={handleAddBanco}
              onEditBanco={handleEditBanco}
              onDeleteBanco={handleDeleteBanco}
              onSetPrincipal={handleSetPrincipal}
            />
          </TabsContent>

          <TabsContent value="dados_acesso">
            <DadosAcessoTab
              formData={{
                currentPassword: formData.currentPassword,
                password: formData.password,
                passwordConfirmation: formData.passwordConfirmation,
              }}
              saving={saving}
              onInputChange={handleInputChange}
              onSavePassword={handleSavePassword}
            />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default Afiliados;
