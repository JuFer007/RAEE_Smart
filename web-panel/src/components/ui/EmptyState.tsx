import type { ReactNode } from 'react';
import Icon from '../Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`ui-empty${compact ? ' ui-empty--compact' : ''}`}>
      <Icon name={icon} size={compact ? 22 : 28} strokeWidth={1.4} />
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action ? <div className="ui-empty__action">{action}</div> : null}
    </div>
  );
}
