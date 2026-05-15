import clsx from 'clsx';

interface Props {
  estado: 'VERDE' | 'AMARILLO' | 'ROJO' | null;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const styles = {
  VERDE: 'bg-semaforo-verde',
  AMARILLO: 'bg-semaforo-amarillo',
  ROJO: 'bg-semaforo-rojo',
};

const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' };

export function Semaforo({ estado, label, size = 'md' }: Props) {
  if (!estado) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-label={`Semáforo ${estado.toLowerCase()}`}
        className={clsx('rounded-full', styles[estado], sizes[size], 'ring-2 ring-white shadow-sm')}
      />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
