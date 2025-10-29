// components/InsuranceCalculator.tsx
'use client';

import { useInsurance } from '@/hooks/useInsurance';
import { useState } from 'react';

export const InsuranceCalculator = () => {
  const { plans, loading, selectedPlan, coverages, selectPlan, findPlanForVehicle } = useInsurance();
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleValue, setVehicleValue] = useState('');

  const handleSearch = async () => {
    const value = parseFloat(vehicleValue);
    if (vehicleName && !isNaN(value)) {
      await findPlanForVehicle(vehicleName, value);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6">
      {/* Busca por veículo */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nome do veículo"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Valor do veículo"
          value={vehicleValue}
          onChange={(e) => setVehicleValue(e.target.value)}
          className="border p-2 mr-2"
        />
        <button 
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2"
        >
          Buscar
        </button>
      </div>

      {/* Lista de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border p-4 cursor-pointer ${
              selectedPlan?.id === plan.id ? 'bg-blue-50 border-blue-500' : ''
            }`}
            onClick={() => selectPlan(plan)}
          >
            <h3 className="font-bold">{plan.vehicle_range}</h3>
            <p>Mensalidade: R$ {plan.monthly_payment}</p>
            <p>Adesão: R$ {plan.adesao}</p>
          </div>
        ))}
      </div>

      {/* Coberturas calculadas */}
      {coverages && selectedPlan && (
        <div className="mt-6 p-4 bg-gray-50">
          <h3 className="font-bold mb-4">Coberturas Calculadas:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <strong>Roubo e Furto (70%):</strong>
              <p>R$ {coverages.theft.toFixed(2)}</p>
            </div>
            <div>
              <strong>Colisão/Incêndio (7.5%):</strong>
              <p>R$ {coverages.collision.toFixed(2)}</p>
            </div>
            <div>
              <strong>Danos a Terceiros (7.5%):</strong>
              <p>R$ {coverages.third_party.toFixed(2)}</p>
            </div>
            <div>
              <strong>Assistência 24H (7.5%):</strong>
              <p>R$ {coverages.assistance.toFixed(2)}</p>
            </div>
            <div>
              <strong>Vidros (7.5%):</strong>
              <p>R$ {coverages.glass.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};