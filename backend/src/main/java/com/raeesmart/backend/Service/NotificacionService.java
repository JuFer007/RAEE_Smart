package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Response.NotificacionResponseDTO;
import com.raeesmart.backend.Model.Enums.TipoNotificacion;
import com.raeesmart.backend.Model.Usuario;
import java.util.List;

public interface NotificacionService {
    void notificarCiudadanos(TipoNotificacion tipo, String titulo, String detalle);
    void notificarUsuario(Usuario usuario, TipoNotificacion tipo, String titulo, String detalle);
    List<NotificacionResponseDTO> listarDeUsuario(String email);
    long contarNoLeidas(String email);
    void marcarLeida(Long notificacionId, String email);
    void marcarTodasLeidas(String email);
    void crearParaUsuario(Long usuarioId, TipoNotificacion tipo, String titulo, String detalle);
    void crearParaUsuariosDeMunicipalidad(Long municipalidadId, TipoNotificacion tipo, String titulo, String detalle);
    List<NotificacionResponseDTO> listarDeUsuarioId(Long usuarioId);
}

