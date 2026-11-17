import Icon from '../../components/Icon';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';

const INDICADORES = [
  {
    icon: 'star',
    titulo: 'Satisfacción general',
    detalle: 'Promedio de valoración del servicio de recepción.',
  },
  {
    icon: 'clock',
    titulo: 'Tiempo de atención',
    detalle: 'Percepción del tiempo de espera en el punto de acopio.',
  },
  {
    icon: 'checkCircle',
    titulo: 'Claridad del proceso',
    detalle: 'Facilidad para registrar la entrega desde la app móvil.',
  },
  {
    icon: 'map',
    titulo: 'Accesibilidad',
    detalle: 'Comodidad de ubicación y horarios de los puntos.',
  },
];

export default function SatisfaccionPage() {
  return (
    <section>
      <PageHeader
        title="Satisfacción ciudadana"
        description="Resultados de las encuestas que responden los ciudadanos después de entregar sus aparatos."
      />

      <div className="satisfaction-grid">
        <Card>
          <EmptyState
            icon="star"
            title="Aún no hay encuestas disponibles"
            description="La medición de satisfacción se habilitará cuando el módulo de encuestas esté activo. Mientras tanto, este espacio queda preparado para mostrar los resultados."
          />
        </Card>

        <Card>
          <header className="ui-card__header">
            <div>
              <h3>Qué se medirá</h3>
              <p>Indicadores previstos para este módulo.</p>
            </div>
          </header>
          <ul className="info-list">
            {INDICADORES.map((item) => (
              <li key={item.titulo}>
                <span className="info-list__icon">
                  <Icon name={item.icon} size={16} />
                </span>
                <div>
                  <strong>{item.titulo}</strong>
                  <small>{item.detalle}</small>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
