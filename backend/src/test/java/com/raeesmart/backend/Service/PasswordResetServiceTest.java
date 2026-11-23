package com.raeesmart.backend.Service;

import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.PasswordResetCodigo;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.PasswordResetCodigoRepository;
import com.raeesmart.backend.Repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {
    private static final String CORREO = "vecino@raee.com";

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordResetCodigoRepository codigoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Test
    void solicitarCodigoIgnoraCuentasQueNoSonCiudadanos() {
        PasswordResetService service = construirServicio();
        Usuario administrador = Usuario.builder()
                .email(CORREO)
                .rolUsuario(RolUsuario.ADMIN)
                .activo(true)
                .build();
        when(usuarioRepository.findByEmail(CORREO)).thenReturn(Optional.of(administrador));

        service.solicitarCodigo(CORREO);

        verifyNoInteractions(codigoRepository, emailService, passwordEncoder);
    }

    @Test
    void flujoCompletoCambiaPasswordEIncrementaVersion() {
        PasswordResetService service = construirServicio();
        Usuario ciudadano = Usuario.builder()
                .id(7L)
                .nombre("Vecino")
                .email(CORREO)
                .password("password-anterior")
                .rolUsuario(RolUsuario.CIUDADANO)
                .activo(true)
                .passwordVersion(0L)
                .build();
        when(usuarioRepository.findByEmail(CORREO)).thenReturn(Optional.of(ciudadano));
        when(codigoRepository.findByEmailAndUsadoEnIsNull(CORREO)).thenReturn(Collections.emptyList());
        when(passwordEncoder.encode("nuevaPassword")).thenReturn("nueva-codificada");

        service.solicitarCodigo(CORREO);

        ArgumentCaptor<PasswordResetCodigo> registroCaptor = ArgumentCaptor.forClass(PasswordResetCodigo.class);
        ArgumentCaptor<String> codigoCaptor = ArgumentCaptor.forClass(String.class);
        verify(codigoRepository).save(registroCaptor.capture());
        verify(emailService).enviarCodigoRecuperacion(eq("Vecino"), eq(CORREO), codigoCaptor.capture());

        PasswordResetCodigo registro = registroCaptor.getValue();
        String codigo = codigoCaptor.getValue();
        when(codigoRepository.findTopByEmailAndUsadoEnIsNullOrderByCreadoEnDesc(CORREO))
                .thenReturn(Optional.of(registro));

        service.verificarCodigo(CORREO, codigo);
        service.restablecerPassword(CORREO, codigo, "nuevaPassword");

        assertEquals("nueva-codificada", ciudadano.getPassword());
        assertEquals(1L, ciudadano.getPasswordVersion());
        assertNotNull(registro.getUsadoEn());
        assertNotNull(registro.getVerificadoEn());
    }

    private PasswordResetService construirServicio() {
        return new PasswordResetService(
                usuarioRepository,
                codigoRepository,
                passwordEncoder,
                emailService,
                "secreto-de-prueba-con-al-menos-32-caracteres",
                10,
                5,
                60);
    }
}
