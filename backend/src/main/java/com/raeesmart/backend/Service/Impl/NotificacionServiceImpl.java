package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Dto.Response.NotificacionResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Enums.TipoNotificacion;
import com.raeesmart.backend.Model.Notificacion;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.NotificacionRepository;
import com.raeesmart.backend.Repository.UsuarioRepository;
import com.raeesmart.backend.Service.NotificacionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificacionServiceImpl implements NotificacionService {
    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacionServiceImpl(NotificacionRepository notificacionRepository,
                                   UsuarioRepository usuarioRepository) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    @Override
    public void notificarCiudadanos(TipoNotificacion tipo, String titulo, String detalle) {
        List<Notificacion> lote = usuarioRepository.findByRolUsuario(RolUsuario.CIUDADANO).stream()
                .map(u -> construir(u, tipo, titulo, detalle))
                .toList();
        notificacionRepository.saveAll(lote);
    }

    @Transactional
    @Override
    public void notificarUsuario(Usuario usuario, TipoNotificacion tipo, String titulo, String detalle) {
        notificacionRepository.save(construir(usuario, tipo, titulo, detalle));
    }

    @Transactional(readOnly = true)
    @Override
    public List<NotificacionResponseDTO> listarDeUsuario(String email) {
        Usuario usuario = buscarUsuario(email);
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuario.getId()).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public long contarNoLeidas(String email) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(buscarUsuario(email).getId());
    }

    @Transactional
    @Override
    public void marcarLeida(Long notificacionId, String email) {
        Notificacion notificacion = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));
        if (!notificacion.getUsuario().getEmail().equalsIgnoreCase(email)) {
            throw new ResourceNotFoundException("Notificación no encontrada");
        }
        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
    }

    @Transactional
    @Override
    public void marcarTodasLeidas(String email) {
        notificacionRepository.marcarTodasLeidas(buscarUsuario(email).getId());
    }

    @Transactional
    @Override
    public void crearParaUsuario(Long usuarioId, TipoNotificacion tipo, String titulo, String detalle) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        notificacionRepository.save(construir(usuario, tipo, titulo, detalle));
    }

    @Transactional
    @Override
    public void crearParaUsuariosDeMunicipalidad(Long municipalidadId, TipoNotificacion tipo, String titulo, String detalle) {
        List<Notificacion> lote = usuarioRepository.findByMunicipalidadId(municipalidadId).stream()
                .map(u -> construir(u, tipo, titulo, detalle))
                .toList();
        if (!lote.isEmpty()) {
            notificacionRepository.saveAll(lote);
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<NotificacionResponseDTO> listarDeUsuarioId(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private Notificacion construir(Usuario usuario, TipoNotificacion tipo, String titulo, String detalle) {
        return Notificacion.builder()
                .usuario(usuario)
                .tipo(tipo)
                .titulo(recortar(titulo, 150))
                .detalle(recortar(detalle, 300))
                .leida(false)
                .build();
    }

    private String recortar(String texto, int max) {
        if (texto == null) return "";
        return texto.length() <= max ? texto : texto.substring(0, max - 3) + "...";
    }

    private NotificacionResponseDTO mapearAResponse(Notificacion n) {
        return NotificacionResponseDTO.builder()
                .id(n.getId())
                .titulo(n.getTitulo())
                .detalle(n.getDetalle())
                .tipo(n.getTipo())
                .leida(n.getLeida())
                .fechaCreacion(n.getFechaCreacion())
                .build();
    }
}
