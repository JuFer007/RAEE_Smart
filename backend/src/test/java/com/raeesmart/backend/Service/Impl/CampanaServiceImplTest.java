package com.raeesmart.backend.Service.Impl;

import com.raeesmart.backend.Dto.Request.CampanaRequestDTO;
import com.raeesmart.backend.Dto.Response.CampanaResponseDTO;
import com.raeesmart.backend.Model.Campana;
import com.raeesmart.backend.Model.Municipalidad;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Repository.CampanaRepository;
import com.raeesmart.backend.Repository.MunicipalidadRepository;
import com.raeesmart.backend.Repository.PuntoRecoleccionRepository;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.NotificacionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CampanaServiceImplTest {

    @Mock
    private CampanaRepository campanaRepository;

    @Mock
    private MunicipalidadRepository municipalidadRepository;

    @Mock
    private PuntoRecoleccionRepository puntoRecoleccionRepository;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private AutorizacionService autorizacionService;

    @InjectMocks
    private CampanaServiceImpl campanaService;

    @Test
    void crearCampanaGuardaElPuntoDeLaMismaMunicipalidad() {
        Municipalidad municipalidad = municipalidad(3L);
        PuntoRecoleccion punto = punto(4L, municipalidad);
        CampanaRequestDTO request = request(3L, 4L);

        when(autorizacionService.resolverMunicipalidadId(3L)).thenReturn(3L);
        when(municipalidadRepository.findById(3L)).thenReturn(Optional.of(municipalidad));
        when(puntoRecoleccionRepository.findById(4L)).thenReturn(Optional.of(punto));
        when(campanaRepository.save(any(Campana.class))).thenAnswer(invocation -> {
            Campana guardada = invocation.getArgument(0);
            guardada.setId(10L);
            return guardada;
        });

        CampanaResponseDTO response = campanaService.crear(request);

        ArgumentCaptor<Campana> captor = ArgumentCaptor.forClass(Campana.class);
        verify(campanaRepository).save(captor.capture());
        assertSame(punto, captor.getValue().getPuntoRecoleccion());
        assertEquals(4L, response.getPuntoRecoleccionId());
        assertEquals("Punto", response.getPuntoRecoleccionNombre());
    }

    @Test
    void crearCampanaSinPuntoDejaLaRelacionNula() {
        Municipalidad municipalidad = municipalidad(3L);
        CampanaRequestDTO request = request(3L, null);

        when(autorizacionService.resolverMunicipalidadId(3L)).thenReturn(3L);
        when(municipalidadRepository.findById(3L)).thenReturn(Optional.of(municipalidad));
        when(campanaRepository.save(any(Campana.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CampanaResponseDTO response = campanaService.crear(request);

        assertNull(response.getPuntoRecoleccionId());
        assertNull(response.getPuntoRecoleccionNombre());
    }

    @Test
    void crearCampanaRechazaUnPuntoDeOtraMunicipalidad() {
        Municipalidad propia = municipalidad(3L);
        PuntoRecoleccion ajeno = punto(4L, municipalidad(9L));
        CampanaRequestDTO request = request(3L, 4L);

        when(autorizacionService.resolverMunicipalidadId(3L)).thenReturn(3L);
        when(municipalidadRepository.findById(3L)).thenReturn(Optional.of(propia));
        when(puntoRecoleccionRepository.findById(4L)).thenReturn(Optional.of(ajeno));

        assertThrows(IllegalArgumentException.class, () -> campanaService.crear(request));
        verify(campanaRepository, never()).save(any(Campana.class));
    }

    private CampanaRequestDTO request(Long municipalidadId, Long puntoRecoleccionId) {
        return CampanaRequestDTO.builder()
                .municipalidadId(municipalidadId)
                .puntoRecoleccionId(puntoRecoleccionId)
                .titulo("Campaña")
                .fechaInicio(LocalDate.now().plusDays(1))
                .fechaFin(LocalDate.now().plusDays(5))
                .build();
    }

    private Municipalidad municipalidad(Long id) {
        return Municipalidad.builder()
                .id(id)
                .nombre("Municipalidad " + id)
                .build();
    }

    private PuntoRecoleccion punto(Long id, Municipalidad municipalidad) {
        return PuntoRecoleccion.builder()
                .id(id)
                .nombre("Punto")
                .municipalidad(municipalidad)
                .build();
    }
}
