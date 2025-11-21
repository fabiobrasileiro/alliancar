'use client'
import { useState, useEffect } from 'react'
import SidebarLayout from "@/components/SidebarLayoute";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';

export type TipoUsuario = 'afiliado' | 'admin'

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
  tipo: TipoUsuario
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
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dadosPix, setDadosPix] = useState<DadosPix[]>([])
  const [dadosBancarios, setDadosBancarios] = useState<DadosPix | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 Iniciando upload...', e.target.files)

    if (!e.target.files) {
      console.log('❌ Nenhum arquivo selecionado')
      return
    }

    if (!e.target.files[0]) {
      console.log('❌ Arquivo na posição 0 não existe')
      return
    }

    if (!afiliado) {
      console.log('❌ Afiliado não carregado')
      return
    }

    const file = e.target.files[0]
    console.log('📄 Arquivo selecionado:', file.name, file.size, file.type)

    // Validações
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Arquivo muito grande')
      setError('Arquivo muito grande. Máximo 5MB.')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${afiliado.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      console.log('🔄 Fazendo upload para:', filePath)

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars') // nome do bucket
        .upload(filePath, file)

      console.log('📤 Resultado do upload:', { data, error })

      if (error) {
        console.log('❌ Erro no upload:', error)
        throw error
      }

      // Pegar URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('🔗 URL pública:', urlData)

      // Atualizar o formulário com a nova URL
      setFormData(prev => ({
        ...prev,
        foto_perfil_url: urlData.publicUrl
      }))

      setMessage('Foto enviada com sucesso!')
      console.log('✅ Foto enviada com sucesso!')

      // Salvar automaticamente no perfil
      const { error: updateError } = await supabase
        .from('afiliados')
        .update({
          foto_perfil_url: urlData.publicUrl,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', afiliado.id)

      if (updateError) {
        console.log('❌ Erro ao salvar no banco:', updateError)
        throw updateError
      }

      console.log('💾 Foto salva no banco com sucesso!')

    } catch (error) {
      console.error('💥 Erro completo:', error)
      setError('Erro ao fazer upload da foto: ' + error)
    } finally {
      setUploading(false)
    }
  }

  // Função para deletar foto (opcional)
  const deletarFoto = async () => {
    if (!afiliado || !formData.foto_perfil_url) return

    try {
      // Extrair o caminho do arquivo da URL
      const url = new URL(formData.foto_perfil_url)
      const pathParts = url.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      const filePath = `avatars/${fileName}`

      // Deletar do storage
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (error) throw error

      // Atualizar estado
      setFormData(prev => ({
        ...prev,
        foto_perfil_url: ''
      }))

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('afiliados')
        .update({
          foto_perfil_url: null,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', afiliado.id)

      if (updateError) throw updateError

      setMessage('Foto removida com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar foto:', error)
      setError('Erro ao remover foto')
    }
  }

  // Estado do formulário principal
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

  // Estado do formulário PIX
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

  const buscarDadosBancarios = async () => {
    if (!afiliado) return

    try {
      let { data, error } = await supabase
        .from('afiliado_bank_data')
        .select('*')
        .eq('afiliado_id', afiliado.id)
        .single() // Pega apenas um registro pois é unique por afiliado

      if (error && error.code !== 'PGRST116') { // PGRST116 é "no rows returned"
        throw error
      }

      setDadosBancarios(data || null)

      // Preencher formulário se existir dados
      if (data) {
        setFormPix({
          pix_address_key: data.pix_address_key || '',
          operation_type: data.operation_type || 'pix',
          pix_address_key_type: data.pix_address_key_type || 'email',
          description: data.description || '',
          accountName: data.accountName || '',
          ownerName: data.ownerName || '',
          ownerBirthDate: data.ownerBirthDate || '',
          cpfCnpj: data.cpfCnpj || '',
          agency: data.agency || '',
          account: data.account || '',
          accountDigit: data.accountDigit || '',
          bankAccountType: data.bankAccountType || 'corrente'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados bancários:', error)
    }
  }

  // Salvar/Atualizar dados bancários
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
        // UPDATE se já existir
        result = await supabase
          .from('afiliado_bank_data')
          .update(dados)
          .eq('id', dadosBancarios.id)
          .select()
      } else {
        // INSERT se não existir
        result = await supabase
          .from('afiliado_bank_data')
          .insert([dados])
          .select()
      }

      if (result.error) throw result.error

      setMessage('Dados bancários salvos com sucesso!')
      buscarDadosBancarios() // Atualizar dados

    } catch (error) {
      console.error('Erro ao salvar dados bancários:', error)
      setError('Erro ao salvar dados bancários')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (afiliado) {
      buscarDadosBancarios()
    }
  }, [afiliado])

  useEffect(() => {
    carregarPerfil()
    buscarDadosPix()
  }, [])

  const carregarPerfil = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('afiliados')
        .select('*')
        .eq('auth_id', user.id)
        .single()

      if (error) throw error

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
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setError('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados PIX
  const buscarDadosPix = async () => {
    if (!afiliado) return

    try {
      let { data, error } = await supabase
        .from('afiliado_bank_data')
        .select('*')
        .eq('afiliado_id', afiliado.id)

      if (error) throw error
      setDadosPix(data || [])
    } catch (error) {
      console.error('Erro ao buscar dados PIX:', error)
    }
  }

  // Salvar dados PIX
  const salvarDadosPix = async () => {
    if (!afiliado) return

    setSaving(true)
    try {
      const dados = {
        ...formPix,
        afiliado_id: afiliado.id
      }

      let { data, error } = await supabase
        .from('afiliado_bank_data') // substitua pelo nome real da tabela
        .insert([dados])
        .select()

      if (error) throw error

      setMessage('Dados PIX salvos com sucesso!')
      buscarDadosPix()

      // Limpar formulário
      setFormPix({
        pix_address_key: '',
        operation_type: 'pix',
        pix_address_key_type: 'email',
        description: '',
        accountName: '',
        ownerName: '',
        ownerBirthDate: '',
        cpfCnpj: '',
        agency: '',
        account: '',
        accountDigit: '',
        bankAccountType: 'corrente'
      })

    } catch (error) {
      console.error('Erro ao salvar PIX:', error)
      setError('Erro ao salvar dados PIX')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked :
        type === 'number' ? parseFloat(value) : value
    }))
  }

  const handlePixChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormPix(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!afiliado) return

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const updates = {
        nome_completo: formData.nome_completo,
        cpf_cnpj: formData.cpf_cnpj || null,
        telefone: formData.telefone || null,
        foto_perfil_url: formData.foto_perfil_url || null,
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

      setMessage('Perfil atualizado com sucesso!')
      setAfiliado(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      setError('Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="container  p-5 max-w-12xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
          <p className="text-gray-200 mt-2">
            Gerencie suas informações pessoais e configurações da conta
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-a2 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal com formulários */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-bg rounded-lg border  p-6">
              <h3 className="text-xl font-semibold mb-4">Dados Pessoais</h3>

              <div className="mb-4">
                <p className="text-white">
                  Aqui você pode configurar suas informações pessoais.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label htmlFor="nome_completo" className="block text-sm font-medium text-white">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nome_completo"
                    type="text"
                    maxLength={256}
                    value={formData.nome_completo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cpf_cnpj" className="block text-sm font-medium text-white">
                    CPF/CNPJ
                  </label>
                  <input
                    id="cpf_cnpj"
                    type="text"
                    maxLength={18}
                    value={formData.cpf_cnpj}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefone" className="block text-sm font-medium text-white">
                    WhatsApp com DDD<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="telefone"
                    type="text"
                    maxLength={32}
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm text-white "
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    maxLength={128}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    className="flex h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm text-white cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2  focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 py-2 px-4 bg-a1 text-white mt-4"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>

            {/* Dados Bancários e PIX */}
            <div className="bg-bg rounded-lg border  p-6">
              <h3 className="text-xl font-semibold mb-4">Dados Bancários e PIX</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Tipo de Operação
                  </label>
                  <select
                    name="operation_type"
                    value={formPix.operation_type}
                    onChange={handlePixChange}
                    className="w-full border rounded-md px-3 py-2 text-white"
                  >
                    <option value="PIX">PIX</option>
                    <option value="TED">TED</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Tipo de Chave PIX
                  </label>
                  <select
                    name="pix_address_key_type"
                    value={formPix.pix_address_key_type}
                    onChange={handlePixChange}
                    className="w-full border rounded-md px-3 py-2 text-white"
                  >
                    <option value="EMAIL">E-mail</option>
                    <option value="CPF">CPF</option>
                    <option value="CELULAR">Celular</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="ALEATORIA">Aleatória</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    name="pix_address_key"
                    value={formPix.pix_address_key}
                    onChange={handlePixChange}
                    className="w-full border rounded-md px-3 py-2 text-white"
                    placeholder="chave@pix.com ou 123.456.789-00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Nome do Titular *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formPix.ownerName}
                    onChange={handlePixChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    CPF/CNPJ do Titular *
                  </label>
                  <input
                    type="text"
                    name="cpfCnpj"
                    value={formPix.cpfCnpj}
                    onChange={handlePixChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Agência *
                  </label>
                  <input
                    type="text"
                    name="agency"
                    value={formPix.agency}
                    onChange={handlePixChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Conta *
                  </label>
                  <input
                    type="text"
                    name="account"
                    value={formPix.account}
                    onChange={handlePixChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Dígito da Conta *
                  </label>
                  <input
                    type="text"
                    name="accountDigit"
                    value={formPix.accountDigit}
                    onChange={handlePixChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Tipo de Conta
                  </label>
                  <select
                    name="bankAccountType"
                    value={formPix.bankAccountType}
                    onChange={handlePixChange}
                    className="w-full border rounded-md px-3 py-2 text-white"
                  >
                    <option value="CONTA_CORRENTE">Conta Corrente</option>
                    <option value="CONTA_POUPANCA">Conta Poupança</option>
                    <option value="CONTA_PAGAMENTO">Conta Pagamento</option>
                  </select>
                </div>
              </div>

              <button
                onClick={salvarDadosBancarios}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {saving ? 'Salvando...' : dadosBancarios ? 'Atualizar Dados' : 'Salvar Dados Bancários'}
              </button>

              {/* Mostrar dados salvos */}
              {dadosBancarios && (
                <div className="mt-6 p-4 bg-green-50 rounded-md">
                  <h4 className="font-semibold mb-2">Dados Bancários Cadastrados</h4>
                  <p><strong>Chave PIX:</strong> {dadosBancarios.pix_address_key}</p>
                  <p><strong>Tipo:</strong> {dadosBancarios.pix_address_key_type}</p>
                  <p><strong>Titular:</strong> {dadosBancarios.ownerName}</p>
                  <p><strong>Agência/Conta:</strong> {dadosBancarios.agency} / {dadosBancarios.account}-{dadosBancarios.accountDigit}</p>
                </div>
              )}
            </div>

            {/* Dados Financeiros - Só mostra se for super_admin */}
            {afiliado?.super_admin && (
              <div className="bg-bg rounded-lg border  p-6">
                <h3 className="text-xl font-semibold mb-4">Configurações Financeiras</h3>

                <div className="mb-4">
                  <p className="text-white">
                    Configure suas metas e comissões.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <label htmlFor="porcentagem_comissao" className="block text-sm font-medium text-white">
                      Porcentagem de Comissão (%)
                    </label>
                    <input
                      id="porcentagem_comissao"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.porcentagem_comissao}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm text-white"
                    />
                    <p className="text-xs text-white">
                      Exemplo: 3% = 0.03
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="valor_adesao" className="block text-sm font-medium text-white">
                      Valor de Adesão (R$)
                    </label>
                    <input
                      id="valor_adesao"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_adesao}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm placeholder:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="meta" className="block text-sm font-medium text-white">
                      Meta Mensal (R$)
                    </label>
                    <input
                      id="meta"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.meta}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm placeholder:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <label htmlFor="ativo" className="text-sm text-white">
                    Conta ativa
                  </label>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2  focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 py-2 px-4 bg-a1 text-white mt-4"
                >
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar com informações do sistema */}
          <div className="space-y-6">
            {/* Status da Conta */}
            <div className="bg-bg rounded-lg border  p-6">
              <h3 className="text-lg font-semibold mb-4">Status da Conta</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white">Status:</span>
                  <span className={`font-medium ${afiliado?.ativo ? 'text-a1' : 'text-a2'}`}>
                    {afiliado?.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Tipo:</span>
                  <span className="font-medium text-white capitalize">
                    {afiliado?.tipo}
                  </span>
                </div>
                {afiliado?.super_admin && (
                  <div className="flex justify-between">
                    <span className="text-white">Super Admin:</span>
                    <span className="font-medium text-white">
                      {afiliado?.super_admin ? 'Sim' : 'Não'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações do Sistema */}
            <div className="bg-bg rounded-lg border  p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Sistema</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-white">ID:</span>
                  <p className="text-white font-mono text-xs truncate">
                    {afiliado?.id}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Criado em:</span>
                  <span className="text-white">
                    {afiliado?.criado_em ? new Date(afiliado!.criado_em).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Atualizado em:</span>
                  <span className="text-white">
                    {afiliado?.atualizado_em ? new Date(afiliado!.atualizado_em).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Foto de Perfil */}
            <div className="bg-bg rounded-lg border  p-6">
              <h3 className="text-lg font-semibold mb-4">Foto de Perfil</h3>
              <div className="space-y-4">
                {formData.foto_perfil_url ? (
                  
                  <img
                    src={formData.foto_perfil_url}
                    alt="Foto de perfil"
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <span className="text-white text-sm">Sem foto</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-white">
                    Escolher foto
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <p className="text-xs text-white">
                    Formatos: JPG, PNG, GIF (Máx: 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}