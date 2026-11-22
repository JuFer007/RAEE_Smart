package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Request.PreferenciaNotificacionRequestDTO;
import com.raeesmart.backend.Dto.Response.PreferenciaNotificacionResponseDTO;
import com.raeesmart.backend.Model.Usuario;

public interface UsuarioService {
    Usuario registrar(Usuario usuario);
    Usuario buscarPorId(Long id);
    Usuario buscarPorEmail(String email);
    Usuario guardar(Usuario usuario);
    void cambiarPassword(String email, String passwordActual, String passwordNueva);
    PreferenciaNotificacionResponseDTO obtenerPreferenciasNotificacion(String email);
    PreferenciaNotificacionResponseDTO actualizarPreferenciasNotificacion(
            String email, PreferenciaNotificacionRequestDTO request);
}
