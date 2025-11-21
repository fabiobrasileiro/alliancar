"use client";

import { useState, useEffect } from "react";
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';

// Tipos baseados na API do Asaas
interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
  cpfCnpj: string;
  postalCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
  city: number;
  cityName: string;
  state: string;
  country: string;
  externalReference: string;
  observations: string;
  deleted: boolean;
  [key: string]: any;
}

interface Filtros {
  name: string;
  email: string;
  phone: string;
  state: string;
  cityName: string;
}

export default function ContatosPage() {
  const [contatos, setContatos] = useState<AsaasCustomer[]>([]);
  const [contatosFiltrados, setContatosFiltrados] = useState<AsaasCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfilData, setPerfilData] = useState<any>(null);

  const [filtros, setFiltros] = useState<Filtros>({
    name: "",
    email: "",
    phone: "",
    state: "",
    cityName: ""
  });

  const supabase = createClient();
  const { user } = useUser();

  // Carregar perfil do afiliado
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !authUser) {
          setError('Usuário não autenticado');
          return;
        }

        const { data: perfilResponse, error: perfilError } = await supabase
          .from('afiliados')
          .select('*')
          .eq('auth_id', authUser.id)
          .single();

        if (perfilError) {
          console.error('Erro ao buscar perfil:', perfilError);
          setError('Erro ao buscar perfil do afiliado');
          return;
        }

        if (perfilResponse) {
          setPerfilData(perfilResponse);
          console.log("👤 Perfil carregado:", perfilResponse);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setError('Erro ao carregar perfil');
      }
    };

    fetchPerfil();
  }, [supabase]);

  // Carregar contatos do Asaas
  const loadContatos = async () => {
    if (!perfilData?.id) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Buscando clientes do Asaas para afiliado:", perfilData.id);

      const response = await fetch(`/api/customers?externalReference=${perfilData.id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes do Asaas');
      }

      const data = await response.json();
      
      if (data.success) {
        setContatos(data.data || []);
        setContatosFiltrados(data.data || []);
        console.log(`✅ ${data.data.length} clientes carregados do Asaas`);
      } else {
        throw new Error(data.error || 'Erro ao carregar clientes');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar contatos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    const filtrarContatos = () => {
      let resultado = [...contatos];

      if (filtros.name) {
        resultado = resultado.filter(contato =>
          contato.name?.toLowerCase().includes(filtros.name.toLowerCase())
        );
      }

      if (filtros.email) {
        resultado = resultado.filter(contato =>
          contato.email?.toLowerCase().includes(filtros.email.toLowerCase())
        );
      }

      if (filtros.phone) {
        resultado = resultado.filter(contato =>
          contato.phone?.includes(filtros.phone) || 
          contato.mobilePhone?.includes(filtros.phone)
        );
      }

      if (filtros.state) {
        resultado = resultado.filter(contato =>
          contato.state?.toLowerCase().includes(filtros.state.toLowerCase())
        );
      }

      if (filtros.cityName) {
        resultado = resultado.filter(contato =>
          contato.cityName?.toLowerCase().includes(filtros.cityName.toLowerCase())
        );
      }

      setContatosFiltrados(resultado);
    };

    filtrarContatos();
  }, [filtros, contatos]);

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      name: "",
      email: "",
      phone: "",
      state: "",
      cityName: ""
    });
  };

  // Handler para mudanças nos filtros
  const handleFiltroChange = (campo: keyof Filtros, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Carregar contatos quando o perfil estiver disponível
  useEffect(() => {
    if (perfilData?.id) {
      loadContatos();
    }
  }, [perfilData]);

  // Origens únicas para o filtro
  const estadosUnicos = [...new Set(contatos.map(c => c.state).filter(Boolean))];
  const cidadesUnicas = [...new Set(contatos.map(c => c.cityName).filter(Boolean))];

  if (loading && !perfilData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-white text-lg">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-red-400 text-xl font-semibold mb-2">Erro ao carregar contatos</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <button 
            onClick={loadContatos}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Contatos - Asaas</h1>
          <p className="mt-2 text-gray-300">
            Clientes cadastrados através do seu link de afiliado
            {perfilData && (
              <span className="text-blue-400 ml-2">(ID: {perfilData.id})</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadContatos}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Status da Conexão */}
      {/* <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-green-400">✅</div>
            <div>
              <p className="text-green-400 font-medium">Conectado ao Asaas</p>
              <p className="text-green-300 text-sm">
                Buscando clientes com externalReference: {perfilData?.id}
              </p>
            </div>
          </div>
          <div className="text-green-400 text-sm">
            {contatos.length} cliente(s) encontrado(s)
          </div>
        </div>
      </div> */}

      {/* Filtros */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-1">Nome</label>
            <input
              type="text"
              value={filtros.name}
              onChange={(e) => handleFiltroChange('name', e.target.value)}
              placeholder="Filtrar por nome..."
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 font-medium mb-1">Email</label>
            <input
              type="text"
              value={filtros.email}
              onChange={(e) => handleFiltroChange('email', e.target.value)}
              placeholder="Filtrar por email..."
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 font-medium mb-1">Telefone</label>
            <input
              type="text"
              value={filtros.phone}
              onChange={(e) => handleFiltroChange('phone', e.target.value)}
              placeholder="Filtrar por telefone..."
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 font-medium mb-1">Estado</label>
            <select
              value={filtros.state}
              onChange={(e) => handleFiltroChange('state', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-500"
            >
              <option value="" className="bg-gray-700">Todos os estados</option>
              {estadosUnicos.map(estado => (
                <option key={estado} value={estado} className="bg-gray-700">{estado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 font-medium mb-1">Cidade</label>
            <select
              value={filtros.cityName}
              onChange={(e) => handleFiltroChange('cityName', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-500"
            >
              <option value="" className="bg-gray-700">Todas as cidades</option>
              {cidadesUnicas.map(cityName => (
                <option key={cityName} value={cityName} className="bg-gray-700">{cityName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">
            {contatosFiltrados.length} de {contatos.length} clientes
          </span>
          <button
            onClick={limparFiltros}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Contatos */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ID Asaas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  CPF/CNPJ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {contatosFiltrados.map((contato) => (
                <tr key={contato.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-300">{contato.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-white">{contato.name}</div>
                    <div className="text-sm text-gray-400">{contato.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {contato.address && (
                        <>
                          {contato.address}, {contato.addressNumber}
                          {contato.complement && ` - ${contato.complement}`}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{contato.postalCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {contato.cityName && contato.state
                        ? `${contato.cityName}, ${contato.state}`
                        : contato.cityName || contato.state || '-'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div>{contato.phone || '-'}</div>
                    <div className="text-gray-400">{contato.mobilePhone || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {contato.cpfCnpj || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contatosFiltrados.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            {contatos.length === 0 
              ? "Nenhum cliente encontrado no Asaas com seu externalReference"
              : "Nenhum cliente corresponde aos filtros aplicados"
            }
          </div>
        )}
      </div>
    </div>
  );
}