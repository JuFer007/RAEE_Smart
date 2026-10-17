import React, { useMemo, useState } from 'react';
import Topbar from '../components/Topbar';
import EntregaTable from '../components/EntregaTable';
import ExportButton from '../components/ExportButton';
import { Card } from '../components/Card';
import Icon from '../components/Icon';
import { COLORS, FUENTES, RADIOS, TIPOS_RAEE, ESTADOS_ENTREGA } from '../theme';
import { ENTREGAS } from '../data/mockData';

const FILTROS_ESTADO = [
  { clave: 'TODAS', label: 'Todas' },
  { clave: 'CONFIRMADA', label: 'Certificadas' },
  { clave: 'EN_PROCESO', label: 'En proceso' },
  { clave: 'REGISTRADA', label: 'Registradas' },
  { clave: 'RECHAZADA', label: 'Rechazadas' },
];

export default function Entregas() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return [...ENTREGAS]
      .filter((e) => (filtroEstado === 'TODAS' ? true : e.estado === filtroEstado))
      .filter((e) => (filtroTipo === 'TODOS' ? true : e.tipoRaee === filtroTipo))
      .filter((e) => {
        if (!q) return true;
        return [e.usuarioNombre, e.dni, e.nombreCategoriaVisible, e.puntoRecoleccionNombre, e.certificadoCodigoQr]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
  }, [busqueda, filtroEstado, filtroTipo]);

  const conteoEstado = (clave) =>
    clave === 'TODAS' ? ENTREGAS.length : ENTREGAS.filter((e) => e.estado === clave).length;

  return (
    <>
      <Topbar
        titulo="Entregas"
        subtitulo="Historial completo de entregas de RAEE registradas"
        acciones={<ExportButton datos={filtradas} nombreArchivo="entregas-filtradas.csv" />}
      />

      <div className="panel-content fade-in">
        <Card>
          <div style={styles.controles}>
            <div style={styles.buscador}>
              <Icon name="search" size={17} color={COLORS.mutIcon} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por ciudadano, DNI, punto o código de certificado…"
                style={styles.input}
              />
            </div>

            <div style={styles.select}>
              <Icon name="filter" size={16} color={COLORS.mutIcon} />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={styles.selectInput}
              >
                <option value="TODOS">Todas las categorías</option>
                {TIPOS_RAEE.map((t) => (
                  <option key={t.tipo} value={t.tipo}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.chips}>
            {FILTROS_ESTADO.map((f) => {
              const activo = filtroEstado === f.clave;
              const color = ESTADOS_ENTREGA[f.clave];
              return (
                <button
                  key={f.clave}
                  type="button"
                  onClick={() => setFiltroEstado(f.clave)}
                  style={{
                    ...styles.chip,
                    ...(activo
                      ? {
                          background: color ? color.bg : COLORS.primarySoft,
                          color: color ? color.color : COLORS.primaryText,
                          borderColor: color ? color.color : COLORS.primaryText,
                        }
                      : {}),
                  }}
                >
                  {f.label}
                  <span style={styles.chipContador}>{conteoEstado(f.clave)}</span>
                </button>
              );
            })}
          </div>

          <div style={styles.resultado}>
            <Icon name="list" size={15} color={COLORS.mutIcon} />
            {filtradas.length} entrega{filtradas.length === 1 ? '' : 's'} encontrada
            {filtradas.length === 1 ? '' : 's'}
          </div>

          <EntregaTable entregas={filtradas} />
        </Card>
      </div>
    </>
  );
}

const styles = {
  controles: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 },
  buscador: {
    flex: 1,
    minWidth: 260,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 44,
    padding: '0 14px',
    border: `1px solid ${COLORS.line}`,
    borderRadius: RADIOS.campo,
    background: COLORS.bgTop,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: FUENTES.dm,
    fontSize: 13.5,
    color: COLORS.ink,
  },
  select: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    height: 44,
    padding: '0 14px',
    border: `1px solid ${COLORS.line}`,
    borderRadius: RADIOS.campo,
    background: COLORS.bgTop,
  },
  selectInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: FUENTES.dm,
    fontSize: 13.5,
    color: COLORS.ink,
    minWidth: 170,
  },
  chips: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    fontFamily: FUENTES.dm,
    fontSize: 12.5,
    fontWeight: 600,
    color: COLORS.inkItem,
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: RADIOS.pill,
    padding: '7px 13px',
  },
  chipContador: {
    fontFamily: FUENTES.dm,
    fontSize: 11,
    fontWeight: 700,
    opacity: 0.7,
  },
  resultado: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontFamily: FUENTES.dm,
    fontSize: 12.5,
    color: COLORS.mut,
    marginBottom: 12,
  },
};
