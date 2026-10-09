package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.LoginRequestDTO;
import com.raeesmart.backend.Dto.Request.RegistroRequestDTO;
import com.raeesmart.backend.Dto.Response.LoginResponseDTO;
import com.raeesmart.backend.Dto.Response.UsuarioResponseDTO;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Security.JwtService;
import com.raeesmart.backend.Service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    public ResponseEntity<UsuarioResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(request.getPassword())
                .dni(request.getDni())
                .telefono(request.getTelefono())
                .rolUsuario(RolUsuario.CIUDADANO)
                .build();

        Usuario guardado = usuarioService.registrar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapearAResponse(guardado));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        Usuario usuario = usuarioService.buscarPorEmail(request.getEmail());

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

    private UsuarioResponseDTO mapearAResponse(Usuario usuario) {
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .dni(usuario.getDni())
                .telefono(usuario.getTelefono())
                .rol(usuario.getRolUsuario())
                .build();
    }
}
