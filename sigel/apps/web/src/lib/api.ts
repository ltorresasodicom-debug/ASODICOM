import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? '/api/gateway',
  timeout: 15_000,
});

api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('sigel.access');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export interface ScoringRanking {
  posicion: number;
  gad_id: number;
  gad_nombre: string;
  gad_tipo: 'MUNICIPAL' | 'PROVINCIAL';
  provincia: string;
  canton?: string;
  ingel: number;
  nivel_desempeno: 'EXCELENTE' | 'ALTO' | 'MEDIO' | 'BAJO' | 'CRITICO';
  semaforo: 'VERDE' | 'AMARILLO' | 'ROJO';
}

export interface EstadisticasNacionales {
  total_gads: number;
  total_municipales: number;
  total_provinciales: number;
  promedio_ingel: number;
  min_ingel: number;
  max_ingel: number;
  std_ingel: number;
  gads_verdes: number;
  gads_amarillos: number;
  gads_rojos: number;
}

export const apiSigel = {
  rankingNacional: (limit = 50, offset = 0) =>
    api.get<ScoringRanking[]>('/scoring/ranking/nacional', { params: { limit, offset } }).then(r => r.data),
  estadisticas: () =>
    api.get<EstadisticasNacionales>('/scoring/estadisticas').then(r => r.data),
  gadDetalle: (id: number) =>
    api.get(`/territorios/gads/${id}`).then(r => r.data),
  scoringGad: (id: number) =>
    api.get(`/scoring/gad/${id}`).then(r => r.data),
  evolucionGad: (id: number) =>
    api.get(`/scoring/gad/${id}/evolucion`).then(r => r.data),
  autoridades: (params?: { cargo?: string; provinciaId?: number }) =>
    api.get('/autoridades', { params }).then(r => r.data),
  alertas: (nivel?: string) =>
    api.get('/alertas', { params: { nivel } }).then(r => r.data),
  dimensiones: () =>
    api.get('/indicadores/dimensiones').then(r => r.data),
  enviarEncuesta: (payload: any) =>
    api.post('/encuestas/responder', payload).then(r => r.data),
  crearDenuncia: (payload: any) =>
    api.post('/denuncias', payload).then(r => r.data),
  buscarDenuncia: (codigo: string) =>
    api.get(`/denuncias/codigo/${codigo}`).then(r => r.data),

  // ── Autenticación (gateway: /api/v1/auth/*) ──
  login: (email: string, password: string, mfaToken?: string) =>
    api.post<LoginResponse>('/auth/login', { email, password, mfaToken }).then(r => r.data),
  register: (email: string, password: string, nombre?: string) =>
    api.post('/auth/register', { email, password, nombre }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: { id: number; email: string; nombre?: string; rol: string };
  error?: string;
}

/** Persiste la sesión devuelta por el gateway en localStorage. */
export function persistSession(res: LoginResponse) {
  if (typeof window === 'undefined' || !res.accessToken) return;
  window.localStorage.setItem('sigel.access', res.accessToken);
  if (res.refreshToken) window.localStorage.setItem('sigel.refresh', res.refreshToken);
  if (res.user) window.localStorage.setItem('sigel.user', JSON.stringify(res.user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  ['sigel.access', 'sigel.refresh', 'sigel.user'].forEach(k =>
    window.localStorage.removeItem(k),
  );
}

export function getStoredUser(): LoginResponse['user'] | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem('sigel.user') || 'null');
  } catch {
    return null;
  }
}
