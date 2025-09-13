// src/components/MultiStepForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMultiStepForm } from '@/hooks/useMultiStepForm'
import { FormProgress } from './FormProgress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { supabase } from '@/lib/supabase'
import { Textarea } from '@headlessui/react'

// Tipos locais para as tabelas em Português
interface MarcaVeiculo {
  id: number
  nome: string
}

interface ModeloVeiculo {
  id: number
  nome: string
  marca_id: number
  ano: number
}

interface Estado {
  id: number
  nome: string
  uf: string
}

interface Cidade {
  id: number
  nome: string
  estado_id: number
}

// Esquema de validação Zod atualizado para Português
const formSchema = z.object({
  nome_cliente: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone_cliente: z.string().min(10, 'Telefone inválido'),
  email_cliente: z.string().email('Email inválido'),
  placa_veiculo: z.string().min(7, 'Placa deve ter 7 caracteres').max(7),
  tipo_veiculo: z.string().min(1, 'Selecione o tipo de veículo'),
  marca_veiculo: z.string().min(1, 'Selecione a marca'),
  ano_veiculo: z.string().min(1, 'Selecione o ano'),
  modelo_veiculo: z.string().min(1, 'Selecione o modelo'),
  estado: z.string().min(1, 'Selecione o estado'),
  cidade: z.string().min(1, 'Selecione a cidade'),
  taxi_aplicativo: z.boolean().default(false),
  observacoes: z.string().optional(),
  consultor: z.string().default('4lli4nc4r'),
  campanha_hash: z.string().default('4lli4nc4r club487'),
  codigo_formulario: z.string().default('DOarNyQe'),
  pipeline_coluna: z.string().default('1'),
  fonte_lead: z.string().default('14588'),
})

type FormValues = z.infer<typeof formSchema>

const steps = [
  { number: '01', label: 'Seus Dados' },
  { number: '02', label: 'Dados do Veículo' },
  { number: '03', label: 'Endereço' },
]

export function MultiStepForm() {
  const { currentStepIndex, isFirstStep, isLastStep, next, back } = useMultiStepForm(3)
  const [marcasVeiculos, setMarcasVeiculos] = useState<MarcaVeiculo[]>([])
  const [modelosVeiculos, setModelosVeiculos] = useState<ModeloVeiculo[]>([])
  const [anos, setAnos] = useState<number[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      consultor: '4lli4nc4r',
      campanha_hash: '4lli4nc4r club487',
      codigo_formulario: 'DOarNyQe',
      pipeline_coluna: '1',
      fonte_lead: '14588',
      taxi_aplicativo: false,
      nome_cliente: '',
      telefone_cliente: '',
      email_cliente: '',
      placa_veiculo: '',
      tipo_veiculo: '',
      marca_veiculo: 'fdadfa',
      ano_veiculo: '',
      modelo_veiculo: 'afasfda',
      estado: '',
      cidade: '',
      observacoes: '',
    },
  })

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais()
    gerarAnos()
  }, [])

  // Carregar modelos quando marca ou ano mudar
  useEffect(() => {
    const marcaId = form.watch('marca_veiculo')
    const ano = form.watch('ano_veiculo')
    if (marcaId && ano) {
      carregarModelosVeiculos(marcaId, ano)
    }
  }, [form.watch('marca_veiculo'), form.watch('ano_veiculo')])

  // Carregar cidades quando estado mudar
  useEffect(() => {
    const estadoId = form.watch('estado')
    if (estadoId) {
      carregarCidades(estadoId)
    }
  }, [form.watch('estado')])

  const carregarDadosIniciais = async () => {
    try {
      const [marcasResponse, estadosResponse] = await Promise.all([
        supabase.from('marcas_veiculos').select('*').order('nome'),
        supabase.from('estados').select('*').order('nome'),
      ])

      if (marcasResponse.data) setMarcasVeiculos(marcasResponse.data)
      if (estadosResponse.data) setEstados(estadosResponse.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const carregarModelosVeiculos = async (marcaId: string, ano: string) => {
    try {
      const { data } = await supabase
        .from('modelos_veiculos')
        .select('*')
        .eq('marca_id', marcaId)
        .eq('ano', parseInt(ano))
        .order('nome')
      
      if (data) setModelosVeiculos(data)
    } catch (error) {
      console.error('Erro ao carregar modelos:', error)
    }
  }

  const carregarCidades = async (estadoId: string) => {
    try {
      const { data } = await supabase
        .from('cidades')
        .select('*')
        .eq('estado_id', estadoId)
        .order('nome')
      
      if (data) setCidades(data)
    } catch (error) {
      console.error('Erro ao carregar cidades:', error)
    }
  }

  const gerarAnos = () => {
    const anoAtual = new Date().getFullYear()
    const anosArray = Array.from({ length: 30 }, (_, i) => anoAtual - i)
    setAnos(anosArray)
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('formularios').insert([data])
      
      if (error) throw error
      
      alert('Formulário enviado com sucesso!')
      form.reset()
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      alert('Erro ao enviar formulário. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    const fields = getStepFields(currentStepIndex)
    const isValid = await form.trigger(fields as any)
    
    if (isValid) {
      next()
    }
  }

  const getStepFields = (stepIndex: number): (keyof FormValues)[] => {
    switch (stepIndex) {
      case 0:
        return ['nome_cliente', 'telefone_cliente', 'email_cliente']
      case 1:
        return ['placa_veiculo', 'tipo_veiculo', 'marca_veiculo', 'ano_veiculo', 'modelo_veiculo']
      case 2:
        return ['estado', 'cidade']
      default:
        return []
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://alliancarclube.com.br/wp-content/uploads/2025/07/LOGOTIPO-ALLIANCAR-02.svg"
            alt="Alliancar Clube"
            className="mx-auto h-16 w-auto"
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <FormProgress currentStep={currentStepIndex} steps={steps} />

            <h2 className="text-2xl font-bold text-center mb-6">
              {currentStepIndex === 0 && 'Seus Dados'}
              {currentStepIndex === 1 && 'Dados do Veículo'}
              {currentStepIndex === 2 && 'Endereço'}
            </h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ETAPA 1 - Dados Pessoais */}
                {currentStepIndex === 0 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nome_cliente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone_cliente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Whatsapp</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email_cliente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* ETAPA 2 - Dados do Veículo */}
                {currentStepIndex === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="placa_veiculo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo_veiculo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo do veículo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Carro ou utilitário pequeno</SelectItem>
                              <SelectItem value="2">Moto</SelectItem>
                              <SelectItem value="3">Caminhão ou micro-ônibus</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marca_veiculo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca do veículo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a marca" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {marcasVeiculos.map((marca) => (
                                <SelectItem key={marca.id} value={marca.id.toString()}>
                                  {marca.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ano_veiculo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano do modelo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o ano" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {anos.map((ano) => (
                                <SelectItem key={ano} value={ano.toString()}>
                                  {ano}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="modelo_veiculo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o modelo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modelosVeiculos.map((modelo) => (
                                <SelectItem key={modelo.id} value={modelo.id.toString()}>
                                  {modelo.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* ETAPA 3 - Endereço */}
                {currentStepIndex === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {estados.map((estado) => (
                                <SelectItem key={estado.id} value={estado.id.toString()}>
                                  {estado.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a cidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cidades.map((cidade) => (
                                <SelectItem key={cidade.id} value={cidade.id.toString()}>
                                  {cidade.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxi_aplicativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Taxi/App (Uber, 99, etc)</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Observações adicionais" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Botões de navegação */}
                <div className="flex justify-between pt-6">
                  {!isFirstStep && (
                    <Button type="button" variant="outline" onClick={back}>
                      Voltar
                    </Button>
                  )}

                  {isFirstStep && <div />}

                  {!isLastStep ? (
                    <Button type="button" onClick={handleNext}>
                      Próximo
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Enviando...' : 'Enviar'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            <p className="text-xs text-muted-foreground mt-6">
              Ao preencher o formulário, concordo em receber comunicações e estou de acordo com os{' '}
              <a href="https://site.powercrm.com.br/termos-e-condicoes/" target="_blank" className="text-primary underline">
                termos de uso
              </a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}