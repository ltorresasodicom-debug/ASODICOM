'use client';
import dynamic from 'next/dynamic';

// Leaflet sólo se carga en cliente
const MapaEcuador = dynamic(() => import('@/components/MapaEcuador'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-slate-100 rounded-card">
      Cargando mapa…
    </div>
  ),
});

export default function MapaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display font-bold text-3xl">Mapa Nacional de Desempeño</h1>
        <p className="text-slate-600 mt-2">
          Visualización geoespacial del INGEL por provincia y cantón. Capas
          disponibles: transparencia, finanzas, servicios, participación.
        </p>
      </header>
      <div className="card p-0 overflow-hidden">
        <MapaEcuador />
      </div>
    </div>
  );
}
