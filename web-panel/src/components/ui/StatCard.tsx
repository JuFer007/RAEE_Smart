import Icon from '../Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export default function StatCard({
  label,
  value,
  description,
  icon,
  tone = 'neutral',
}: StatCardProps) {
  return (
    <article className={`ui-stat ui-stat--${tone}`}>
      <header>
        <span>{label}</span>
        {icon ? <Icon name={icon} size={16} /> : null}
      </header>
      <strong>{value}</strong>
      {description ? <p>{description}</p> : null}
    </article>
  );
}
