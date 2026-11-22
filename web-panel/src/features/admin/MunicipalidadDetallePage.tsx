import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listarMunicipalidades } from '../../api/panel';
import { buttonClass } from '../../components/ui/Button';
import PlaceholderPage from '../../components/ui/PlaceholderPage';

export default function MunicipalidadDetallePage() {
  const { id } = useParams();
  const [nombre, setNombre] = useState('Municipalidad');

  useEffect(() => {
    let activo = true;
    listarMunicipalidades()
      .then((municipalidades) => {
        if (!activo) return;
        const municipalidad = municipalidades.find(
          (item) => String(item.id) === String(id),
        );
        if (municipalidad) setNombre(municipalidad.nombre);
      })
      .catch(() => {
        if (activo) setNombre('Municipalidad');
      });
    return () => {
      activo = false;
    };
  }, [id]);

  return (
    <PlaceholderPage
      title={nombre}
      description="Detalle operativo de la municipalidad seleccionada."
      icon="building"
      section="de municipalidades"
      actions={
        <Link to="/panel/municipalidades" className={buttonClass('secondary')}>
          Volver a municipalidades
        </Link>
      }
      details={[
        {
          icon: 'location',
          titulo: 'Puntos de entrega',
          descripcion: 'Ubicación, horarios y capacidad de cada punto.',
        },
        {
          icon: 'scan',
          titulo: 'Actividad',
          descripcion: 'Entregas registradas, confirmaciones y campañas vigentes.',
        },
        {
          icon: 'chart',
          titulo: 'Indicadores',
          descripcion: 'Indicadores históricos y satisfacción cuando esté disponible.',
        },
      ]}
    />
  );
}
