'use client'
import { useState, useEffect, useRef } from 'react'
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, CreditCard, Settings, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Afiliado {
  id: string
  auth_id: string
  nome_completo: string
  email: string
  cpf_cnpj: string | null
  telefone: string | null
  foto_perfil_url: string | null
  porcentagem_comissao: number
  ativo: boolean
  tipo: string
  criado_em: string
  atualizado_em: string
  valor_adesao: number
  meta: number
  super_admin: boolean
}

interface DadosPix {
  id: string
  afiliado_id: string
  pix_address_key: string
  operation_type: string
  pix_address_key_type: string
  description: string
  created_at: string
  updated_at: string
  accountName: string
  ownerName: string
  ownerBirthDate: string
  cpfCnpj: string
  agency: string
  account: string
  accountDigit: string
  bankAccountType: string
}

export default function PerfilAfiliado() {
  const router = useRouter()
  const supabase = createClient();

  const [afiliado, setAfiliado] = useState<Afiliado | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dadosBancarios, setDadosBancarios] = useState<DadosPix | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    cpf_cnpj: '',
    telefone: '',
    foto_perfil_url: '',
    porcentagem_comissao: 0.03,
    valor_adesao: 0,
    meta: 2500,
    ativo: true,
  })

  const [formPix, setFormPix] = useState({
    pix_address_key: '',
    operation_type: 'PIX',
    pix_address_key_type: 'EMAIL',
    description: '',
    accountName: '',
    ownerName: '',
    ownerBirthDate: '',
    cpfCnpj: '',
    agency: '',
    account: '',
    accountDigit: '',
    bankAccountType: 'CONTA_CORRENTE'
  })

  const fetchingRef = useRef(false)
  const CACHE_TTL_MS = 60000

  const applyAfiliadoData = (data: Afiliado) => {
    setAfiliado(data)
    setFormData({
      nome_completo: data.nome_completo || '',
      email: data.email || '',
      cpf_cnpj: data.cpf_cnpj || '',
      telefone: data.telefone || '',
      foto_perfil_url: data.foto_perfil_url || '',
      porcentagem_comissao: data.porcentagem_comissao || 0.03,
      valor_adesao: data.valor_adesao || 0,
      meta: data.meta || 2500,
      ativo: data.ativo ?? true
    })
  }

  const applyBankData = (data: DadosPix | null) => {
    setDadosBancarios(data || null)
    if (data) {
      setFormPix({
        pix_address_key: data.pix_address_key || '',
        operation_type: data.operation_type || 'PIX',
        pix_address_key_type: data.pix_address_key_type || 'EMAIL',
        description: data.description || '',
        accountName: data.accountName || '',
        ownerName: data.ownerName || '',
        ownerBirthDate: data.ownerBirthDate || '',
        cpfCnpj: data.cpfCnpj || '',
        agency: data.agency || '',
        account: data.account || '',
        accountDigit: data.accountDigit || '',
        bankAccountType: data.bankAccountType || 'CONTA_CORRENTE'
      })
    }
  }

  const getCachedPerfil = (authId: string) => {
    if (typeof window === 'undefined') return null
    const cacheKey = `perfil_cache_${authId}`
    const dataKey = `perfil_data_${authId}`
    const bankKey = `perfil_bank_${authId}`
    const cacheTime = sessionStorage.getItem(cacheKey)
    const cachedData = sessionStorage.getItem(dataKey)
    const cachedBank = sessionStorage.getItem(bankKey)

    if (!cacheTime || !cachedData) return null

    try {
      const timestamp = parseInt(cacheTime, 10)
      const isFresh = Date.now() - timestamp < CACHE_TTL_MS
      const afiliadoData = JSON.parse(cachedData) as Afiliado
      const bankData = cachedBank ? (JSON.parse(cachedBank) as DadosPix) : null
      return { afiliado: afiliadoData, bank: bankData, isFresh }
    } catch {
      return null
    }
  }

  const saveCachedPerfil = (authId: string, data: Afiliado, bank: DadosPix | null) => {
    if (typeof window === 'undefined') return
    const cacheKey = `perfil_cache_${authId}`
    const dataKey = `perfil_data_${authId}`
    const bankKey = `perfil_bank_${authId}`
    sessionStorage.setItem(cacheKey, Date.now().toString())
    sessionStorage.setItem(dataKey, JSON.stringify(data))
    if (bank) {
      sessionStorage.setItem(bankKey, JSON.stringify(bank))
    } else {
      sessionStorage.removeItem(bankKey)
    }
  }

  // Carregar dados do perfil
  useEffect(() => {
    carregarPerfil(false);
  }, []);

  const carregarPerfil = async (isBackground: boolean) => {
    if (fetchingRef.current) return
    try {
      fetchingRef.current = true
      if (isBackground) {
        setRefreshing(true)
      }
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const cached = getCachedPerfil(user.id)
      if (cached?.afiliado) {
        applyAfiliadoData(cached.afiliado)
        applyBankData(cached.bank)
        setLoading(false)
        if (cached.isFresh && !isBackground) {
          return
        }
      }

      const { data, error } = await supabase
        .from('afiliados')
        .select('*')
        .eq('auth_id', user.id)
        .single()

      if (error) throw error

      applyAfiliadoData(data)

      // Buscar dados bancários
      const bankData = await buscarDadosBancarios(data.id)
      saveCachedPerfil(user.id, data, bankData)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      toast.error('Erro ao carregar perfil')
    } finally {
      setLoading(false)
      setRefreshing(false)
      fetchingRef.current = false
    }
  }

  const buscarDadosBancarios = async (afiliadoId: string) => {
    try {
      let { data, error } = await supabase
        .from('afiliado_bank_data')
        .select('*')
        .eq('afiliado_id', afiliadoId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      applyBankData(data || null)
      return data || null
    } catch (error) {
      console.error('Erro ao buscar dados bancários:', error)
      return null
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !afiliado) return

    const file = e.target.files[0]
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.')
      return
    }

    setUploading(true)
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${afiliado.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Atualizar perfil
      const { error: updateError } = await supabase
        .from('afiliados')
        .update({
          foto_perfil_url: urlData.publicUrl,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', afiliado.id)

      if (updateError) throw updateError

      setFormData(prev => ({ ...prev, foto_perfil_url: urlData.publicUrl }))
      toast.success('Foto de perfil atualizada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao fazer upload da foto')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!afiliado) return

    setSaving(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const updates = {
        nome_completo: formData.nome_completo,
        cpf_cnpj: formData.cpf_cnpj || null,
        telefone: formData.telefone || null,
        porcentagem_comissao: formData.porcentagem_comissao,
        valor_adesao: formData.valor_adesao,
        meta: formData.meta,
        ativo: formData.ativo,
        atualizado_em: new Date().toISOString()
      }

      const { error } = await supabase
        .from('afiliados')
        .update(updates)
        .eq('auth_id', user.id)

      if (error) throw error

      setAfiliado(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Perfil atualizado com sucesso!')
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const salvarDadosBancarios = async () => {
    if (!afiliado) return

    setSaving(true)
    try {
      const dados = {
        afiliado_id: afiliado.id,
        pix_address_key: formPix.pix_address_key,
        operation_type: formPix.operation_type,
        pix_address_key_type: formPix.pix_address_key_type,
        description: formPix.description,
        accountName: formPix.accountName,
        ownerName: formPix.ownerName,
        ownerBirthDate: formPix.ownerBirthDate,
        cpfCnpj: formPix.cpfCnpj,
        agency: formPix.agency,
        account: formPix.account,
        accountDigit: formPix.accountDigit,
        bankAccountType: formPix.bankAccountType,
        updated_at: new Date().toISOString()
      }

      let result
      if (dadosBancarios) {
        result = await supabase
          .from('afiliado_bank_data')
          .update(dados)
          .eq('id', dadosBancarios.id)
          .select()
      } else {
        result = await supabase
          .from('afiliado_bank_data')
          .insert([dados])
          .select()
      }

      if (result.error) throw result.error

      toast.success('Dados bancários salvos com sucesso!')
      buscarDadosBancarios(afiliado.id)
      
    } catch (error) {
      console.error('Erro ao salvar dados bancários:', error)
      toast.error('Erro ao salvar dados bancários')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }))
  }

  const handlePixChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormPix(prev => ({ ...prev, [name]: value }))
  }

   if (loading) {
     return (
       <SidebarLayout>
         <div className="p-6 space-y-6">
           <div className="animate-pulse">
             <div className="h-8 bg-gray-700 rounded w-1/4 mb-2"></div>
             <div className="h-4 bg-gray-700 rounded w-1/2"></div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
               {[1, 2].map(i => (
                 <div key={i} className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 animate-pulse">
                   <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[1, 2, 3, 4].map(j => (
                       <div key={j} className="space-y-2">
                         <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                         <div className="h-10 bg-gray-700 rounded"></div>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
             <div className="space-y-6">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 animate-pulse">
                   <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                   <div className="space-y-3">
                     {[1, 2, 3].map(j => (
                       <div key={j} className="flex justify-between">
                         <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                         <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </SidebarLayout>
     )
   }

  return (
    <SidebarLayout >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                Meu Perfil
                {refreshing && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Atualizando...
                  </span>
                )}
              </h1>
              <p className="text-gray-400">
                Gerencie suas informações pessoais e configurações da conta
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <Card className="bg-gray-800/50 border-gray-700 px-5 pb-5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Informações básicas do seu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_completo" className="text-white">
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome_completo"
                      value={formData.nome_completo}
                      onChange={handleInputChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf_cnpj" className="text-white">
                      CPF/CNPJ
                    </Label>
                    <Input
                      id="cpf_cnpj"
                      value={formData.cpf_cnpj}
                      onChange={handleInputChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-white">
                      WhatsApp com DDD *
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>

            {/* Dados Bancários */}
            <Card className="bg-gray-800/50 border-gray-700 px-5 pb-5 mb-5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Dados Bancários
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure suas informações para recebimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Tipo de Operação</Label>
                    <Select value={formPix.operation_type} onValueChange={(value) => setFormPix(prev => ({...prev, operation_type: value}))}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="TED">TED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Tipo de Chave PIX</Label>
                    <Select value={formPix.pix_address_key_type} onValueChange={(value) => setFormPix(prev => ({...prev, pix_address_key_type: value}))}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">E-mail</SelectItem>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CELULAR">Celular</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="ALEATORIA">Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Chave PIX</Label>
                    <Input
                      name="pix_address_key"
                      value={formPix.pix_address_key}
                      onChange={handlePixChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="chave@pix.com ou 123.456.789-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Nome do Titular *</Label>
                    <Input
                      name="ownerName"
                      value={formPix.ownerName}
                      onChange={handlePixChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">CPF/CNPJ do Titular *</Label>
                    <Input
                      name="cpfCnpj"
                      value={formPix.cpfCnpj}
                      onChange={handlePixChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Agência *</Label>
                    <Input
                      name="agency"
                      value={formPix.agency}
                      onChange={handlePixChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Conta *</Label>
                    <Input
                      name="account"
                      value={formPix.account}
                      onChange={handlePixChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Dígito da Conta *</Label>
                    <Input
                      name="accountDigit"
                      value={formPix.accountDigit}
                      onChange={handlePixChange}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <Button 
                  onClick={salvarDadosBancarios} 
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {saving ? 'Salvando...' : dadosBancarios ? 'Atualizar Dados' : 'Salvar Dados Bancários'}
                </Button>

                {dadosBancarios && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">Dados bancários cadastrados</span>
                    </div>
                    <div className="text-sm text-green-300 space-y-1">
                      <div><strong>Chave PIX:</strong> {dadosBancarios.pix_address_key}</div>
                      <div><strong>Titular:</strong> {dadosBancarios.ownerName}</div>
                      <div><strong>Agência/Conta:</strong> {dadosBancarios.agency} / {dadosBancarios.account}-{dadosBancarios.accountDigit}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Foto de Perfil */}
            <Card className="bg-gray-800/50 border-gray-700 px-5 pb-5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  {formData.foto_perfil_url ? (
                    <img
                      src={formData.foto_perfil_url}
                      alt="Foto de perfil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-600"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="space-y-2 w-full">
                    <Label htmlFor="file-upload" className="text-white text-sm">
                      Alterar foto
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="bg-gray-700/50 border-gray-600 text-white text-sm"
                    />
                    <p className="text-xs text-gray-400">
                      JPG, PNG, GIF • Máx: 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status da Conta */}
            <Card className="bg-gray-800/50 border-gray-700 px-5 pb-5">
              <CardHeader>
                <CardTitle className="text-white">Status da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <Badge variant={afiliado?.ativo ? "default" : "blue"} className={afiliado?.ativo ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}>
                    {afiliado?.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tipo:</span>
                  <Badge variant="blue" className="text-gray-300 border-gray-600">
                    {afiliado?.tipo}
                  </Badge>
                </div>
                {afiliado?.super_admin && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Super Admin:</span>
                    <Badge variant="default" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Sim
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações do Sistema */}
            <Card className="bg-gray-800/50 border-gray-700 px-5 pb-5 mb-5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">ID:</span>
                  <p className="text-gray-300 font-mono text-xs truncate" title={afiliado?.id}>
                    {afiliado?.id}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Criado em:</span>
                  <span className="text-gray-300">
                    {afiliado?.criado_em ? new Date(afiliado.criado_em).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Atualizado em:</span>
                  <span className="text-gray-300">
                    {afiliado?.atualizado_em ? new Date(afiliado.atualizado_em).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}