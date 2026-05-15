import { FileSearch, Building2, ScrollText, Banknote, BarChart3 } from 'lucide-react';

export default function TransparenciaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-display font-bold text-3xl flex items-center gap-3">
          <FileSearch className="w-8 h-8 text-sigel-primary" /> Transparencia Digital
        </h1>
        <p className="text-slate-600 mt-2 max-w-3xl">
          Explora los documentos públicos recolectados automáticamente por SIGEL
          desde portales LOTAIP de los 218 cantones y 23 prefecturas del Ecuador.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tarjeta icon={Building2} titulo="GADs monitoreados" valor="241" />
        <Tarjeta icon={ScrollText} titulo="Documentos indexados" valor="—" helper="Actualizado diariamente" />
        <Tarjeta icon={Banknote} titulo="Presupuestos publicados" valor="—" />
        <Tarjeta icon={BarChart3} titulo="Cumplimiento LOTAIP promedio" valor="—" />
      </div>

      <div className="card">
        <h2 className="font-display font-semibold mb-4">Buscador semántico</h2>
        <input
          type="search"
          placeholder="Buscar documentos por palabra clave (ej. presupuesto 2024, PDOT Cuenca, rendición)…"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sigel-primary"
        />
        <p className="text-xs text-slate-500 mt-2">
          Indexado con tsvector en español, full-text search sobre texto extraído por OCR.
        </p>
      </div>
    </div>
  );
}

function Tarjeta({ icon: Icon, titulo, valor, helper }: any) {
  return (
    <div className="card">
      <Icon className="w-6 h-6 text-sigel-primary mb-2" />
      <div className="text-3xl font-display font-bold">{valor}</div>
      <div className="text-sm text-slate-600">{titulo}</div>
      {helper && <div className="text-xs text-slate-400 mt-1">{helper}</div>}
    </div>
  );
}
