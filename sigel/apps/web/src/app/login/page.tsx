'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogIn, UserPlus, Mail, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import { apiSigel, persistSession } from '@/lib/api';

type Tab = 'login' | 'registro';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    mfaToken: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submitLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiSigel.login(form.email, form.password, form.mfaToken || undefined);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (!res.accessToken) {
        // El gateway responde MFA requerido cuando la cuenta lo tiene activo
        setNeedsMfa(true);
        setError('Ingresa tu código de verificación (MFA).');
        return;
      }
      persistSession(res);
      router.push('/dashboard');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (typeof msg === 'string' && msg.toLowerCase().includes('mfa')) {
        setNeedsMfa(true);
        setError('Ingresa tu código de verificación (MFA).');
      } else {
        setError('No fue posible iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async () => {
    setError('');
    setOkMsg('');
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await apiSigel.register(form.email, form.password, form.nombre || undefined);
      setOkMsg('Cuenta creada. Ahora puedes iniciar sesión.');
      setTab('login');
    } catch (e: any) {
      setError(
        e?.response?.status === 409
          ? 'Ese correo ya está registrado.'
          : 'No fue posible crear la cuenta. Intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <header className="text-center mb-8">
        <Shield className="w-12 h-12 mx-auto text-sigel-primary" />
        <h1 className="font-display font-bold text-3xl mt-3">Acceso a SIGEL</h1>
        <p className="text-slate-600 mt-2 text-sm">
          Ciudadanos, analistas e investigadores. El acceso público no requiere
          cuenta — esto habilita encuestas, denuncias y exportaciones.
        </p>
      </header>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6" role="tablist">
        {(['login', 'registro'] as Tab[]).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              setTab(t);
              setError('');
              setOkMsg('');
              setNeedsMfa(false);
            }}
            className={`flex-1 py-2 rounded text-sm font-medium transition ${
              tab === t ? 'bg-sigel-primary text-white' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        {okMsg && (
          <div className="flex items-center gap-2 bg-green-50 text-green-800 text-sm rounded-lg p-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {okMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-800 text-sm rounded-lg p-3" role="alert">
            {error}
          </div>
        )}

        {tab === 'registro' && (
          <Field
            icon={UserPlus}
            label="Nombre (opcional)"
            value={form.nombre}
            onChange={v => set('nombre', v)}
            placeholder="Tu nombre"
          />
        )}

        <Field
          icon={Mail}
          label="Correo electrónico"
          type="email"
          value={form.email}
          onChange={v => set('email', v)}
          placeholder="ciudadano@ejemplo.ec"
        />

        <Field
          icon={Lock}
          label="Contraseña"
          type="password"
          value={form.password}
          onChange={v => set('password', v)}
          placeholder={tab === 'registro' ? 'Mínimo 8 caracteres' : '••••••••'}
          onEnter={tab === 'login' ? submitLogin : submitRegister}
        />

        {tab === 'login' && needsMfa && (
          <Field
            icon={KeyRound}
            label="Código MFA"
            value={form.mfaToken}
            onChange={v => set('mfaToken', v)}
            placeholder="123456"
            onEnter={submitLogin}
          />
        )}

        <button
          disabled={loading || !form.email || !form.password}
          onClick={tab === 'login' ? submitLogin : submitRegister}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : tab === 'login' ? (
            <LogIn className="w-4 h-4" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {loading
            ? 'Procesando…'
            : tab === 'login'
              ? 'Iniciar sesión'
              : 'Crear cuenta'}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Al continuar aceptas el uso de la plataforma con fines de
          transparencia y control social.
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  onEnter,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  onEnter?: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && onEnter) onEnter();
          }}
          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sigel-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
