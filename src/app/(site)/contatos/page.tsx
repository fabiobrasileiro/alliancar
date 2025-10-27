// app/contatos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';

// Tipos
interface Contato {
  id: string;
  name: string;
  email: string;
  telefone: string;
  estado: string;
  city_name: string;
  created_at: string;
  observacoes?: string;
  mobile_phone?: string;
}

interface Filtros {
  name: string;
  email: string;
  telefone: string;
  estado: string;
  city_name: string;
}

export default function ContatosPage() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [contatosFiltrados, setContatosFiltrados] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contatoEditando, setContatoEditando] = useState<Contato | null>(null);

  const [filtros, setFiltros] = useState<Filtros>({
    name: "",
    email: "",
    telefone: "",
    estado: "",
    city_name: ""
  });


  // Carregar contatos
  const loadContatos = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('customers')
        .select('*')

      if (error) throw error;

      setContatos(data || []);
      setContatosFiltrados(data || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
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
          contato.name.toLowerCase().includes(filtros.name.toLowerCase())
        );
      }

      if (filtros.email) {
        resultado = resultado.filter(contato =>
          contato.email?.toLowerCase().includes(filtros.email.toLowerCase())
        );
      }

      if (filtros.telefone) {
        resultado = resultado.filter(contato =>
          contato.telefone?.includes(filtros.telefone)
        );
      }

      if (filtros.estado) {
        resultado = resultado.filter(contato =>
          contato.estado?.toLowerCase().includes(filtros.estado.toLowerCase())
        );
      }

      if (filtros.city_name) {
        resultado = resultado.filter(contato =>
          contato.city_name?.toLowerCase().includes(filtros.city_name.toLowerCase())
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
      telefone: "",
      estado: "",
      city_name: ""
    });
  };

  // Handler para mudanças nos filtros
  const handleFiltroChange = (campo: keyof Filtros, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };


  // Carregar dados na inicialização
  useEffect(() => {
    loadContatos();
  }, []);

  // Origens únicas para o filtro
  const estadosUnicos = [...new Set(contatos.map(c => c.estado).filter(Boolean))];
  const cidadesUnicas = [...new Set(contatos.map(c => c.city_name).filter(Boolean))];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Contatos</h1>
          <p className="text-gray-200 mt-2">
            Gerencie todos os seus contatos em um só lugar
          </p>
        </div>

      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">name</label>
            <input
              type="text"
              value={filtros.name}
              onChange={(e) => handleFiltroChange('name', e.target.value)}
              placeholder="Filtrar por name..."
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="text"
              value={filtros.email}
              onChange={(e) => handleFiltroChange('email', e.target.value)}
              placeholder="Filtrar por email..."
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              type="text"
              value={filtros.telefone}
              onChange={(e) => handleFiltroChange('telefone', e.target.value)}
              placeholder="Filtrar por telefone..."
              className="w-full p-2 border rounded-md"
            />
          </div>



          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Todos os estados</option>
              {estadosUnicos.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">city_name</label>
            <select
              value={filtros.city_name}
              onChange={(e) => handleFiltroChange('city_name', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Todas as cidades</option>
              {cidadesUnicas.map(city_name => (
                <option key={city_name} value={city_name}>{city_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {contatosFiltrados.length} de {contatos.length} contatos
          </span>
          <button
            onClick={limparFiltros}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Limpar Filtros
          </button>
        </div>
      </div>


      {/* Tabela de Contatos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando contatos...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Id
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Localização
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Telefone
                  </th>

                   <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Email
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-background0 uppercase tracking-wider">
                    Data
                  </th>


                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contatosFiltrados.map((contato) => (
                  <tr key={contato.id} className="hover:bg-background">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{contato.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{contato.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contato.email}</div>
                      <div className="text-sm text-background0">{contato.telefone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contato.city_name && contato.estado
                          ? `${contato.city_name}, ${contato.estado}`
                          : contato.city_name || contato.estado || '-'
                        }
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-background0">
                        {contato.mobile_phone}
                    </td>

                     <td className="px-6 py-4 whitespace-nowrap text-sm text-background0">
                        {contato.email}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-background0">
                      {new Date(contato.created_at).toLocaleDateString('pt-BR')}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contatosFiltrados.length === 0 && (
            <div className="text-center py-8 text-background0">
              Nenhum contato encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}