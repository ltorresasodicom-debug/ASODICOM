'use client';
import { useState } from 'react';
import { apiSigel } from '@/lib/api';
import { Megaphone, CheckCircle2 } from 'lucide-react';

const PREGUNTAS = [
  { code: 'confianza', label: '¿Confía usted en la gestión de su alcalde/prefecto?' },
  { code: 'transparencia', label: '¿Considera transparente la gestión?' },
  { code: 'satisfaccion', label: '¿Cómo evalúa la calidad de servicios públicos?' },
  { code: 'participacion', label: '¿Siente que su opinión cuenta?' },
  { code: 'corrupcion', label: '¿Percibe corrupción en la administración local?' },
  { code: 'servicios', label: 'Evaluación general de servicios (agua, basura, vías)' },
];

export default function EncuestasPage() {
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [gadId, setGadId] = useState<number>(1);
  const [enviado, setEnviado] = useState(false);

  const setResp = (k: string, v: number) => setRespuestas((r) => ({ ...r, [k]: v }));

  const submit = async () => {
    await apiSigel.enviarEncuesta({
      encuestaId: 1,
      gadId,
      ...respuestas,
      canal: 'WEB',
    });
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h1 className="font-display font-bold text-3xl">¡Gracias por participar!</h1>
        <p className="text-slate-600 mt-3 max-w-md mx-auto">
          Tu respuesta ha sido registrada de forma anónima y contribuye al
          Índice de Legitimidad Democrática Local del Ecuador.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8 flex items-center gap-3">
        <Megaphone className="w-8 h-8 text-sigel-accent" />
        <div>
          <h1 className="font-display font-bold text-3xl">Encuesta Ciudadana SIGEL</h1>
          <p className="text-slate-600">
            Tu evaluación es anónima y constituye el 25 % del INGEL.
          </p>
        </div>
      </header>

      <div className="card mb-6">
        <label className="block text-sm font-medium mb-2">GAD a evaluar (ID)</label>
        <input
          type="number"
          value={gadId}
          onChange={(e) => setGadId(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>

      {PREGUNTAS.map((p) => (
        <div key={p.code} className="card mb-4">
          <p className="font-medium mb-3">{p.label}</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setResp(p.code, v)}
                className={`py-3 rounded-lg border text-center font-semibold transition ${
                  respuestas[p.code] === v
                    ? 'bg-sigel-primary text-white border-sigel-primary'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-sigel-primary'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Muy malo</span><span>Muy bueno</span>
          </div>
        </div>
      ))}

      <button
        disabled={Object.keys(respuestas).length < PREGUNTAS.length}
        onClick={submit}
        className="w-full mt-4 bg-sigel-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-800"
      >
        Enviar evaluación
      </button>
    </div>
  );
}
