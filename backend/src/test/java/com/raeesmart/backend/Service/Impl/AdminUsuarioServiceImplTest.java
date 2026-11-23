package com.raeesmart.backend.Service.Impl;

import com.raeesmart.backend.Dto.Request.AdminUsuarioPasswordRequestDTO;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.MunicipalidadRepository;
import com.raeesmart.backend.Repository.UsuarioRepository;
import com.raeesmart.backend.Security.AutorizacionService;
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
class AdminUsuarioServiceImplTest {
    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private MunicipalidadRepository municipalidadRepository;

    @Mock
    private AutorizacionService autorizacionService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void cambiarPasswordRechazaObjetivosQueNoSonCiudadanos() {
        AdminUsuarioServiceImpl service = new AdminUsuarioServiceImpl(
                usuarioRepository, municipalidadRepository, autorizacionService, passwordEncoder);
        Usuario superAdmin = Usuario.builder()
                .email("admin@raee.com")
                .rolUsuario(RolUsuario.ADMIN)
                .activo(true)
                .build();
        Usuario objetivo = Usuario.builder()
                .id(12L)
                .email("admin.chiclayo@raee.com")
                .rolUsuario(RolUsuario.MUNICIPALIDAD)
                .activo(true)
                .build();
        when(autorizacionService.obtenerActor()).thenReturn(superAdmin);
        when(usuarioRepository.findById(12L)).thenReturn(Optional.of(objetivo));

        AdminUsuarioPasswordRequestDTO request = AdminUsuarioPasswordRequestDTO.builder()
                .passwordNueva("nuevaPassword")
                .build();

        assertThrows(AccessDeniedException.class, () -> service.cambiarPassword(12L, request));
        verifyNoInteractions(passwordEncoder);
    }
}
