'use client';
import { useQuery } from '@tanstack/react-query';
import { apiSigel } from '@/lib/api';
import { Activity, Building2, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#16A34A', '#F59E0B', '#DC2626'];

export default function DashboardPage() {
  const stats = useQuery({ queryKey: ['stats'], queryFn: apiSigel.estadisticas });
  const ranking = useQuery({ queryKey: ['ranking', 10], queryFn: () => apiSigel.rankingNacional(10, 0) });

  const s = stats.data;
  const distribucion = s
    ? [
        { name: 'Verde (alto)', value: Number(s.gads_verdes) },
        { name: 'Amarillo (medio)', value: Number(s.gads_amarillos) },
        { name: 'Rojo (crítico)', value: Number(s.gads_rojos) },
      ]
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-display font-bold text-3xl">Dashboard Nacional SIGEL</h1>
        <p className="text-slate-600 mt-2">
          Métricas agregadas del Índice Nacional de Gestión Local (INGEL) — actualizadas en tiempo real.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Building2} label="GADs evaluados" value={s?.total_gads ?? '—'} helper={`${s?.total_municipales ?? 0} municipales · ${s?.total_provinciales ?? 0} provinciales`} accent="azul" />
        <StatCard icon={Activity} label="INGEL promedio nacional" value={s ? Number(s.promedio_ingel).toFixed(1) : '—'} helper={`Desviación ±${s ? Number(s.std_ingel).toFixed(1) : '—'}`} accent="verde" />
        <StatCard icon={TrendingUp} label="Máximo INGEL" value={s ? Number(s.max_ingel).toFixed(1) : '—'} helper={`Mín ${s ? Number(s.min_ingel).toFixed(1) : '—'}`} accent="azul" />
        <StatCard icon={AlertTriangle} label="GADs en rojo" value={s?.gads_rojos ?? '—'} helper="Requieren intervención inmediata" accent="rojo" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-display font-semibold text-lg mb-4">Top 10 GADs por INGEL</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ranking.data ?? []} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="gad_nombre" tick={{ fontSize: 11 }} width={150} />
              <Tooltip />
              <Bar dataKey="ingel" fill="#1E3A8A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-display font-semibold text-lg mb-4">Semaforización nacional</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={distribucion}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {distribucion.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
