// SIGEL — Vista Mapa interactivo (Leaflet)
import { COLOR_SEMAFORO } from '../ingel.js';

export function viewMapa(state) {
  // Renderiza el contenedor; el mapa se monta después en mountMapa()
  return /*html*/`
  <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <header class="mb-6">
      <h1 class="font-display font-bold text-3xl">Mapa Nacional de Desempeño</h1>
      <p class="text-slate-600 mt-2">
        Distribución geográfica del INGEL en los ${state.data.gads.length} GADs del Ecuador.
        Haz clic en un marcador para ver detalle.
      </p>
    </header>

    <div class="card p-0 overflow-hidden">
      <div id="map"></div>
    </div>

    <div class="mt-4 flex flex-wrap gap-6 justify-center text-sm">
      <div class="flex items-center gap-2"><span class="semaforo-dot semaforo-VERDE"></span> Alto desempeño (INGEL ≥ 70)</div>
      <div class="flex items-center gap-2"><span class="semaforo-dot semaforo-AMARILLO"></span> Medio (50-69)</div>
      <div class="flex items-center gap-2"><span class="semaforo-dot semaforo-ROJO"></span> Crítico (&lt; 50)</div>
    </div>
  </div>
  `;
}

export async function mountMapa(state) {
  // Cargar Leaflet desde CDN si no está cargado
  if (!window.L) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const map = window.L.map('map', { scrollWheelZoom: true, minZoom: 5, maxZoom: 12 })
    .setView([-1.5, -78.5], 6);

  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap, © CartoDB',
  }).addTo(map);

  for (const g of state.data.gads) {
    const color = COLOR_SEMAFORO[g.semaforo] || '#94A3B8';
    const radius = Math.max(5, g.ingel / 8);
    window.L.circleMarker(g.coord, {
      radius,
      color,
      fillColor: color,
      fillOpacity: 0.55,
      weight: 1.5,
    })
      .bindPopup(/*html*/`
        <div class="text-sm">
          <div class="font-bold text-base">${g.nombre}</div>
          <div class="text-xs text-slate-500 mb-2">${g.provincia} · ${g.autoridad || '—'}</div>
          <div>INGEL: <strong>${g.ingel.toFixed(1)}</strong> · ${g.nivel}</div>
          <a href="#/gad/${g.id}" class="block mt-2 text-sigel-primary font-semibold">Ver perfil →</a>
        </div>
      `)
      .addTo(map);
  }
}
