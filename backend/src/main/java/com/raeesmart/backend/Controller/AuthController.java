package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.LoginRequestDTO;
import com.raeesmart.backend.Dto.Request.RegistroRequestDTO;
import com.raeesmart.backend.Dto.Response.LoginResponseDTO;
import com.raeesmart.backend.Dto.Response.UsuarioResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Security.JwtService;
import com.raeesmart.backend.Service.UsuarioService;
import jakarta.validation.Valid;
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

@RestController
@RequestMapping("/api/auth")

public class AuthController {
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioService usuarioService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
        String token = jwtService.generarToken(guardado);

        LoginResponseDTO response = LoginResponseDTO.builder()
                .token(token)
                .usuario(mapearAResponse(guardado))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        Usuario usuario;
        try {
            usuario = usuarioService.buscarPorEmail(request.getEmail());
        } catch (ResourceNotFoundException ex) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        String token = jwtService.generarToken(usuario);

        LoginResponseDTO response = LoginResponseDTO.builder()
                .token(token)
                .usuario(mapearAResponse(usuario))
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public UsuarioResponseDTO obtenerSesionActual(Authentication authentication) {
        if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("No autorizado");
        }
        return mapearAResponse(usuarioService.buscarPorEmail(authentication.getName()));
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
                .build();
    }
}
