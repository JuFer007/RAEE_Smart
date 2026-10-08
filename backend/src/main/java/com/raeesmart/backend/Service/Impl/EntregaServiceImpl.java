package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Dto.Request.EntregaRequestDTO;
import com.raeesmart.backend.Dto.Response.ClasificacionResponseDTO;
import com.raeesmart.backend.Dto.Response.EntregaResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.*;
import com.raeesmart.backend.Model.Enums.EstadoEntrega;
import com.raeesmart.backend.Model.Enums.TipoNotificacion;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Repository.CategoriaRAEERepository;
import com.raeesmart.backend.Repository.EntregaRepository;
import com.raeesmart.backend.Repository.UsuarioRepository;
import com.raeesmart.backend.Service.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service

public class EntregaServiceImpl implements EntregaService {
    private final EntregaRepository entregaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRAEERepository categoriaRAEERepository;
    private final ClasificacionIAService clasificacionIAService;
    private final GeolocalizacionService geolocalizacionService;
    private final CertificadoService certificadoService;
    private final AlmacenamientoService almacenamientoService;
    private final NotificacionService notificacionService;

    public EntregaServiceImpl(EntregaRepository entregaRepository,
                              UsuarioRepository usuarioRepository,
                              CategoriaRAEERepository categoriaRAEERepository,
                              ClasificacionIAService clasificacionIAService,
                              GeolocalizacionService geolocalizacionService,
                              CertificadoService certificadoService,
                              AlmacenamientoService almacenamientoService,
                              NotificacionService notificacionService) {
        this.entregaRepository = entregaRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRAEERepository = categoriaRAEERepository;
        this.clasificacionIAService = clasificacionIAService;
        this.geolocalizacionService = geolocalizacionService;
        this.certificadoService = certificadoService;
        this.almacenamientoService = almacenamientoService;
        this.notificacionService = notificacionService;
    }

    @Transactional
    @Override
    public EntregaResponseDTO registrarEntrega(EntregaRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId()).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        ClasificacionResponseDTO clasificacion = clasificacionIAService.clasificar(request.getFoto());
        PuntoRecoleccion punto = geolocalizacionService.encontrarPuntoMasCercano(request.getLatitud(), request.getLongitud());
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

        Certificado certificado = certificadoService.generarCertificado(entrega);
        entrega.setCertificado(certificado);
        entrega.setEstado(EstadoEntrega.CONFIRMADA);
        entrega = entregaRepository.save(entrega);

        notificacionService.notificarUsuario(
                usuario,
                TipoNotificacion.ENTREGA,
                "Entrega confirmada",
                "Tu entrega en " + punto.getNombre() + " fue registrada. Ya puedes ver tu certificado.");

        return mapearAResponse(entrega);
    }

    @Transactional
    @Override
    public EntregaResponseDTO corregirClasificacion(Long entregaId, TipoRAEE tipoCorregido) {
        Entrega entrega = entregaRepository.findById(entregaId).orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada"));

        entrega.setTipoCorregido(tipoCorregido);
        entrega.setClasificacionCorregida(true);
        entrega = entregaRepository.save(entrega);

        return mapearAResponse(entrega);
    }

    @Override
    public EntregaResponseDTO buscarPorId(Long id) {
        Entrega entrega = entregaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada"));
        return mapearAResponse(entrega);
    }

    @Override
    public List<EntregaResponseDTO> listarPorUsuario(Long usuarioId) {
        return entregaRepository.findByUsuarioIdOrderByFechaRegistroDesc(usuarioId).stream().map(this::mapearAResponse).collect(Collectors.toList());
    }

    @Override
    public List<EntregaResponseDTO> listarPorMunicipalidad(Long municipalidadId) {
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
                .puntoRecoleccionNombre(entrega.getPuntoRecoleccion().getNombre())
                .puntoRecoleccionDireccion(null)
                .certificadoCodigoQr(entrega.getCertificado() != null ? entrega.getCertificado().getCodigoQr() : null)
                .fechaRegistro(entrega.getFechaRegistro())
                .build();
    }
}
