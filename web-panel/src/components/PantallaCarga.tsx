export default function PantallaCarga({ texto = 'Cargando panel...' }: { texto?: string }) {
  return (
    <div className="pantalla-carga" role="status" aria-live="polite">
      <span className="panel-spinner" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}
