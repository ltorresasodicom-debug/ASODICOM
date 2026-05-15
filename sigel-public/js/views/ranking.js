// SIGEL — Vista Ranking
export function viewRanking(state) {
  const filtro = state.filters?.tipoGad || 'TODOS';
  const provincia = state.filters?.provincia || 'TODAS';
  const q = (state.filters?.q || '').toLowerCase();

  let lista = [...state.data.gads];
  if (filtro !== 'TODOS') lista = lista.filter(g => g.tipo === filtro);
  if (provincia !== 'TODAS') lista = lista.filter(g => g.provincia === provincia);
  if (q) lista = lista.filter(g =>
    (g.nombre + ' ' + (g.autoridad || '')).toLowerCase().includes(q)
  );
  lista.sort((a, b) => b.ingel - a.ingel);

  const provincias = [...new Set(state.data.gads.map(g => g.provincia))].sort();

  return /*html*/`
  <div class="max-w-7xl mx-auto px-4 py-8 fade-in">
    <header class="mb-6">
      <h1 class="font-display font-bold text-3xl">Ranking Nacional INGEL</h1>
      <p class="text-slate-600 mt-2">
        Posicionamiento de los <strong>${state.data.gads.length} GADs</strong>
        del Ecuador según el Índice Nacional de Gestión Local.
      </p>
    </header>

    <div class="card mb-6">
      <div class="grid md:grid-cols-3 gap-3">
        <input
          type="search"
          placeholder="🔍 Buscar GAD o autoridad…"
          value="${q}"
          oninput="window.SIGEL.setFilter('q', this.value)"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sigel-primary focus:outline-none"
        />
        <select
          onchange="window.SIGEL.setFilter('tipoGad', this.value)"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sigel-primary focus:outline-none">
          <option value="TODOS" ${filtro === 'TODOS' ? 'selected' : ''}>Todos los GADs</option>
          <option value="MUNICIPAL" ${filtro === 'MUNICIPAL' ? 'selected' : ''}>Solo cantones</option>
          <option value="PROVINCIAL" ${filtro === 'PROVINCIAL' ? 'selected' : ''}>Solo prefecturas</option>
        </select>
        <select
          onchange="window.SIGEL.setFilter('provincia', this.value)"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sigel-primary focus:outline-none">
          <option value="TODAS" ${provincia === 'TODAS' ? 'selected' : ''}>Todas las provincias</option>
          ${provincias.map(p => /*html*/`<option value="${p}" ${provincia === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <p class="text-xs text-slate-500 mt-3">Mostrando ${lista.length} de ${state.data.gads.length} GADs.</p>
    </div>

    <div class="card p-0 overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-100 text-slate-700">
          <tr>
            <th class="px-4 py-3 text-left">#</th>
            <th class="px-4 py-3 text-left">GAD</th>
            <th class="px-4 py-3 text-left">Autoridad</th>
            <th class="px-4 py-3 text-left hidden md:table-cell">Provincia</th>
            <th class="px-4 py-3 text-right">INGEL</th>
            <th class="px-4 py-3 text-center hidden sm:table-cell">Nivel</th>
            <th class="px-4 py-3 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map((g, i) => /*html*/`
            <tr class="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onclick="location.hash='#/gad/${g.id}'">
              <td class="px-4 py-3 font-mono text-slate-500">${i + 1}</td>
              <td class="px-4 py-3 font-medium">
                <div>${g.nombre}</div>
                <div class="text-xs text-slate-400 md:hidden">${g.provincia}</div>
              </td>
              <td class="px-4 py-3 text-slate-600">${g.autoridad || '—'}</td>
              <td class="px-4 py-3 text-slate-600 hidden md:table-cell">${g.provincia}</td>
              <td class="px-4 py-3 text-right font-mono font-bold">${g.ingel.toFixed(1)}</td>
              <td class="px-4 py-3 text-center hidden sm:table-cell">
                <span class="badge badge-${g.nivel}">${g.nivel}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="semaforo-dot semaforo-${g.semaforo}"></span>
              </td>
            </tr>
          `).join('')}
          ${lista.length === 0 ? /*html*/`
            <tr><td colspan="7" class="px-4 py-12 text-center text-slate-500">Sin resultados con esos filtros.</td></tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  </div>
  `;
}
