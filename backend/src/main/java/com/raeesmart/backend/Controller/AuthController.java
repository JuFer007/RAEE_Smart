package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.LoginRequestDTO;
import com.raeesmart.backend.Dto.Request.RegistroRequestDTO;
import com.raeesmart.backend.Dto.Response.LoginResponseDTO;
import com.raeesmart.backend.Dto.Response.UsuarioResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Enums.CanalAcceso;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Security.JwtService;
import com.raeesmart.backend.Service.AuditoriaService;
import com.raeesmart.backend.Service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")

public class AuthController {
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private AuditoriaService auditoriaService;

    public AuthController(UsuarioService usuarioService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Autowired(required = false)
    public void setAuditoriaService(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @PostMapping("/registro")
    public ResponseEntity<LoginResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(request.getPassword())
                .dni(request.getDni())
                .telefono(request.getTelefono())
                .rolUsuario(RolUsuario.CIUDADANO)
                .build();

        Usuario guardado = usuarioService.registrar(usuario);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("email", guardado.getEmail());
        detalles.put("rol", guardado.getRolUsuario() != null ? guardado.getRolUsuario().name() : null);
        registrarAuditoria("USUARIO_REGISTRO", "USUARIO", String.valueOf(guardado.getId()), detalles);
        String token = jwtService.generarToken(guardado);

        LoginResponseDTO response = LoginResponseDTO.builder()
                .token(token)
                .usuario(mapearAResponse(guardado))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return respuestaLogin(autenticar(request), CanalAcceso.WEB);
    }

    @PostMapping("/login/movil")
    public ResponseEntity<LoginResponseDTO> loginMovil(@Valid @RequestBody LoginRequestDTO request) {
        Usuario usuario = autenticar(request);
        if (usuario.getRolUsuario() != RolUsuario.CIUDADANO) {
            throw new AccessDeniedException("La app móvil es solo para ciudadanos");
        }
        return respuestaLogin(usuario, CanalAcceso.MOVIL);
    }

    private Usuario autenticar(LoginRequestDTO request) {
        Usuario usuario;
        try {
            usuario = usuarioService.buscarPorEmail(request.getEmail());
        } catch (ResourceNotFoundException ex) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }
        usuario.setUltimoAcceso(LocalDateTime.now());
        Usuario actualizado = usuarioService.guardar(usuario);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("email", actualizado.getEmail());
        detalles.put("rol", actualizado.getRolUsuario() != null ? actualizado.getRolUsuario().name() : null);
        registrarAuditoria("USUARIO_LOGIN", "USUARIO", String.valueOf(actualizado.getId()), detalles);
        return actualizado;
    }

    private ResponseEntity<LoginResponseDTO> respuestaLogin(Usuario usuario, CanalAcceso canal) {
        String token = jwtService.generarToken(usuario, canal);

        LoginResponseDTO response = LoginResponseDTO.builder()
                .token(token)
                .usuario(mapearAResponse(usuario))
                .build();

        return ResponseEntity.ok(response);
    }

    private void registrarAuditoria(String accion, String entidad, String entidadId, Map<String, Object> detalles) {
        if (auditoriaService != null) {
            auditoriaService.registrar(accion, entidad, entidadId, detalles);
        }
    }

    @GetMapping("/me")
    public UsuarioResponseDTO obtenerSesionActual(Authentication authentication) {
        if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("No autorizado");
        }
        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName());
        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new AccessDeniedException("No autorizado");
        }
        return mapearAResponse(usuario);
    }

    private UsuarioResponseDTO mapearAResponse(Usuario usuario) {
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .dni(usuario.getDni())
                .telefono(usuario.getTelefono())
                .rol(usuario.getRolUsuario())
                .municipalidadId(usuario.getMunicipalidad() != null ? usuario.getMunicipalidad().getId() : null)
                .municipalidadNombre(usuario.getMunicipalidad() != null ? usuario.getMunicipalidad().getNombre() : null)
                .municipalidadLatitud(usuario.getMunicipalidad() != null ? usuario.getMunicipalidad().getLatitud() : null)
                .municipalidadLongitud(usuario.getMunicipalidad() != null ? usuario.getMunicipalidad().getLongitud() : null)
                .activo(usuario.getActivo())
                .ultimoAcceso(usuario.getUltimoAcceso())
                .build();
    }
}
