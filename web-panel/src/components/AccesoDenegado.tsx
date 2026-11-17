import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

export default function AccesoDenegado() {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const volverAlLogin = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <div className="acceso-denegado">
      <div className="acceso-denegado__card">
        <span className="acceso-denegado__icono">
          <Icon name="alert" size={24} />
        </span>
        <h1>Sin acceso a este panel</h1>
        <p>La cuenta con la que iniciaste sesión no pertenece a una municipalidad.</p>
        <button type="button" onClick={volverAlLogin}>
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
