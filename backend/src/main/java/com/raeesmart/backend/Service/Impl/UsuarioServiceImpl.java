package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Dto.Request.PreferenciaNotificacionRequestDTO;
import com.raeesmart.backend.Dto.Response.PreferenciaNotificacionResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.UsuarioRepository;
import com.raeesmart.backend.Service.UsuarioService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service

public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Usuario registrar(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);    }

    @Override
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    @Override
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    @Transactional
    @Override
    public void cambiarPassword(String email, String passwordActual, String passwordNueva) {
        Usuario usuario = buscarPorEmail(email);
        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            throw new IllegalArgumentException("La contrasena actual no es correcta");
        }
        usuario.setPassword(passwordEncoder.encode(passwordNueva));
        usuarioRepository.save(usuario);
    }

    @Override
    public PreferenciaNotificacionResponseDTO obtenerPreferenciasNotificacion(String email) {
        return mapearPreferencias(buscarPorEmail(email));
    }

    @Transactional
    @Override
    public PreferenciaNotificacionResponseDTO actualizarPreferenciasNotificacion(
            String email, PreferenciaNotificacionRequestDTO request) {
        Usuario usuario = buscarPorEmail(email);
        if (request.getPush() != null) usuario.setNotificarPush(request.getPush());
        if (request.getCampanas() != null) usuario.setNotificarCampanas(request.getCampanas());
        if (request.getEntregas() != null) usuario.setNotificarEntregas(request.getEntregas());
        if (request.getRecordatorios() != null) usuario.setNotificarRecordatorios(request.getRecordatorios());
        usuarioRepository.save(usuario);
        return mapearPreferencias(usuario);
    }

    private PreferenciaNotificacionResponseDTO mapearPreferencias(Usuario usuario) {
        return PreferenciaNotificacionResponseDTO.builder()
                .push(usuario.getNotificarPush() == null || usuario.getNotificarPush())
                .campanas(usuario.getNotificarCampanas() == null || usuario.getNotificarCampanas())
                .entregas(usuario.getNotificarEntregas() == null || usuario.getNotificarEntregas())
                .recordatorios(usuario.getNotificarRecordatorios() != null && usuario.getNotificarRecordatorios())
                .build();
    }
}
