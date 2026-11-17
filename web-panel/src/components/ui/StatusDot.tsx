export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusDotProps {
  tone: StatusTone;
  label: string;
}

export default function StatusDot({ tone, label }: StatusDotProps) {
  return (
    <span className={`ui-status ui-status--${tone}`}>
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
