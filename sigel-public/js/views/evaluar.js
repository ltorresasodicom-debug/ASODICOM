// SIGEL — Vista de evaluación ciudadana
//
// Permite al ciudadano evaluar cualquier GAD en escala Likert 1-5 sobre las
// 8 dimensiones SIGEL, ver el INGEL en vivo y guardar localmente.
import {
  DIMENSIONES, calcularIngel, likertA100,
  clasificarNivel, semaforizar, calcularIri,
} from '../ingel.js';
import { guardarEvaluacion, obtenerEvaluaciones, borrarEvaluacion, exportarEvaluaciones } from '../data.js';

export function viewEvaluar(state) {
  const params = new URLSearchParams(state.routeQuery || '');
  const preselectId = params.get('gad') || '';
  const evaluaciones = obtenerEvaluaciones();

  // Estado de evaluación (en memoria)
  state.evaluacion = state.evaluacion || {
    gadId: preselectId,
    likert: Object.fromEntries(DIMENSIONES.map(d => [d.codigo, null])),
    comentario: '',
  };

  // Calcular preview del INGEL
  const likert = state.evaluacion.likert;
  const dims100 = Object.fromEntries(
    DIMENSIONES.map(d => [d.codigo, likertA100(likert[d.codigo])])
  );
  const completas = Object.values(likert).filter(v => v != null).length;
  const todasResp = completas === DIMENSIONES.length;
  const ingelPreview = todasResp ? calcularIngel(dims100) : null;
  const nivel = ingelPreview != null ? clasificarNivel(ingelPreview) : null;
  const sem = ingelPreview != null ? semaforizar(ingelPreview) : null;
  const iri = todasResp ? calcularIri({
    transparencia: dims100.transparencia,
    finanzas: dims100.finanzas,
    endeudamiento: 100 - dims100.finanzas,
    corrupcion: 100 - dims100.legitimidad,
    participacion: dims100.participacion,
  }) : null;

  return /*html*/`
  <div class="max-w-5xl mx-auto px-4 py-8 fade-in">
    <header class="mb-6">
      <h1 class="font-display font-bold text-3xl">📋 Crea tu evaluación</h1>
      <p class="text-slate-600 mt-2 max-w-2xl">
        Califica del 1 al 5 cada una de las 8 dimensiones SIGEL. El cálculo
        del INGEL es inmediato. Tu evaluación se guarda <strong>sólo en tu
        navegador</strong> — es privada y puedes exportarla cuando quieras.
      </p>
    </header>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- ── Formulario ── -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card">
          <label class="block font-semibold mb-2">Selecciona el GAD a evaluar</label>
          <select
            onchange="window.SIGEL.setEvalGad(this.value)"
            class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sigel-primary focus:outline-none"
          >
            <option value="">— Elige un GAD —</option>
            <optgroup label="Prefecturas (provincial)">
              ${state.data.provincias.map(p => /*html*/`
                <option value="${p.id}" ${state.evaluacion.gadId === p.id ? 'selected' : ''}>${p.provincia} — ${p.autoridad}</option>
              `).join('')}
            </optgroup>
            <optgroup label="Cantones (municipal)">
              ${state.data.cantones
                .slice()
                .sort((a, b) => a.canton.localeCompare(b.canton))
                .map(c => /*html*/`
                  <option value="${c.id}" ${state.evaluacion.gadId === c.id ? 'selected' : ''}>${c.canton} (${c.provincia}) — ${c.autoridad}</option>
                `).join('')}
            </optgroup>
          </select>
        </div>

        ${DIMENSIONES.map(d => {
          const v = likert[d.codigo];
          return /*html*/`
          <div class="card">
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="font-semibold">
                  <span class="inline-block w-3 h-3 rounded mr-2 align-middle" style="background:${d.color}"></span>
                  ${d.nombre}
                </div>
                <p class="text-xs text-slate-500 mt-1">Peso en el INGEL: ${(d.peso * 100).toFixed(0)}%</p>
              </div>
              ${v != null ? /*html*/`<span class="font-mono text-2xl font-bold">${v}/5</span>` : ''}
            </div>
            <div class="likert">
              ${[1, 2, 3, 4, 5].map(n => /*html*/`
                <button
                  onclick="window.SIGEL.setLikert('${d.codigo}', ${n})"
                  class="${v === n ? 'selected' : ''}"
                  aria-label="${d.nombre} - ${n} de 5">
                  ${n}
                </button>
              `).join('')}
            </div>
            <div class="flex justify-between text-xs text-slate-500 mt-1.5 px-1">
              <span>Muy malo</span><span>Muy bueno</span>
            </div>
          </div>
        `;
        }).join('')}

        <div class="card">
          <label class="block font-semibold mb-2">Comentario (opcional)</label>
          <textarea
            rows="4"
            placeholder="Comparte el contexto de tu evaluación: qué observas, qué propones, etc."
            oninput="window.SIGEL.setEvalComentario(this.value)"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sigel-primary focus:outline-none"
          >${escapeHtml(state.evaluacion.comentario || '')}</textarea>
        </div>

        <button
          ${(!todasResp || !state.evaluacion.gadId) ? 'disabled' : ''}
          onclick="window.SIGEL.guardarEvaluacion()"
          class="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
          💾 Guardar mi evaluación
        </button>
      </div>

      <!-- ── Preview INGEL en vivo ── -->
      <aside class="lg:col-span-1">
        <div class="card sticky top-24">
          <h2 class="font-display font-semibold text-lg mb-3">Tu INGEL en vivo</h2>

          <div class="text-center bg-slate-50 rounded-lg p-5 mb-4">
            <div class="text-xs uppercase tracking-widest text-slate-500">Puntaje INGEL</div>
            <div class="font-display font-extrabold text-5xl mt-1 ${ingelPreview == null ? 'text-slate-300' : 'text-sigel-primary'}">
              ${ingelPreview != null ? ingelPreview.toFixed(1) : '—'}
            </div>
            ${nivel ? /*html*/`<span class="badge badge-${nivel} mt-2">${nivel}</span>` : ''}
            ${sem ? /*html*/`
              <div class="mt-3">
                <span class="semaforo-dot semaforo-${sem}" style="width:24px;height:24px"></span>
              </div>` : ''}
          </div>

          <div class="text-xs text-slate-500 mb-3">
            Progreso: <strong>${completas} / ${DIMENSIONES.length}</strong> dimensiones evaluadas
          </div>
          <div class="bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
            <div class="bg-sigel-primary h-full rounded-full transition-all" style="width:${(completas / DIMENSIONES.length) * 100}%"></div>
          </div>

          ${iri != null ? /*html*/`
            <div class="text-sm space-y-1">
              <div class="flex justify-between"><span class="text-slate-500">IRI (riesgo)</span><span class="font-mono font-semibold ${iri > 60 ? 'text-red-600' : iri > 40 ? 'text-yellow-600' : 'text-green-600'}">${iri.toFixed(1)}</span></div>
            </div>
          ` : ''}

          <p class="text-xs text-slate-400 mt-4">
            Cálculo: INGEL = Σ(dimensión × peso). Tu Likert 1-5 se normaliza a una escala 0-100.
          </p>
        </div>
      </aside>
    </div>

    <!-- ── Evaluaciones guardadas ── -->
    <section class="mt-12">
      <div class="flex items-end justify-between mb-4">
        <h2 class="font-display font-bold text-2xl">Mis evaluaciones guardadas</h2>
        ${evaluaciones.length > 0 ? /*html*/`
          <div class="flex gap-2">
            <button onclick="window.SIGEL.exportar()" class="text-sm px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded">📤 Exportar JSON</button>
            <button onclick="window.SIGEL.imprimir()" class="text-sm px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded">🖨️ Imprimir</button>
          </div>` : ''}
      </div>

      ${evaluaciones.length === 0 ? /*html*/`
        <div class="card text-center text-slate-500 py-8">
          Aún no has guardado evaluaciones. Completa el formulario arriba y haz clic en "Guardar".
        </div>
      ` : /*html*/`
        <div class="space-y-3">
          ${evaluaciones.slice().reverse().map(e => {
            const gad = state.data.gads.find(g => g.id === e.gadId);
            return /*html*/`
              <div class="card flex flex-wrap items-center gap-3">
                <div class="flex-1 min-w-[240px]">
                  <div class="font-semibold">${gad ? gad.nombre : 'GAD desconocido'}</div>
                  <div class="text-xs text-slate-500">
                    ${new Date(e.fecha).toLocaleString('es-EC')} · INGEL ciudadano:
                    <strong>${e.ingel != null ? e.ingel.toFixed(1) : '—'}</strong>
                  </div>
                  ${e.comentario ? /*html*/`<p class="text-xs text-slate-600 mt-1 italic">"${escapeHtml(e.comentario)}"</p>` : ''}
                </div>
                <span class="badge badge-${e.nivel}">${e.nivel}</span>
                <span class="semaforo-dot semaforo-${e.semaforo}"></span>
                <button onclick="window.SIGEL.borrarEvaluacion('${e.id}')" class="text-red-600 hover:text-red-800 text-sm px-2">🗑️</button>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </section>
  </div>
  `;
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
