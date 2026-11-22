package com.raeesmart.backend.Service.Impl;

import com.raeesmart.backend.Dto.Request.EntregaRequestDTO;
import com.raeesmart.backend.Dto.Response.ClasificacionResponseDTO;
import com.raeesmart.backend.Dto.Response.EntregaResponseDTO;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Model.Municipalidad;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Model.Enums.EstadoEntrega;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Repository.CategoriaRAEERepository;
import com.raeesmart.backend.Repository.EntregaRepository;
import com.raeesmart.backend.Repository.PuntoRecoleccionRepository;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.CertificadoService;
import com.raeesmart.backend.Service.ClasificacionIAService;
import com.raeesmart.backend.Service.GeolocalizacionService;
import com.raeesmart.backend.Service.NotificacionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EntregaServiceImplSecurityTest {

    @Mock
    private EntregaRepository entregaRepository;

    @Mock
    private PuntoRecoleccionRepository puntoRecoleccionRepository;

    @Mock
    private CategoriaRAEERepository categoriaRAEERepository;

    @Mock
    private AlmacenamientoServiceImpl almacenamientoService;

    @Mock
    private ClasificacionIAService clasificacionIAService;

    @Mock
    private GeolocalizacionService geolocalizacionService;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private CertificadoService certificadoService;

    @Mock
    private AutorizacionService autorizacionService;

    @InjectMocks
    private EntregaServiceImpl entregaService;

    @Test
    void registrarEntregaUsaAlUsuarioAutenticado() {
        Usuario actor = Usuario.builder()
                .id(7L)
                .email("actor@raee.com")
                .rolUsuario(RolUsuario.CIUDADANO)
                .build();
        Municipalidad municipalidad = Municipalidad.builder()
                .id(3L)
                .nombre("Municipalidad")
                .activo(true)
                .build();
        PuntoRecoleccion punto = PuntoRecoleccion.builder()
                .id(4L)
                .nombre("Punto")
                .direccion("Direccion")
                .municipalidad(municipalidad)
                .build();
        MultipartFile foto = mock(MultipartFile.class);

        when(autorizacionService.obtenerActor()).thenReturn(actor);
        when(clasificacionIAService.clasificar(foto))
                .thenReturn(ClasificacionResponseDTO.builder()
                        .tipoDetectado(TipoRAEE.CELULAR)
                        .confianza(0.95)
                        .build());
        when(puntoRecoleccionRepository.findById(4L)).thenReturn(Optional.of(punto));
        when(almacenamientoService.guardarFoto(foto)).thenReturn("foto.jpg");
        when(entregaRepository.save(any(Entrega.class))).thenAnswer(invocation -> {
            Entrega guardada = invocation.getArgument(0);
            guardada.setId(50L);
            return guardada;
        });
        when(categoriaRAEERepository.findByTipo(TipoRAEE.CELULAR)).thenReturn(Optional.empty());

        EntregaRequestDTO request = EntregaRequestDTO.builder()
                .puntoRecoleccionId(4L)
                .latitud(-6.7)
                .longitud(-79.8)
                .foto(foto)
                .build();

        EntregaResponseDTO response = entregaService.registrarEntrega(request);

        assertEquals(50L, response.getId());
        ArgumentCaptor<Entrega> captor = ArgumentCaptor.forClass(Entrega.class);
        verify(entregaRepository).save(captor.capture());
        assertSame(actor, captor.getValue().getUsuario());
        verify(autorizacionService).obtenerActor();
    }

    @Test
    void buscarPorIdAplicaValidacionDeAcceso() {
        Entrega entrega = crearEntrega();
        when(entregaRepository.findById(1L)).thenReturn(Optional.of(entrega));
        doThrow(new AccessDeniedException("No autorizado"))
                .when(autorizacionService).validarAccesoEntrega(entrega);

        assertThrows(AccessDeniedException.class, () -> entregaService.buscarPorId(1L));
        verify(autorizacionService).validarAccesoEntrega(entrega);
    }

    @Test
    void corregirClasificacionAplicaValidacionDeAcceso() {
        Entrega entrega = crearEntrega();
        when(entregaRepository.findById(1L)).thenReturn(Optional.of(entrega));
        doThrow(new AccessDeniedException("No autorizado"))
                .when(autorizacionService).validarAccesoEntrega(entrega);

        assertThrows(AccessDeniedException.class,
                () -> entregaService.corregirClasificacion(1L, TipoRAEE.LAPTOP));
        verify(entregaRepository, never()).save(any(Entrega.class));
    }

    @Test
    void confirmarEntregaAplicaValidacionDeGestion() {
        Entrega entrega = crearEntrega();
        when(entregaRepository.findById(1L)).thenReturn(Optional.of(entrega));
        doThrow(new AccessDeniedException("No autorizado"))
                .when(autorizacionService).validarGestionEntrega(entrega);

        assertThrows(AccessDeniedException.class, () -> entregaService.confirmarEntrega(1L));
        verify(entregaRepository, never()).save(any(Entrega.class));
    }

    @Test
    void rechazarEntregaAplicaValidacionDeGestion() {
        Entrega entrega = crearEntrega();
        when(entregaRepository.findById(1L)).thenReturn(Optional.of(entrega));
        doThrow(new AccessDeniedException("No autorizado"))
                .when(autorizacionService).validarGestionEntrega(entrega);

        assertThrows(AccessDeniedException.class, () -> entregaService.rechazarEntrega(1L, null));
        verify(entregaRepository, never()).save(any(Entrega.class));
    }

    @Test
    void listarPorUsuarioAplicaValidacionDeAcceso() {
        doThrow(new AccessDeniedException("No autorizado"))
                .when(autorizacionService).validarAccesoUsuario(2L);

        assertThrows(AccessDeniedException.class, () -> entregaService.listarPorUsuario(2L));
        verifyNoInteractions(entregaRepository);
    }

    @Test
    void listarPorMunicipalidadAplicaValidacionDeAcceso() {
        doThrow(new AccessDeniedException("No autorizado"))
                .when(autorizacionService).validarAccesoMunicipalidad(3L);

        assertThrows(AccessDeniedException.class, () -> entregaService.listarPorMunicipalidad(3L));
        verifyNoInteractions(entregaRepository);
    }

    private Entrega crearEntrega() {
        Usuario dueno = Usuario.builder()
                .id(2L)
                .email("dueno@raee.com")
                .rolUsuario(RolUsuario.CIUDADANO)
                .build();
        Municipalidad municipalidad = Municipalidad.builder()
                .id(3L)
                .nombre("Municipalidad")
                .build();
        PuntoRecoleccion punto = PuntoRecoleccion.builder()
                .id(4L)
                .nombre("Punto")
                .municipalidad(municipalidad)
                .build();
        return Entrega.builder()
                .id(1L)
                .usuario(dueno)
                .puntoRecoleccion(punto)
                .tipoRaee(TipoRAEE.CELULAR)
                .estado(EstadoEntrega.REGISTRADA)
                .clasificacionCorregida(false)
                .build();
    }
}
