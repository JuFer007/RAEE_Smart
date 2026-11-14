package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Dto.Request.EntregaRequestDTO;
import com.raeesmart.backend.Dto.Response.ClasificacionResponseDTO;
import com.raeesmart.backend.Dto.Response.EntregaResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.*;
import com.raeesmart.backend.Model.Enums.EstadoEntrega;
import com.raeesmart.backend.Model.Enums.TipoNotificacion;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Repository.*;
import com.raeesmart.backend.Service.CertificadoService;
import com.raeesmart.backend.Service.ClasificacionIAService;
import com.raeesmart.backend.Service.EntregaService;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.GeolocalizacionService;
import com.raeesmart.backend.Service.NotificacionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntregaServiceImpl implements EntregaService {
    private final EntregaRepository entregaRepository;
    private final PuntoRecoleccionRepository puntoRecoleccionRepository;
    private final CategoriaRAEERepository categoriaRAEERepository;
    private final AlmacenamientoServiceImpl almacenamientoService;
    private final ClasificacionIAService clasificacionIAService;
    private final GeolocalizacionService geolocalizacionService;
    private final NotificacionService notificacionService;
    private final CertificadoService certificadoService;
    private final AutorizacionService autorizacionService;

    public EntregaServiceImpl(EntregaRepository entregaRepository,
                              PuntoRecoleccionRepository puntoRecoleccionRepository,
                              CategoriaRAEERepository categoriaRAEERepository,
                              AlmacenamientoServiceImpl almacenamientoService,
                              ClasificacionIAService clasificacionIAService,
                              GeolocalizacionService geolocalizacionService,
                              NotificacionService notificacionService,
                              CertificadoService certificadoService,
                              AutorizacionService autorizacionService) {
        this.entregaRepository = entregaRepository;
        this.puntoRecoleccionRepository = puntoRecoleccionRepository;
        this.categoriaRAEERepository = categoriaRAEERepository;
        this.almacenamientoService = almacenamientoService;
        this.clasificacionIAService = clasificacionIAService;
        this.geolocalizacionService = geolocalizacionService;
        this.notificacionService = notificacionService;
        this.certificadoService = certificadoService;
        this.autorizacionService = autorizacionService;
    }

    @Transactional
    @Override
    public EntregaResponseDTO registrarEntrega(EntregaRequestDTO request) {
        Usuario usuario = autorizacionService.obtenerActor();
        ClasificacionResponseDTO clasificacion = clasificacionIAService.clasificar(request.getFoto());
        PuntoRecoleccion punto = resolverPuntoRecoleccion(usuario, request);
        String fotoUrl = almacenamientoService.guardarFoto(request.getFoto());

        Entrega entrega = Entrega.builder()
                .usuario(usuario)
                .tipoRaee(clasificacion.getTipoDetectado())
                .puntoRecoleccion(punto)
                .fotoUrl(fotoUrl)
                .confianzaIa(clasificacion.getConfianza())
                .clasificacionCorregida(false)
                .latitudUsuario(request.getLatitud())
                .longitudUsuario(request.getLongitud())
                .estado(EstadoEntrega.REGISTRADA)
                .build();

        entrega = entregaRepository.save(entrega);

        notificacionService.notificarUsuario(
                usuario,
                TipoNotificacion.ENTREGA,
                "Entrega registrada",
                "Tu entrega en " + punto.getNombre() + " fue registrada. El punto debe confirmar la recepcion para generar tu certificado.");

        return mapearAResponse(entrega);
    }

    @Transactional
    @Override
    public EntregaResponseDTO confirmarEntrega(Long entregaId) {
        Entrega entrega = entregaRepository.findById(entregaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada"));

        autorizacionService.validarGestionEntrega(entrega);

        if (entrega.getEstado() == EstadoEntrega.RECHAZADA) {
            throw new IllegalStateException("No se puede confirmar una entrega rechazada");
        }
        if (entrega.getEstado() == EstadoEntrega.CONFIRMADA) {
            return mapearAResponse(entrega);
        }

        if (entrega.getEstado() == EstadoEntrega.REGISTRADA) {
            entrega.setEstado(EstadoEntrega.EN_PROCESO);
            entrega = entregaRepository.save(entrega);
        }

        entrega.setEstado(EstadoEntrega.CONFIRMADA);
        entrega.setFechaConfirmacion(LocalDateTime.now());
        if (entrega.getCertificado() == null) {
            entrega.setCertificado(certificadoService.generarCertificado(entrega));
        }
        entrega = entregaRepository.save(entrega);

        notificacionService.notificarUsuario(
                entrega.getUsuario(),
                TipoNotificacion.ENTREGA,
                "Certificado disponible",
                "La recepcion de tu RAEE fue confirmada. Ya puedes descargar tu certificado.");

        return mapearAResponse(entrega);
    }

    @Transactional
    @Override
    public EntregaResponseDTO rechazarEntrega(Long entregaId) {
        Entrega entrega = entregaRepository.findById(entregaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada"));

        autorizacionService.validarGestionEntrega(entrega);

        if (entrega.getEstado() == EstadoEntrega.CONFIRMADA) {
            throw new IllegalStateException("No se puede rechazar una entrega confirmada");
        }
        if (entrega.getEstado() == EstadoEntrega.RECHAZADA) {
            return mapearAResponse(entrega);
        }

        if (entrega.getEstado() == EstadoEntrega.REGISTRADA) {
            entrega.setEstado(EstadoEntrega.EN_PROCESO);
            entrega = entregaRepository.save(entrega);
        }

        entrega.setEstado(EstadoEntrega.RECHAZADA);
        entrega = entregaRepository.save(entrega);

        notificacionService.notificarUsuario(
                entrega.getUsuario(),
                TipoNotificacion.ENTREGA,
                "Entrega rechazada",
                "La recepcion de tu RAEE en " + entrega.getPuntoRecoleccion().getNombre()
                        + " fue rechazada. Acercate al punto para mas informacion.");

        return mapearAResponse(entrega);
    }

    @Transactional
    @Override
    public EntregaResponseDTO corregirClasificacion(Long entregaId, TipoRAEE tipoCorregido) {
        Entrega entrega = entregaRepository.findById(entregaId).orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada"));

        autorizacionService.validarAccesoEntrega(entrega);

        if (entrega.getEstado() == EstadoEntrega.CONFIRMADA || entrega.getEstado() == EstadoEntrega.RECHAZADA) {
            throw new IllegalStateException("No se puede corregir una entrega confirmada o rechazada");
        }

        if (tipoCorregido != null) {
            entrega.setTipoCorregido(tipoCorregido);
            entrega.setClasificacionCorregida(true);
            entrega = entregaRepository.save(entrega);
        }

        return mapearAResponse(entrega);
    }

    @Override
    public EntregaResponseDTO buscarPorId(Long id) {
        Entrega entrega = entregaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada"));
        autorizacionService.validarAccesoEntrega(entrega);
        return mapearAResponse(entrega);
    }

    @Override
    public List<EntregaResponseDTO> listarPorUsuario(Long usuarioId) {
        autorizacionService.validarAccesoUsuario(usuarioId);
        return entregaRepository.findByUsuarioIdOrderByFechaRegistroDesc(usuarioId).stream().map(this::mapearAResponse).collect(Collectors.toList());
    }

    @Override
    public List<EntregaResponseDTO> listarPorMunicipalidad(Long municipalidadId) {
        autorizacionService.validarAccesoMunicipalidad(municipalidadId);
        return entregaRepository.findByPuntoRecoleccionMunicipalidadId(municipalidadId).stream().map(this::mapearAResponse).collect(Collectors.toList());
    }

    private EntregaResponseDTO mapearAResponse(Entrega entrega) {
        TipoRAEE tipoFinal = entrega.getClasificacionCorregida()
                ? entrega.getTipoCorregido()
                : entrega.getTipoRaee();

        CategoriaRAEE metadata = categoriaRAEERepository.findByTipo(tipoFinal).orElse(null);

        return EntregaResponseDTO.builder()
                .id(entrega.getId())
                .tipoRaee(tipoFinal)
                .nombreCategoriaVisible(metadata != null ? metadata.getNombreVisible() : tipoFinal.name())
                .iconoCategoria(metadata != null ? metadata.getIconoUrl() : null)
                .confianzaIa(entrega.getConfianzaIa())
                .clasificacionCorregida(entrega.getClasificacionCorregida())
                .estado(entrega.getEstado())
                .puntoRecoleccionId(entrega.getPuntoRecoleccion().getId())
                .puntoRecoleccionNombre(entrega.getPuntoRecoleccion().getNombre())
                .puntoRecoleccionDireccion(entrega.getPuntoRecoleccion().getDireccion())
                .certificadoCodigoQr(entrega.getCertificado() != null ? entrega.getCertificado().getCodigoQr() : null)
                .fechaRegistro(entrega.getFechaRegistro())
                .fechaConfirmacion(entrega.getFechaConfirmacion())
                .build();
    }

    private PuntoRecoleccion resolverPuntoRecoleccion(Usuario usuario, EntregaRequestDTO request) {
        if (request.getPuntoRecoleccionId() == null) {
            return geolocalizacionService.encontrarPuntoMasCercano(request.getLatitud(), request.getLongitud());
        }

        PuntoRecoleccion punto = puntoRecoleccionRepository.findById(request.getPuntoRecoleccionId())
                .orElseThrow(() -> new ResourceNotFoundException("Punto de recoleccion no encontrado"));

        if (punto.getMunicipalidad() == null || Boolean.FALSE.equals(punto.getMunicipalidad().getActivo())) {
            throw new IllegalArgumentException("El punto de recoleccion no esta disponible");
        }
        if (usuario.getMunicipalidad() != null
                && !usuario.getMunicipalidad().getId().equals(punto.getMunicipalidad().getId())) {
            throw new IllegalArgumentException("El punto de recoleccion no pertenece a tu municipalidad");
        }

        return punto;
    }
}
