import React, { useState } from 'react';
import Icon from './Icon';
import { COLORS, FUENTES, RADIOS } from '../theme';
import { convertirACSV } from '../data/mockData';

export default function ExportButton({ datos = [], convertir = convertirACSV, nombreArchivo = 'entregas-raee.csv' }) {
  const [exportando, setExportando] = useState(false);

  const exportar = () => {
    if (!datos.length) return;
    setExportando(true);
    const csv = convertir(datos);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
    setTimeout(() => setExportando(false), 400);
  };

  return (
    <button type="button" style={styles.boton} onClick={exportar} disabled={exportando || !datos.length}>
      <Icon name="download" size={16} color={COLORS.primaryText} />
      {exportando ? 'Exportando…' : 'Exportar CSV'}
    </button>
  );
}

const styles = {
  boton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 40,
    padding: '0 15px',
    borderRadius: RADIOS.campo,
    border: `1px solid ${COLORS.secondaryBorder}`,
    background: COLORS.surface,
    color: COLORS.primaryText,
    fontFamily: FUENTES.dm,
    fontSize: 13,
    fontWeight: 700,
  },
};
