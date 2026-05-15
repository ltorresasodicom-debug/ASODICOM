'use client';
import { useState } from 'react';
import { apiSigel } from '@/lib/api';
import { AlertTriangle, Lock, Search, CheckCircle2 } from 'lucide-react';

const TIPOS = [
  'CORRUPCION', 'OPACIDAD', 'MAL_SERVICIO', 'ABUSO',
  'NEGLIGENCIA', 'OBRA_INCONCLUSA', 'MALA_GESTION', 'OTRO',
];

export default function DenunciasPage() {
  const [step, setStep] = useState<'crear' | 'seguimiento'>('crear');
  const [codigo, setCodigo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    gadId: 1, tipo: 'CORRUPCION', asunto: '', descripcion: '', anonima: true,
  });

  const enviar = async () => {
    const data = await apiSigel.crearDenuncia(form);
    setResult(data);
  };

  const buscar = async () => {
    const data = await apiSigel.buscarDenuncia(codigo);
    setResult(data);
  };

  if (result && step === 'crear' && result.codigoPublico) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h1 className="font-display font-bold text-3xl mb-2">Denuncia registrada</h1>
        <p className="text-slate-600 mb-6">Guarda este código para hacer seguimiento.</p>
        <div className="bg-slate-100 rounded-lg p-6 inline-block">
          <div className="text-xs uppercase tracking-widest text-slate-500">Código</div>
          <div className="font-mono font-bold text-3xl text-sigel-primary">{result.codigoPublico}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="mb-6 flex items-center gap-3">
        <AlertTriangle className="w-8 h-8 text-sigel-danger" />
        <div>
          <h1 className="font-display font-bold text-3xl">Denuncias Ciudadanas</h1>
          <p className="text-slate-600">Reporta irregularidades de tu gobierno local.</p>
        </div>
      </header>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6">
        {(['crear', 'seguimiento'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setStep(t); setResult(null); }}
            className={`flex-1 py-2 rounded text-sm font-medium ${step === t ? 'bg-sigel-primary text-white' : ''}`}
          >
            {t === 'crear' ? 'Crear denuncia' : 'Seguimiento por código'}
          </button>
        ))}
      </div>

      {step === 'crear' ? (
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">GAD a denunciar (ID)</label>
            <input type="number" value={form.gadId}
              onChange={(e) => setForm({...form, gadId: Number(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg">
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Asunto</label>
            <input value={form.asunto} maxLength={300}
              onChange={(e) => setForm({...form, asunto: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción detallada</label>
            <textarea rows={6} value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.anonima}
              onChange={(e) => setForm({...form, anonima: e.target.checked})} />
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-sm">Enviar de forma anónima</span>
          </label>
          <button onClick={enviar} className="btn-primary w-full">Enviar denuncia</button>
        </div>
      ) : (
        <div className="card">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="SIGEL-XXXXXXXX"
                className="w-full pl-10 pr-3 py-2 border rounded-lg" />
            </div>
            <button onClick={buscar} className="btn-primary">Buscar</button>
          </div>
          {result && (
            <div className="mt-6 space-y-2 text-sm">
              <div><strong>Asunto:</strong> {result.asunto}</div>
              <div><strong>Estado:</strong> <span className="badge bg-slate-100">{result.estado}</span></div>
              <div><strong>Creada:</strong> {new Date(result.createdAt).toLocaleDateString('es-EC')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
