import {
  DIAS_SEMANA,
  formatearHorario,
  type HorarioValor,
} from '../utils/horario';

interface HorarioEditorProps {
  valor: HorarioValor;
  onChange: (valor: HorarioValor) => void;
  id: string;
  error?: string;
  ayuda?: string;
  obligatorio?: boolean;
  permitirSinHorario?: boolean;
  textoSinHorario?: string;
}

export default function HorarioEditor({
  valor,
  onChange,
  id,
  error,
  ayuda,
  obligatorio = false,
  permitirSinHorario = true,
  textoSinHorario = 'Horario por confirmar',
}: HorarioEditorProps) {
  const deshabilitado = valor.sinHorario;

  const alternarDia = (dia: number) => {
    const dias = valor.dias.includes(dia)
      ? valor.dias.filter((actual) => actual !== dia)
      : [...valor.dias, dia].sort((a, b) => a - b);
    onChange({ ...valor, dias });
  };

  return (
    <div className="panel-field horario-editor">
      <span className="horario-etiqueta" id={`${id}-dias`}>
        Días de atención{obligatorio ? ' *' : ''}
      </span>

      <div className="horario-dias" role="group" aria-labelledby={`${id}-dias`}>
        {DIAS_SEMANA.map((dia) => (
          <label
            key={dia.id}
            className={`horario-dia${valor.dias.includes(dia.id) ? ' horario-dia--activo' : ''}`}
          >
            <input
              type="checkbox"
              checked={valor.dias.includes(dia.id)}
              disabled={deshabilitado}
              onChange={() => alternarDia(dia.id)}
              aria-label={dia.completo}
            />
            <span>{dia.corto}</span>
          </label>
        ))}
      </div>

      <div className="horario-acciones">
        <button
          type="button"
          className="horario-accion"
          disabled={deshabilitado}
          onClick={() => onChange({ ...valor, dias: [0, 1, 2, 3, 4] })}
        >
          Días laborables
        </button>
        <button
          type="button"
          className="horario-accion"
          disabled={deshabilitado}
          onClick={() => onChange({ ...valor, dias: [0, 1, 2, 3, 4, 5, 6] })}
        >
          Todos los días
        </button>
        <button
          type="button"
          className="horario-accion"
          disabled={deshabilitado}
          onClick={() => onChange({ ...valor, dias: [] })}
        >
          Limpiar
        </button>
      </div>

      <div className="horario-horas">
        <div className="panel-field">
          <label htmlFor={`${id}-inicio`}>Hora de inicio</label>
          <input
            id={`${id}-inicio`}
            type="time"
            min="08:00"
            max="18:00"
            step="900"
            value={valor.inicio}
            disabled={deshabilitado}
            onChange={(evento) => onChange({ ...valor, inicio: evento.target.value })}
          />
        </div>
        <div className="panel-field">
          <label htmlFor={`${id}-fin`}>Hora de fin</label>
          <input
            id={`${id}-fin`}
            type="time"
            min="08:00"
            max="18:00"
            step="900"
            value={valor.fin}
            disabled={deshabilitado}
            onChange={(evento) => onChange({ ...valor, fin: evento.target.value })}
          />
        </div>
      </div>

      {permitirSinHorario ? (
        <label className="horario-check">
          <input
            type="checkbox"
            checked={valor.sinHorario}
            onChange={(evento) => onChange({ ...valor, sinHorario: evento.target.checked })}
          />
          <span>{textoSinHorario}</span>
        </label>
      ) : null}

      {ayuda ? <small className="panel-field__ayuda">{ayuda}</small> : null}
      <small className="panel-field__ayuda horario-preview">
        Vista previa: <strong>{formatearHorario(valor) || 'Sin horario definido'}</strong>
      </small>
      {error ? <span className="panel-field__error">{error}</span> : null}
    </div>
  );
}
