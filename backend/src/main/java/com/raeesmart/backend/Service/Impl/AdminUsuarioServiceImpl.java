package com.raeesmart.backend.Service.Impl;

import com.raeesmart.backend.Dto.Request.AdminUsuarioPasswordRequestDTO;
import com.raeesmart.backend.Dto.Request.AdminUsuarioRequestDTO;
import com.raeesmart.backend.Dto.Response.AdminUsuarioResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Municipalidad;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.MunicipalidadRepository;
import com.raeesmart.backend.Repository.UsuarioRepository;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.AdminUsuarioService;
import com.raeesmart.backend.Service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service

public class AdminUsuarioServiceImpl implements AdminUsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final MunicipalidadRepository municipalidadRepository;
    private final AutorizacionService autorizacionService;
    private final PasswordEncoder passwordEncoder;
    private AuditoriaService auditoriaService;

    public AdminUsuarioServiceImpl(UsuarioRepository usuarioRepository,
                                   MunicipalidadRepository municipalidadRepository,
                                   AutorizacionService autorizacionService,
                                   PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.municipalidadRepository = municipalidadRepository;
        this.autorizacionService = autorizacionService;
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired(required = false)
    public void setAuditoriaService(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    @Override
    public List<AdminUsuarioResponseDTO> listar(Long municipalidadId, String rol, Boolean activo, String q) {
        Usuario actor = autorizacionService.obtenerActor();
        Long municipalidadFiltro = resolverMunicipalidadFiltro(actor, municipalidadId);
        RolUsuario rolFiltro = parsearRolFiltro(rol);
        String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);

        return usuarioRepository.findAll().stream()
                .filter(u -> municipalidadFiltro == null || (u.getMunicipalidad() != null
                        && Objects.equals(u.getMunicipalidad().getId(), municipalidadFiltro)))
                .filter(u -> rolFiltro == null || u.getRolUsuario() == rolFiltro)
                .filter(u -> activo == null || Objects.equals(Boolean.TRUE.equals(u.getActivo()), activo))
                .filter(u -> query.isEmpty() || coincideBusqueda(u, query))
                .filter(u -> puedeVer(actor, u))
                .sorted(Comparator
                        .comparingInt((Usuario u) -> prioridadRol(u.getRolUsuario()))
                        .thenComparing(u -> u.getNombre() == null ? "" : u.getNombre(),
                                String.CASE_INSENSITIVE_ORDER))
                .map(this::mapear)
                .toList();
    }

    @Transactional
    @Override
    public AdminUsuarioResponseDTO crear(AdminUsuarioRequestDTO request) {
        Usuario actor = autorizacionService.obtenerActor();
        RolUsuario rol = parsearRolObligatorio(request.getRol());
        validarAlcanceActor(actor, rol, request.getMunicipalidadId(), null);
        validarEmailUnico(request.getEmail(), null);
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }

        Municipalidad municipalidad = resolverMunicipalidadParaRol(rol, request.getMunicipalidadId(), actor);
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre().trim())
                .email(request.getEmail().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .dni(normalizar(request.getDni()))
                .telefono(normalizar(request.getTelefono()))
                .rolUsuario(rol)
                .municipalidad(municipalidad)
                .activo(request.getActivo() == null || request.getActivo())
                .build();
        Usuario guardado = usuarioRepository.save(usuario);
        registrar("ADMIN_USUARIO_CREAR", guardado, null, null);
        return mapear(guardado);
    }

    @Transactional
    @Override
    public AdminUsuarioResponseDTO actualizar(Long id, AdminUsuarioRequestDTO request) {
        Usuario actor = autorizacionService.obtenerActor();
        Usuario usuario = buscarUsuario(id);
        validarPuedeGestionar(actor, usuario);

        RolUsuario rolAnterior = usuario.getRolUsuario();
        Long muniAnterior = usuario.getMunicipalidad() != null ? usuario.getMunicipalidad().getId() : null;
        Boolean activoAnterior = usuario.getActivo();

        RolUsuario rol = parsearRolObligatorio(request.getRol());
        validarAlcanceActor(actor, rol, request.getMunicipalidadId(), usuario);
        validarEmailUnico(request.getEmail(), id);
        Municipalidad municipalidad = resolverMunicipalidadParaRol(rol, request.getMunicipalidadId(), actor);

        usuario.setNombre(request.getNombre().trim());
        usuario.setEmail(request.getEmail().trim());
        usuario.setDni(normalizar(request.getDni()));
        usuario.setTelefono(normalizar(request.getTelefono()));
        usuario.setRolUsuario(rol);
        usuario.setMunicipalidad(municipalidad);
        if (request.getActivo() != null) {
            if (Boolean.FALSE.equals(request.getActivo()) && Objects.equals(actor.getId(), usuario.getId())) {
                throw new IllegalArgumentException("No puedes desactivar tu propio usuario");
            }
            usuario.setActivo(request.getActivo());
        }

        Usuario guardado = usuarioRepository.save(usuario);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("rolAnterior", rolAnterior != null ? rolAnterior.name() : null);
        detalles.put("rolNuevo", guardado.getRolUsuario() != null ? guardado.getRolUsuario().name() : null);
        detalles.put("municipalidadAnterior", muniAnterior);
        detalles.put("municipalidadNueva", guardado.getMunicipalidad() != null ? guardado.getMunicipalidad().getId() : null);
        detalles.put("activoAnterior", activoAnterior);
        detalles.put("activoNuevo", guardado.getActivo());
        registrar("ADMIN_USUARIO_ACTUALIZAR", guardado, detalles, null);
        return mapear(guardado);
    }

    @Transactional
    @Override
    public AdminUsuarioResponseDTO cambiarEstado(Long id, boolean valor) {
        Usuario actor = autorizacionService.obtenerActor();
        Usuario usuario = buscarUsuario(id);
        validarPuedeGestionar(actor, usuario);
        if (!valor && Objects.equals(actor.getId(), usuario.getId())) {
            throw new IllegalArgumentException("No puedes desactivar tu propio usuario");
        }
        Boolean anterior = usuario.getActivo();
        usuario.setActivo(valor);
        Usuario guardado = usuarioRepository.save(usuario);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("activoAnterior", anterior);
        detalles.put("activoNuevo", valor);
        registrar("ADMIN_USUARIO_CAMBIAR_ESTADO", guardado, detalles, null);
        return mapear(guardado);
    }

    @Transactional
    @Override
    public void cambiarPassword(Long id, AdminUsuarioPasswordRequestDTO request) {
        Usuario actor = autorizacionService.obtenerActor();
        Usuario usuario = buscarUsuario(id);
        validarPuedeGestionar(actor, usuario);
        if (usuario.getRolUsuario() != RolUsuario.CIUDADANO) {
            throw new AccessDeniedException("Solo se puede cambiar la contraseña de ciudadanos");
        }
        if (request.getPasswordNueva() == null || request.getPasswordNueva().isBlank()) {
            throw new IllegalArgumentException("La nueva contraseña es obligatoria");
        }
        usuario.setPassword(passwordEncoder.encode(request.getPasswordNueva()));
        long version = usuario.getPasswordVersion() == null ? 0L : usuario.getPasswordVersion();
        usuario.setPasswordVersion(version + 1);
        usuarioRepository.save(usuario);

        registrar("ADMIN_USUARIO_CAMBIAR_PASSWORD", usuario, null, null);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private int prioridadRol(RolUsuario rol) {
        if (rol == RolUsuario.ADMIN) return 0;
        if (rol == RolUsuario.MUNICIPALIDAD) return 1;
        return 2;
    }

    private Long resolverMunicipalidadFiltro(Usuario actor, Long municipalidadId) {
        if (esSuperAdmin(actor)) {
            return municipalidadId;
        }
        if (actor.getMunicipalidad() == null) {
            throw new AccessDeniedException("No autorizado para gestionar usuarios");
        }
        if (municipalidadId != null && !Objects.equals(municipalidadId, actor.getMunicipalidad().getId())) {
            throw new AccessDeniedException("No autorizado para acceder a esta municipalidad");
        }
        return actor.getMunicipalidad().getId();
    }

    private void validarAlcanceActor(Usuario actor, RolUsuario rolObjetivo, Long municipalidadId, Usuario objetivo) {
        if (esSuperAdmin(actor)) {
            return;
        }
        if (actor.getRolUsuario() != RolUsuario.MUNICIPALIDAD || actor.getMunicipalidad() == null) {
            throw new AccessDeniedException("No autorizado para gestionar usuarios");
        }
        if (rolObjetivo == RolUsuario.ADMIN) {
            throw new AccessDeniedException("No autorizado para crear o asignar administradores");
        }
        Long muniActor = actor.getMunicipalidad().getId();
        if (municipalidadId != null && !Objects.equals(municipalidadId, muniActor)) {
            throw new AccessDeniedException("No autorizado para gestionar usuarios de otra municipalidad");
        }
        if (objetivo != null && objetivo.getMunicipalidad() != null
                && !Objects.equals(objetivo.getMunicipalidad().getId(), muniActor)) {
            throw new AccessDeniedException("No autorizado para gestionar usuarios de otra municipalidad");
        }
    }

    private void validarPuedeGestionar(Usuario actor, Usuario objetivo) {
        if (esSuperAdmin(actor)) {
            return;
        }
        if (actor.getRolUsuario() != RolUsuario.MUNICIPALIDAD || actor.getMunicipalidad() == null) {
            throw new AccessDeniedException("No autorizado para gestionar usuarios");
        }
        if (objetivo.getRolUsuario() == RolUsuario.ADMIN) {
            throw new AccessDeniedException("No autorizado para gestionar administradores");
        }
        if (objetivo.getMunicipalidad() == null
                || !Objects.equals(objetivo.getMunicipalidad().getId(), actor.getMunicipalidad().getId())) {
            throw new AccessDeniedException("No autorizado para gestionar usuarios de otra municipalidad");
        }
    }

    private boolean puedeVer(Usuario actor, Usuario objetivo) {
        if (esSuperAdmin(actor)) return true;
        if (actor.getMunicipalidad() == null) return false;
        return objetivo.getMunicipalidad() != null
                && Objects.equals(objetivo.getMunicipalidad().getId(), actor.getMunicipalidad().getId());
    }

    private Municipalidad resolverMunicipalidadParaRol(RolUsuario rol, Long municipalidadId, Usuario actor) {
        if (rol == RolUsuario.ADMIN) {
            if (municipalidadId != null) {
                throw new IllegalArgumentException("Un administrador no debe tener municipalidad");
            }
            return null;
        }
        Long muniId = municipalidadId;
        if (muniId == null && actor.getMunicipalidad() != null) {
            muniId = actor.getMunicipalidad().getId();
        }
        if (muniId == null) {
            throw new IllegalArgumentException("La municipalidad es obligatoria para el rol seleccionado");
        }
        return municipalidadRepository.findById(muniId)
                .orElseThrow(() -> new ResourceNotFoundException("Municipalidad no encontrada"));
    }

    private void validarEmailUnico(String email, Long idActual) {
        usuarioRepository.findByEmail(email.trim()).ifPresent(existente -> {
            if (idActual == null || !Objects.equals(existente.getId(), idActual)) {
                throw new IllegalArgumentException("Ya existe una cuenta con ese correo");
            }
        });
    }

    private RolUsuario parsearRolObligatorio(String rol) {
        if (rol == null || rol.isBlank()) {
            throw new IllegalArgumentException("El rol es obligatorio");
        }
        try {
            return RolUsuario.valueOf(rol.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("El rol no es válido");
        }
    }

    private RolUsuario parsearRolFiltro(String rol) {
        if (rol == null || rol.isBlank()) return null;
        try {
            return RolUsuario.valueOf(rol.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("El rol no es válido");
        }
    }

    private String normalizar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private boolean coincideBusqueda(Usuario u, String q) {
        return contiene(u.getNombre(), q) || contiene(u.getEmail(), q) || contiene(u.getDni(), q)
                || contiene(u.getTelefono(), q);
    }

    private boolean contiene(String valor, String q) {
        return valor != null && valor.toLowerCase(Locale.ROOT).contains(q);
    }

    private boolean esSuperAdmin(Usuario actor) {
        return actor.getRolUsuario() == RolUsuario.ADMIN && actor.getMunicipalidad() == null;
    }

    private void registrar(String accion, Usuario usuario, Map<String, Object> detallesExtra, Void ignored) {
        if (auditoriaService == null) return;
        Map<String, Object> detalles = detallesExtra != null ? new HashMap<>(detallesExtra) : new HashMap<>();
        detalles.put("usuarioId", usuario.getId());
        detalles.put("email", usuario.getEmail());
        detalles.put("rol", usuario.getRolUsuario() != null ? usuario.getRolUsuario().name() : null);
        detalles.put("municipalidadId", usuario.getMunicipalidad() != null ? usuario.getMunicipalidad().getId() : null);
        auditoriaService.registrar(accion, "USUARIO", String.valueOf(usuario.getId()), detalles);
    }

    private AdminUsuarioResponseDTO mapear(Usuario usuario) {
        return AdminUsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .dni(usuario.getDni())
                .telefono(usuario.getTelefono())
                .rol(usuario.getRolUsuario() != null ? usuario.getRolUsuario().name() : null)
                .municipalidadId(usuario.getMunicipalidad() != null ? usuario.getMunicipalidad().getId() : null)
                .municipalidadNombre(usuario.getMunicipalidad() != null ? usuario.getMunicipalidad().getNombre() : null)
                .activo(usuario.getActivo())
                .ultimoAcceso(usuario.getUltimoAcceso())
                .fechaRegistro(usuario.getFechaRegistro())
                .build();
    }
}
