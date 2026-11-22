package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Service.CampanaService;
import com.raeesmart.backend.Dto.Request.CampanaRequestDTO;
import com.raeesmart.backend.Dto.Response.CampanaResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Campana;
import com.raeesmart.backend.Model.Enums.TipoNotificacion;
import com.raeesmart.backend.Model.Municipalidad;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Repository.CampanaRepository;
import com.raeesmart.backend.Repository.MunicipalidadRepository;
import com.raeesmart.backend.Repository.PuntoRecoleccionRepository;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.AuditoriaService;
import com.raeesmart.backend.Service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

@Service
public class CampanaServiceImpl implements CampanaService {
    private static final ZoneId ZONA_PERU = ZoneId.of("America/Lima");
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final CampanaRepository campanaRepository;
    private final MunicipalidadRepository municipalidadRepository;
    private final PuntoRecoleccionRepository puntoRecoleccionRepository;
    private final NotificacionService notificacionService;
    private final AutorizacionService autorizacionService;
    private AuditoriaService auditoriaService;

    public CampanaServiceImpl(CampanaRepository campanaRepository,
                              MunicipalidadRepository municipalidadRepository,
                              PuntoRecoleccionRepository puntoRecoleccionRepository,
                              NotificacionService notificacionService,
                              AutorizacionService autorizacionService) {
        this.campanaRepository = campanaRepository;
        this.municipalidadRepository = municipalidadRepository;
        this.puntoRecoleccionRepository = puntoRecoleccionRepository;
        this.notificacionService = notificacionService;
        this.autorizacionService = autorizacionService;
    }

    @Autowired(required = false)
    public void setAuditoriaService(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    @Override
    public CampanaResponseDTO crear(CampanaRequestDTO request) {
        validarFechas(request);
        Long municipalidadId = autorizacionService.resolverMunicipalidadId(request.getMunicipalidadId());
        Municipalidad municipalidad = buscarMunicipalidad(municipalidadId);
        PuntoRecoleccion punto = resolverPunto(request.getPuntoRecoleccionId(), municipalidadId);
        Campana campana = Campana.builder()
                .municipalidad(municipalidad)
                .titulo(request.getTitulo().trim())
                .descripcion(request.getDescripcion())
                .lugar(request.getLugar())
                .puntoRecoleccion(punto)
                .horario(request.getHorario())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .activa(request.getActiva() == null || request.getActiva())
                .build();
        campana = campanaRepository.save(campana);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("titulo", campana.getTitulo());
        detalles.put("municipalidadId", campana.getMunicipalidad() != null ? campana.getMunicipalidad().getId() : null);
        detalles.put("activa", campana.getActiva());
        registrar("CAMPANA_CREAR", "CAMPANA", String.valueOf(campana.getId()), detalles);
        notificarSiEsVigente(campana);
        return mapearAResponse(campana);
    }

    @Transactional
    @Override
    public CampanaResponseDTO actualizar(Long id, CampanaRequestDTO request) {
        validarFechas(request);
        Campana campana = buscarCampana(id);
        String detalleAnterior = detallePublico(campana);
        autorizacionService.validarGestionCampana(campana);
        Long municipalidadId = autorizacionService.resolverMunicipalidadId(request.getMunicipalidadId());
        boolean estabaActiva = Boolean.TRUE.equals(campana.getActiva());
        boolean nuevaActiva = request.getActiva() == null ? estabaActiva : request.getActiva();
        campana.setMunicipalidad(buscarMunicipalidad(municipalidadId));
        campana.setTitulo(request.getTitulo().trim());
        campana.setDescripcion(request.getDescripcion());
        campana.setLugar(request.getLugar());
        campana.setPuntoRecoleccion(resolverPunto(request.getPuntoRecoleccionId(), municipalidadId));
        campana.setHorario(request.getHorario());
        campana.setFechaInicio(request.getFechaInicio());
        campana.setFechaFin(request.getFechaFin());
        campana.setActiva(nuevaActiva);
        if (nuevaActiva) {
            limpiarDesactivacion(campana);
        } else if (!estabaActiva) {
            if (request.getMotivoDesactivacion() != null && !request.getMotivoDesactivacion().isBlank()) {
                registrarDesactivacion(campana, request.getMotivoDesactivacion());
            }
        } else if (esAntesDelFin(campana)) {
            registrarDesactivacion(campana, request.getMotivoDesactivacion());
        } else {
            limpiarDesactivacion(campana);
        }
        Campana guardada = campanaRepository.save(campana);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("titulo", guardada.getTitulo());
        detalles.put("estabaActiva", estabaActiva);
        detalles.put("activa", nuevaActiva);
        registrar("CAMPANA_ACTUALIZAR", "CAMPANA", String.valueOf(id), detalles);
        notificarCambiosCampana(guardada, detalleAnterior, estabaActiva, nuevaActiva);
        return mapearAResponse(guardada);
    }

    @Transactional
    @Override
    public CampanaResponseDTO cambiarEstado(Long id, boolean activa, String motivoDesactivacion) {
        Campana campana = buscarCampana(id);
        autorizacionService.validarGestionCampana(campana);
        boolean estabaActiva = Boolean.TRUE.equals(campana.getActiva());
        if (activa) {
            limpiarDesactivacion(campana);
        } else if (estabaActiva && esAntesDelFin(campana)) {
            registrarDesactivacion(campana, motivoDesactivacion);
        } else {
            limpiarDesactivacion(campana);
        }
        boolean notificarSuspension = estabaActiva && !activa && esAntesDelFin(campana);
        campana.setActiva(activa);
        campana = campanaRepository.save(campana);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("titulo", campana.getTitulo());
        detalles.put("estabaActiva", estabaActiva);
        detalles.put("activa", activa);
        registrar("CAMPANA_CAMBIAR_ESTADO", "CAMPANA", String.valueOf(id), detalles);
        if (notificarSuspension) {
            notificarCampana("Campaña suspendida", campana);
        }
        if (activa && !estabaActiva) {
            notificarCampana("Campaña reactivada", campana);
        }
        return mapearAResponse(campana);
    }

    @Transactional
    @Override
    public void eliminar(Long id) {
        Campana campana = buscarCampana(id);
        autorizacionService.validarGestionCampana(campana);
        campanaRepository.delete(campana);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("titulo", campana.getTitulo());
        registrar("CAMPANA_ELIMINAR", "CAMPANA", String.valueOf(id), detalles);
    }

    @Transactional(readOnly = true)
    @Override
    public List<CampanaResponseDTO> listarPorMunicipalidad(Long municipalidadId) {
        autorizacionService.validarAccesoMunicipalidad(municipalidadId);
        return campanaRepository.findByMunicipalidadIdOrderByFechaInicioDesc(municipalidadId).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<CampanaResponseDTO> listarTodas() {
        autorizacionService.validarSuperAdmin();
        return campanaRepository.findAll().stream()
                .map(this::mapearAResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<CampanaResponseDTO> listarVigentes(Long municipalidadId) {
        LocalDate hoy = LocalDate.now(ZONA_PERU);
        return campanaRepository
                .findByMunicipalidadIdAndActivaTrueAndFechaFinGreaterThanEqualOrderByFechaInicioAsc(municipalidadId, hoy)
                .stream()
                .map(this::mapearAResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<CampanaResponseDTO> listarVigentesPublic(Long municipalidadId) {
        Municipalidad muni = buscarMunicipalidad(municipalidadId);
        if (muni.getCampanasHabilitadas() == null || !muni.getCampanasHabilitadas()) {
            return Collections.emptyList();
        }
        LocalDate hoy = LocalDate.now(ZONA_PERU);
        return campanaRepository
                .findByMunicipalidadIdAndActivaTrueAndFechaFinGreaterThanEqualOrderByFechaInicioAsc(municipalidadId, hoy)
                .stream()
                .map(this::mapearAResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public CampanaResponseDTO obtenerPublic(Long id) {
        Campana campana = buscarCampana(id);
        Municipalidad muni = campana.getMunicipalidad();
        if (muni.getCampanasHabilitadas() == null || !muni.getCampanasHabilitadas()) {
            throw new ResourceNotFoundException("Campaña no encontrada");
        }
        LocalDate hoy = LocalDate.now(ZONA_PERU);
        if (!Boolean.TRUE.equals(campana.getActiva()) || campana.getFechaFin().isBefore(hoy)) {
            throw new ResourceNotFoundException("Campaña no encontrada");
        }
        return mapearAResponse(campana);
    }

    private void notificarSiEsVigente(Campana campana) {
        boolean municipalidadActiva = Boolean.TRUE.equals(campana.getMunicipalidad().getActivo());
        if (Boolean.TRUE.equals(campana.getActiva()) && municipalidadActiva && esAntesDelFin(campana)) {
            notificarCampana("Nueva campaña de recolección", campana);
        }
    }

    private void notificarCambiosCampana(Campana campana, String detalleAnterior, boolean estabaActiva, boolean nuevaActiva) {
        if (!esAntesDelFin(campana)) {
            return;
        }
        if (estabaActiva && !nuevaActiva) {
            notificarCampana("Campaña suspendida", campana);
            return;
        }
        if (!estabaActiva && nuevaActiva) {
            notificarCampana("Campaña reactivada", campana);
            return;
        }
        if (nuevaActiva && !detalleAnterior.equals(detallePublico(campana))) {
            notificarCampana("Campaña actualizada", campana);
        }
    }

    private void notificarCampana(String titulo, Campana campana) {
        if (!Boolean.TRUE.equals(campana.getMunicipalidad().getActivo())) {
            return;
        }
        String detalle = campana.getTitulo()
                + " - " + campana.getFechaInicio().format(FORMATO_FECHA)
                + " al " + campana.getFechaFin().format(FORMATO_FECHA)
                + (campana.getLugar() != null && !campana.getLugar().isBlank() ? " - " + campana.getLugar() : "");
        notificacionService.notificarCiudadanos(TipoNotificacion.CAMPANA, titulo, detalle);
    }

    private String detallePublico(Campana campana) {
        return String.join("|",
                valorTexto(campana.getTitulo()),
                valorTexto(campana.getDescripcion()),
                valorTexto(campana.getLugar()),
                campana.getPuntoRecoleccion() == null ? "" : String.valueOf(campana.getPuntoRecoleccion().getId()),
                valorTexto(campana.getHorario()),
                campana.getFechaInicio() == null ? "" : campana.getFechaInicio().toString(),
                campana.getFechaFin() == null ? "" : campana.getFechaFin().toString(),
                campana.getMunicipalidad() == null ? "" : String.valueOf(campana.getMunicipalidad().getId()),
                String.valueOf(campana.getActiva()));
    }

    private String valorTexto(String texto) {
        return texto == null ? "" : texto.trim();
    }

    private boolean esAntesDelFin(Campana campana) {
        return !campana.getFechaFin().isBefore(LocalDate.now(ZONA_PERU));
    }

    private void validarMotivo(String motivo) {
        if (motivo == null || motivo.isBlank()) {
            throw new IllegalArgumentException(
                    "El motivo de desactivación es obligatorio cuando la campaña aún no termina");
        }
        if (motivo.trim().length() > 300) {
            throw new IllegalArgumentException(
                    "El motivo de desactivación no debe superar los 300 caracteres");
        }
    }

    private void registrarDesactivacion(Campana campana, String motivo) {
        validarMotivo(motivo);
        campana.setMotivoDesactivacion(motivo.trim());
        campana.setFechaDesactivacion(LocalDateTime.now(ZONA_PERU));
        campana.setDesactivadaPor(autorizacionService.obtenerActor().getNombre());
    }

    private void limpiarDesactivacion(Campana campana) {
        campana.setMotivoDesactivacion(null);
        campana.setFechaDesactivacion(null);
        campana.setDesactivadaPor(null);
    }

    private void registrar(String accion, String entidad, String entidadId, Map<String, Object> detalles) {
        if (auditoriaService != null) {
            auditoriaService.registrar(accion, entidad, entidadId, detalles);
        }
    }

    private void validarFechas(CampanaRequestDTO request) {
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
    }

    private Municipalidad buscarMunicipalidad(Long id) {
        return municipalidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Municipalidad no encontrada"));
    }

    private PuntoRecoleccion resolverPunto(Long puntoId, Long municipalidadId) {
        if (puntoId == null) {
            return null;
        }
        PuntoRecoleccion punto = puntoRecoleccionRepository.findById(puntoId)
                .orElseThrow(() -> new ResourceNotFoundException("Punto de recolección no encontrado"));
        if (punto.getMunicipalidad() == null
                || !municipalidadId.equals(punto.getMunicipalidad().getId())) {
            throw new IllegalArgumentException(
                    "El punto de recolección no pertenece a la municipalidad indicada");
        }
        return punto;
    }

    private Campana buscarCampana(Long id) {
        return campanaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaña no encontrada"));
    }

    private String calcularEstado(Campana campana) {
        if (!Boolean.TRUE.equals(campana.getActiva())) return "INACTIVA";
        LocalDate hoy = LocalDate.now(ZONA_PERU);
        if (hoy.isBefore(campana.getFechaInicio())) return "PROXIMA";
        if (hoy.isAfter(campana.getFechaFin())) return "FINALIZADA";
        return "EN_CURSO";
    }

    private CampanaResponseDTO mapearAResponse(Campana campana) {
        PuntoRecoleccion punto = campana.getPuntoRecoleccion();
        return CampanaResponseDTO.builder()
                .id(campana.getId())
                .municipalidadId(campana.getMunicipalidad().getId())
                .municipalidadNombre(campana.getMunicipalidad().getNombre())
                .titulo(campana.getTitulo())
                .descripcion(campana.getDescripcion())
                .lugar(campana.getLugar())
                .puntoRecoleccionId(punto != null ? punto.getId() : null)
                .puntoRecoleccionNombre(punto != null ? punto.getNombre() : null)
                .horario(campana.getHorario())
                .fechaInicio(campana.getFechaInicio())
                .fechaFin(campana.getFechaFin())
                .activa(campana.getActiva())
                .estado(calcularEstado(campana))
                .motivoDesactivacion(campana.getMotivoDesactivacion())
                .fechaDesactivacion(campana.getFechaDesactivacion())
                .desactivadaPor(campana.getDesactivadaPor())
                .build();
    }
}
