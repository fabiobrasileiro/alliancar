'use client'

import { useState } from 'react'

interface FiltersProps {
  onFilterChange: (filters: any) => void
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    status: 'all',
    minRevenue: '',
    maxRevenue: '',
    search: ''
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nome ou email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Min Revenue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receita Mínima
          </label>
          <input
            type="number"
            placeholder="R$ 0,00"
            value={filters.minRevenue}
            onChange={(e) => handleFilterChange('minRevenue', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Max Revenue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receita Máxima
          </label>
          <input
            type="number"
            placeholder="R$ 0,00"
            value={filters.maxRevenue}
            onChange={(e) => handleFilterChange('maxRevenue', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
} 