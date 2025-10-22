import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600', 
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600'
};

export default function MetricCard({ title, value, icon: Icon, description, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}