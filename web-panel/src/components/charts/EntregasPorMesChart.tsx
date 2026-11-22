import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Entrega } from '../../types';

interface EntregasPorMesChartProps {
  entregas: Entrega[];
}

export default function EntregasPorMesChart({ entregas }: EntregasPorMesChartProps) {
  const datos = useMemo(() => {
    const hoy = new Date();
    const claves: string[] = [];
    for (let indice = 5; indice >= 0; indice -= 1) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - indice, 1);
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      claves.push(`${anio}-${mes}`);
    }

    const conteos = new Map(claves.map((clave) => [clave, 0]));
    entregas.forEach((entrega) => {
      const clave = entrega.fechaRegistro.slice(0, 7);
      if (conteos.has(clave)) conteos.set(clave, (conteos.get(clave) ?? 0) + 1);
    });

    return claves.map((clave) => {
      const [anio, mes] = clave.split('-').map(Number);
      const etiqueta = new Date(anio, mes - 1, 1)
        .toLocaleDateString('es-PE', { month: 'short' })
        .replace('.', '');
      return {
        mes: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1),
        total: conteos.get(clave) ?? 0,
      };
    });
  }, [entregas]);

  return (
    <div className="admin-chart">
      <ResponsiveContainer width="100%" height={238}>
        <BarChart data={datos} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15, 46, 32, 0.08)" />
          <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: 'rgba(126, 211, 33, 0.12)' }}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid var(--border)',
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(15, 46, 32, 0.12)',
            }}
          />
          <Bar dataKey="total" name="Entregas" fill="var(--lime)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
