import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper?: string;
  accent?: 'verde' | 'amarillo' | 'rojo' | 'azul';
}

const accents = {
  verde: 'text-green-700 bg-green-50',
  amarillo: 'text-yellow-700 bg-yellow-50',
  rojo: 'text-red-700 bg-red-50',
  azul: 'text-blue-700 bg-blue-50',
};

export function StatCard({ icon: Icon, label, value, helper, accent = 'azul' }: Props) {
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-lg ${accents[accent]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-display font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600 mt-1">{label}</div>
      {helper && <div className="text-xs text-slate-400 mt-1">{helper}</div>}
    </div>
  );
}
