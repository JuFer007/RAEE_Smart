package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Dto.Request.PuntoRecoleccionRequestDTO;
import com.raeesmart.backend.Dto.Response.PuntoRecoleccionResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Enums.TipoNotificacion;
import com.raeesmart.backend.Model.Municipalidad;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Repository.MunicipalidadRepository;
import com.raeesmart.backend.Repository.PuntoRecoleccionRepository;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.NotificacionService;
import com.raeesmart.backend.Service.PuntoRecoleccionService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service

public class PuntoRecoleccionServiceImpl implements PuntoRecoleccionService {
    private final PuntoRecoleccionRepository puntoRepository;
    private final MunicipalidadRepository municipalidadRepository;
    private final NotificacionService notificacionService;
    private final AutorizacionService autorizacionService;

    public PuntoRecoleccionServiceImpl(PuntoRecoleccionRepository puntoRepository,
                                       MunicipalidadRepository municipalidadRepository,
                                       NotificacionService notificacionService,
                                       AutorizacionService autorizacionService) {
        this.puntoRepository = puntoRepository;
        this.municipalidadRepository = municipalidadRepository;
        this.notificacionService = notificacionService;
        this.autorizacionService = autorizacionService;
    }

    @Transactional
    @Override
    public PuntoRecoleccionResponseDTO crear(PuntoRecoleccionRequestDTO request) {
        Long municipalidadId = autorizacionService.resolverMunicipalidadId(request.getMunicipalidadId());
        Municipalidad municipalidad = buscarMunicipalidad(municipalidadId);

        PuntoRecoleccion punto = PuntoRecoleccion.builder()
                .municipalidad(municipalidad)
                .nombre(request.getNombre().trim())
                .direccion(request.getDireccion())
                .latitud(request.getLatitud())
                .longitud(request.getLongitud())
                .horarioAtencion(request.getHorarioAtencion())
                .capacidadDiaria(request.getCapacidadDiaria())
                .build();

        return mapearAResponse(puntoRepository.save(punto));
    }

    @Transactional
    @Override
    public PuntoRecoleccionResponseDTO actualizar(Long id, PuntoRecoleccionRequestDTO request) {
        PuntoRecoleccion punto = puntoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Punto de recolección no encontrado"));
        autorizacionService.validarGestionPunto(punto);

        String horarioAnterior = punto.getHorarioAtencion();
        Long municipalidadId = autorizacionService.resolverMunicipalidadId(request.getMunicipalidadId());

        punto.setMunicipalidad(buscarMunicipalidad(municipalidadId));
        punto.setNombre(request.getNombre().trim());
        punto.setDireccion(request.getDireccion());
        punto.setLatitud(request.getLatitud());
        punto.setLongitud(request.getLongitud());
        punto.setHorarioAtencion(request.getHorarioAtencion());
        punto.setCapacidadDiaria(request.getCapacidadDiaria());
        punto = puntoRepository.save(punto);

        boolean cambioHorario = !Objects.equals(horarioAnterior, punto.getHorarioAtencion());
        if (cambioHorario && Boolean.TRUE.equals(punto.getMunicipalidad().getActivo())) {
            notificacionService.notificarCiudadanos(
                    TipoNotificacion.HORARIO,
                    "Cambio de horario",
                    punto.getNombre() + " ahora atiende: "
                            + (punto.getHorarioAtencion() != null ? punto.getHorarioAtencion() : "horario por confirmar"));
        }

        return mapearAResponse(punto);
    }

    @Transactional
    @Override
    public void eliminar(Long id) {
        PuntoRecoleccion punto = puntoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Punto de recolección no encontrado"));
        autorizacionService.validarGestionPunto(punto);
        try {
            puntoRepository.delete(punto);
            puntoRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("No se puede eliminar: el punto ya tiene entregas registradas");
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<PuntoRecoleccionResponseDTO> listarPorMunicipalidad(Long municipalidadId) {
        autorizacionService.validarAccesoMunicipalidad(municipalidadId);
        return puntoRepository.findByMunicipalidadId(municipalidadId).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<PuntoRecoleccionResponseDTO> listarTodos() {
        autorizacionService.validarSuperAdmin();
        return puntoRepository.findAll().stream().map(this::mapearAResponse).toList();
    }

    private Municipalidad buscarMunicipalidad(Long id) {
        return municipalidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Municipalidad no encontrada"));
    }

    private PuntoRecoleccionResponseDTO mapearAResponse(PuntoRecoleccion punto) {
        return PuntoRecoleccionResponseDTO.builder()
                .id(punto.getId())
                .municipalidadId(punto.getMunicipalidad().getId())
                .municipalidadNombre(punto.getMunicipalidad().getNombre())
                .nombre(punto.getNombre())
                .direccion(punto.getDireccion())
                .latitud(punto.getLatitud())
                .longitud(punto.getLongitud())
                .horarioAtencion(punto.getHorarioAtencion())
                .capacidadDiaria(punto.getCapacidadDiaria())
                .build();
    }
}
