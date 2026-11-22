import type { ReactNode } from 'react';
import Icon from '../Icon';
import Card from './Card';
import EmptyState from './EmptyState';
import PageHeader from './PageHeader';

interface PlaceholderDetalle {
  icon: string;
  titulo: string;
  descripcion: string;
}

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  section?: string;
  details?: PlaceholderDetalle[];
  actions?: ReactNode;
}

export default function PlaceholderPage({
  title,
  description,
  icon = 'clock',
  emptyTitle = 'Próximamente',
  emptyDescription,
  section,
  details = [],
  actions,
}: PlaceholderPageProps) {
  const detalle = emptyDescription
    ? emptyDescription
    : `Este módulo ${section ? `de ${section} ` : ''}está en preparación. Pronto podrás consultarlo desde el panel.`;

  return (
    <section>
      <PageHeader title={title} description={description} actions={actions} />

      <div className="satisfaction-grid">
        <Card>
          <EmptyState icon={icon} title={emptyTitle} description={detalle} />
        </Card>

        {details.length ? (
          <Card>
            <header className="ui-card__header">
              <div>
                <h3>Qué incluirá</h3>
                <p>Funcionalidades previstas para este módulo.</p>
              </div>
            </header>
            <ul className="info-list">
              {details.map((item) => (
                <li key={item.titulo}>
                  <span className="info-list__icon">
                    <Icon name={item.icon} size={16} />
                  </span>
                  <div>
                    <strong>{item.titulo}</strong>
                    <small>{item.descripcion}</small>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
