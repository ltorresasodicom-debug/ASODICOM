'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiSigel, ScoringRanking } from '@/lib/api';
import { Semaforo } from '@/components/Semaforo';
import { Search, Filter } from 'lucide-react';

export default function RankingPage() {
  const [filtro, setFiltro] = useState<'TODOS' | 'MUNICIPAL' | 'PROVINCIAL'>('TODOS');
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['ranking-completo'],
    queryFn: () => apiSigel.rankingNacional(500, 0),
  });

  const filtrados = (data ?? [])
    .filter((r) => filtro === 'TODOS' || r.gad_tipo === filtro)
    .filter((r) => !q || r.gad_nombre.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display font-bold text-3xl">Ranking Nacional INGEL</h1>
        <p className="text-slate-600 mt-2">
          Posicionamiento de los GAD del Ecuador según el Índice Nacional de Gestión Local.
        </p>
      </header>

      <div className="card mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar GAD por nombre…"
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sigel-primary"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['TODOS', 'MUNICIPAL', 'PROVINCIAL'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFiltro(opt)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                filtro === opt ? 'bg-sigel-primary text-white' : 'text-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">GAD</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Provincia</th>
              <th className="px-4 py-3 text-right">INGEL</th>
              <th className="px-4 py-3 text-center">Nivel</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Cargando…</td></tr>
            )}
            {filtrados.map((row: ScoringRanking) => (
              <tr key={row.gad_id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono">{row.posicion}</td>
                <td className="px-4 py-3 font-medium">
                  <a href={`/autoridad/${row.gad_id}`} className="hover:text-sigel-primary">{row.gad_nombre}</a>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.gad_tipo}</td>
                <td className="px-4 py-3 text-slate-600">{row.provincia}</td>
                <td className="px-4 py-3 text-right font-mono font-bold">{Number(row.ingel).toFixed(1)}</td>
                <td className="px-4 py-3 text-center"><span className="badge bg-slate-100 text-slate-700">{row.nivel_desempeno}</span></td>
                <td className="px-4 py-3 text-center"><Semaforo estado={row.semaforo} /></td>
              </tr>
            ))}
            {!isLoading && filtrados.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
