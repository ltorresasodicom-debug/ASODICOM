// =============================================================================
// SIGEL — Public demo · Bootstrap del SPA
// =============================================================================
import { loadData, guardarEvaluacion as _guardar, borrarEvaluacion as _borrar, exportarEvaluaciones } from './data.js';
import {
  DIMENSIONES, calcularIngel, likertA100,
  clasificarNivel, semaforizar, calcularIri,
} from './ingel.js';
import { viewHome } from './views/home.js';
import { viewRanking } from './views/ranking.js';
import { viewMapa, mountMapa } from './views/mapa.js';
import { viewGad } from './views/gad.js';
import { viewEvaluar } from './views/evaluar.js';
import { viewMetodologia } from './views/metodologia.js';

const state = {
  data: null,
  route: 'home',
  routeParams: null,
  routeQuery: '',
  filters: { q: '', tipoGad: 'TODOS', provincia: 'TODAS' },
  evaluacion: null,
};

// ─── Inicialización ─────────────────────────────────────────────────────────
async function init() {
  try {
    state.data = await loadData();
    window.addEventListener('hashchange', router);
    document.getElementById('menu-mobile-btn')?.addEventListener('click', () => {
      document.getElementById('menu-mobile').classList.toggle('hidden');
    });
    router();
  } catch (err) {
    document.getElementById('app').innerHTML = /*html*/`
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 class="font-display font-bold text-2xl text-red-600">Error de carga</h1>
        <p class="text-slate-600 mt-3">No fue posible cargar los datos. Detalle:</p>
        <pre class="text-left bg-red-50 p-4 rounded mt-3 text-xs overflow-auto">${String(err.message || err)}</pre>
      </div>
    `;
    console.error(err);
  }
}

// ─── Router por hash ───────────────────────────────────────────────────────
function router() {
  const hash = window.location.hash.slice(1) || '/';
  const [path, query] = hash.split('?');
  state.routeQuery = query || '';

  const parts = path.split('/').filter(Boolean);

  // Actualiza navegación activa
  document.querySelectorAll('[data-route]').forEach(a => a.classList.remove('active'));

  let html;
  if (parts.length === 0 || parts[0] === '') {
    state.route = 'home';
    html = viewHome(state);
  } else if (parts[0] === 'ranking') {
    state.route = 'ranking';
    html = viewRanking(state);
  } else if (parts[0] === 'mapa') {
    state.route = 'mapa';
    html = viewMapa(state);
  } else if (parts[0] === 'gad' && parts[1]) {
    state.route = 'gad';
    state.routeParams = { id: parts[1] };
    html = viewGad(state, parts[1]);
  } else if (parts[0] === 'evaluar') {
    state.route = 'evaluar';
    html = viewEvaluar(state);
  } else if (parts[0] === 'metodologia') {
    state.route = 'metodologia';
    html = viewMetodologia();
  } else {
    html = /*html*/`<div class="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 class="font-display font-bold text-2xl">404 — Ruta no encontrada</h1>
      <p class="text-slate-600 mt-3"><a href="#/" class="text-sigel-primary">Volver al inicio →</a></p>
    </div>`;
  }

  document.getElementById('app').innerHTML = html;
  window.scrollTo(0, 0);

  // Marca el link activo
  document.querySelectorAll(`[data-route="${state.route}"]`).forEach(a => a.classList.add('active'));

  // Mount post-render (Leaflet)
  if (state.route === 'mapa') {
    mountMapa(state).catch(console.error);
  }
}

// ─── API global para handlers inline ───────────────────────────────────────
window.SIGEL = {
  setFilter(key, value) {
    state.filters[key] = value;
    if (state.route === 'ranking') router();
  },
  setEvalGad(gadId) {
    state.evaluacion.gadId = gadId;
    router();
  },
  setLikert(codigo, valor) {
    state.evaluacion.likert[codigo] = valor;
    router();
  },
  setEvalComentario(texto) {
    state.evaluacion.comentario = texto;
    // No re-render para preservar foco del textarea
  },
  guardarEvaluacion() {
    const ev = state.evaluacion;
    if (!ev.gadId) { alert('Selecciona un GAD primero.'); return; }
    const dims100 = Object.fromEntries(
      DIMENSIONES.map(d => [d.codigo, likertA100(ev.likert[d.codigo])])
    );
    const ingel = calcularIngel(dims100);
    const nivel = clasificarNivel(ingel);
    const semaforo = semaforizar(ingel);
    const iri = calcularIri({
      transparencia: dims100.transparencia,
      finanzas: dims100.finanzas,
      endeudamiento: 100 - dims100.finanzas,
      corrupcion: 100 - dims100.legitimidad,
      participacion: dims100.participacion,
    });
    _guardar({
      gadId: ev.gadId,
      likert: { ...ev.likert },
      dims100,
      comentario: ev.comentario || '',
      ingel,
      nivel,
      semaforo,
      iri,
    });
    // Reset
    state.evaluacion = {
      gadId: '',
      likert: Object.fromEntries(DIMENSIONES.map(d => [d.codigo, null])),
      comentario: '',
    };
    router();
    setTimeout(() => alert('✅ Evaluación guardada en tu navegador.'), 50);
  },
  borrarEvaluacion(id) {
    if (!confirm('¿Eliminar esta evaluación?')) return;
    _borrar(id);
    router();
  },
  exportar() {
    const json = exportarEvaluaciones();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sigel-evaluaciones-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  imprimir() { window.print(); },
};

init();
