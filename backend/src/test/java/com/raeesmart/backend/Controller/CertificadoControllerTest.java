package com.raeesmart.backend.Controller;

import com.raeesmart.backend.Dto.Response.CertificadoResponseDTO;
import com.raeesmart.backend.Model.Certificado;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Repository.CategoriaRAEERepository;
import com.raeesmart.backend.Service.CertificadoService;
import com.raeesmart.backend.Service.EntregaService;
import com.raeesmart.backend.Service.QRService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CertificadoControllerTest {

    @Mock
    private CertificadoService certificadoService;

    @Mock
    private CategoriaRAEERepository categoriaRAEERepository;

    @Mock
    private EntregaService entregaService;

    @Mock
    private QRService qrService;

    @Mock
    private Certificado certificado;

    @Mock
    private Entrega entrega;

    @Mock
    private PuntoRecoleccion puntoRecoleccion;

    @Mock
    private Usuario titular;

    private CertificadoController certificadoController;

    @BeforeEach
    void setUp() {
        certificadoController = new CertificadoController(
                certificadoService, categoriaRAEERepository, entregaService, qrService,
                "http://localhost:3007/");
    }

    @Test
    void obtenerCertificadoValidaAccesoALaEntregaAntesDeConsultarlo() {
        doThrow(new AccessDeniedException("No autorizado"))
                .when(entregaService).buscarPorId(1L);

        assertThrows(AccessDeniedException.class,
                () -> certificadoController.obtenerPorEntrega(1L));
        verifyNoInteractions(certificadoService, categoriaRAEERepository, qrService);
    }

    @Test
    void verificarCertificadoExponeUrlPdfDelServicioCuandoNoHayUnaGuardada() {
        when(certificadoService.verificarPorHash("SEED-CERT-000015")).thenReturn(certificado);
        when(certificado.getEntrega()).thenReturn(entrega);
        when(certificado.getCodigoHash()).thenReturn("SEED-CERT-000015");
        when(certificado.getCodigoQr()).thenReturn("http://localhost:8080/api/certificados/verificar/SEED-CERT-000015");
        when(certificado.getUrlPdf()).thenReturn(null);
        when(entrega.getClasificacionCorregida()).thenReturn(false);
        when(entrega.getTipoRaee()).thenReturn(TipoRAEE.CELULAR);
        when(entrega.getPuntoRecoleccion()).thenReturn(puntoRecoleccion);
        when(entrega.getUsuario()).thenReturn(titular);
        when(titular.getNombre()).thenReturn("María Torres");
        when(titular.getDni()).thenReturn("12345678");
        when(puntoRecoleccion.getNombre()).thenReturn("Punto de acopio");
        when(categoriaRAEERepository.findByTipo(TipoRAEE.CELULAR)).thenReturn(Optional.empty());
        when(qrService.generarQR(anyString())).thenReturn(new byte[]{1});

        CertificadoResponseDTO respuesta = certificadoController.verificar("SEED-CERT-000015");

        assertEquals("http://localhost:3007/certificado/SEED-CERT-000015/pdf", respuesta.getUrlPdf());
        assertEquals("María Torres", respuesta.getPersonaNombre());
        assertEquals("12345678", respuesta.getPersonaDni());
    }
}
