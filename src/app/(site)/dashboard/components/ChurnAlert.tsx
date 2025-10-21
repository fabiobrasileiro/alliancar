import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ChurnAlertProps {
  count: number;
}

export default function ChurnAlert({ count }: ChurnAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Alerta de Risco de Churn
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {count} cliente(s) identificado(s) com risco de cancelamento. 
            Ação recomendada para retenção.
          </p>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="text-red-600 hover:text-red-800 ml-4"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}