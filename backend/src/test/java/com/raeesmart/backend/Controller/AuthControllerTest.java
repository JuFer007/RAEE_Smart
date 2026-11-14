package com.raeesmart.backend.Controller;

import com.raeesmart.backend.Dto.Request.LoginRequestDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Security.JwtService;
import com.raeesmart.backend.Service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(usuarioService, passwordEncoder, jwtService);
    }

    @Test
    void loginConCorreoInexistenteDevuelveCredencialesInvalidas() {
        when(usuarioService.buscarPorEmail("desconocido@raee.com"))
                .thenThrow(new ResourceNotFoundException("Usuario no encontrado"));

        LoginRequestDTO request = LoginRequestDTO.builder()
                .email("desconocido@raee.com")
                .password("secreto")
                .build();

        assertThrows(BadCredentialsException.class, () -> authController.login(request));
        verifyNoInteractions(passwordEncoder, jwtService);
    }
}
