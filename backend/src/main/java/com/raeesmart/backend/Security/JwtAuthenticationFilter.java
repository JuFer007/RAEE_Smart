package com.raeesmart.backend.Security;
import com.raeesmart.backend.Model.Enums.CanalAcceso;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtService.esValido(token)) {
                String email = jwtService.obtenerEmail(token);
                var usuario = usuarioRepository.findByEmail(email);
                long versionToken = jwtService.obtenerPasswordVersion(token);
                long versionActual = usuario
                        .map(u -> u.getPasswordVersion() == null ? 0L : u.getPasswordVersion())
                        .orElse(0L);
                if (usuario.isEmpty() || versionToken != versionActual) {
                    filterChain.doFilter(request, response);
                    return;
                }
                String rol = jwtService.obtenerRol(token);
                CanalAcceso canal = jwtService.obtenerCanal(token);
                String rolEfectivo = canal == CanalAcceso.MOVIL
                        ? RolUsuario.CIUDADANO.name()
                        : (rol == null ? RolUsuario.CIUDADANO.name() : rol);

                var authentication = new UsernamePasswordAuthenticationToken(
                        email, null, List.of(new SimpleGrantedAuthority("ROLE_" + rolEfectivo)));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
