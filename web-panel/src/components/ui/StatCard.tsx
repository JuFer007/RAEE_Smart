import Icon from '../Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: string;
  icon?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export default function StatCard({
  label,
  value,
  description,
  trend,
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
      {trend ? <span className="ui-stat__trend">{trend}</span> : null}
      {description ? <p>{description}</p> : null}
    </article>
  );
}
