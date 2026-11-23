package com.raeesmart.backend.Service.Impl;

import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {
    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void cambiarPasswordRechazaUsuariosQueNoSonCiudadanos() {
        UsuarioServiceImpl service = new UsuarioServiceImpl(usuarioRepository, passwordEncoder);
        Usuario municipalidad = Usuario.builder()
                .email("admin.chiclayo@raee.com")
                .password("hash")
                .rolUsuario(RolUsuario.MUNICIPALIDAD)
                .activo(true)
                .build();
        when(usuarioRepository.findByEmail(municipalidad.getEmail())).thenReturn(Optional.of(municipalidad));

        assertThrows(AccessDeniedException.class,
                () -> service.cambiarPassword(municipalidad.getEmail(), "actual", "nueva"));
        verifyNoInteractions(passwordEncoder);
    }
}
