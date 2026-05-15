'use client';
import { useQuery } from '@tanstack/react-query';
import { apiSigel } from '@/lib/api';
import { Semaforo } from '@/components/Semaforo';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { use } from 'react';

export default function AutoridadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const gadId = Number(id);
  const gad = useQuery({ queryKey: ['gad', gadId], queryFn: () => apiSigel.gadDetalle(gadId) });
  const scoring = useQuery({ queryKey: ['scoring-gad', gadId], queryFn: () => apiSigel.scoringGad(gadId) });
  const evolucion = useQuery({ queryKey: ['evol-gad', gadId], queryFn: () => apiSigel.evolucionGad(gadId) });

  const dims = scoring.data ? [
    { dim: 'Transparencia', value: Number(scoring.data.transparencia) },
    { dim: 'Finanzas', value: Number(scoring.data.finanzas) },
    { dim: 'Servicios', value: Number(scoring.data.servicios) },
    { dim: 'Desarrollo', value: Number(scoring.data.desarrollo) },
    { dim: 'Gestión Inst.', value: Number(scoring.data.gestionInstitucional) },
    { dim: 'Participación', value: Number(scoring.data.participacion) },
    { dim: 'Legitimidad', value: Number(scoring.data.legitimidad) },
    { dim: 'Innovación', value: Number(scoring.data.innovacion) },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display font-bold text-3xl">{gad.data?.nombre ?? 'Cargando…'}</h1>
            <p className="text-slate-600">{gad.data?.tipo} · {gad.data?.provincia?.nombre}</p>
          </div>
          {scoring.data && (
            <div className="text-right">
              <div className="text-sm text-slate-500">INGEL</div>
              <div className="font-display font-bold text-5xl text-sigel-primary">
                {Number(scoring.data.ingel).toFixed(1)}
              </div>
              <Semaforo estado={scoring.data.semaforo} size="lg" />
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-display font-semibold text-lg mb-4">Perfil multidimensional</h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={dims}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar name="INGEL" dataKey="value" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-display font-semibold text-lg mb-4">Evolución histórica</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={evolucion.data ?? []}>
              <XAxis dataKey="fecha_corte" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="ingel" stroke="#1E3A8A" strokeWidth={3} />
              <Line type="monotone" dataKey="transparencia" stroke="#0F766E" />
              <Line type="monotone" dataKey="legitimidad" stroke="#D97706" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
