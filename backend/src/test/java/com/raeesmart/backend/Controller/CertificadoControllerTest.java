package com.raeesmart.backend.Controller;

import com.raeesmart.backend.Repository.CategoriaRAEERepository;
import com.raeesmart.backend.Service.CertificadoService;
import com.raeesmart.backend.Service.EntregaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class CertificadoControllerTest {

    @Mock
    private CertificadoService certificadoService;

    @Mock
    private CategoriaRAEERepository categoriaRAEERepository;

    @Mock
    private EntregaService entregaService;

    private CertificadoController certificadoController;

    @BeforeEach
    void setUp() {
        certificadoController = new CertificadoController(
                certificadoService, categoriaRAEERepository, entregaService);
    }

    @Test
    void obtenerCertificadoValidaAccesoALaEntregaAntesDeConsultarlo() {
        doThrow(new AccessDeniedException("No autorizado"))
                .when(entregaService).buscarPorId(1L);

        assertThrows(AccessDeniedException.class,
                () -> certificadoController.obtenerPorEntrega(1L));
        verifyNoInteractions(certificadoService, categoriaRAEERepository);
    }
}
