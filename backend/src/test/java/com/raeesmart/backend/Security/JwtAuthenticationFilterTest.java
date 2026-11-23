package com.raeesmart.backend.Security;

import com.raeesmart.backend.Model.Enums.CanalAcceso;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {
    private static final String CORREO = "vecino@raee.com";
    private static final String SECRETO = "secreto-de-prueba-con-al-menos-32-caracteres";

    @Mock
    private UsuarioRepository usuarioRepository;

    private JwtService jwtService;
    private JwtAuthenticationFilter filtro;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRETO, 3600000L);
        filtro = new JwtAuthenticationFilter(jwtService, usuarioRepository);
    }

    @AfterEach
    void limpiar() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void tokenConPasswordVersionDesactualizadoNoAutentica() throws Exception {
        String token = generarToken(0L);
        when(usuarioRepository.findByEmail(CORREO)).thenReturn(Optional.of(usuario(1L)));

        filtro.doFilter(solicitudCon(token), new MockHttpServletResponse(), new MockFilterChain());

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void tokenConPasswordVersionVigenteAutentica() throws Exception {
        String token = generarToken(1L);
        when(usuarioRepository.findByEmail(CORREO)).thenReturn(Optional.of(usuario(1L)));

        filtro.doFilter(solicitudCon(token), new MockHttpServletResponse(), new MockFilterChain());

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }

    private String generarToken(Long version) {
        Usuario usuario = Usuario.builder()
                .email(CORREO)
                .rolUsuario(RolUsuario.CIUDADANO)
                .passwordVersion(version)
                .build();
        return jwtService.generarToken(usuario, CanalAcceso.MOVIL);
    }

    private Usuario usuario(Long version) {
        return Usuario.builder()
                .email(CORREO)
                .rolUsuario(RolUsuario.CIUDADANO)
                .passwordVersion(version)
                .activo(true)
                .build();
    }

    private MockHttpServletRequest solicitudCon(String token) {
        MockHttpServletRequest solicitud = new MockHttpServletRequest();
        solicitud.addHeader("Authorization", "Bearer " + token);
        return solicitud;
    }
}
