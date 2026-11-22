package com.raeesmart.backend.Service.Impl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.raeesmart.backend.Dto.Response.AuditoriaEventoResponseDTO;
import com.raeesmart.backend.Model.AuditoriaEvento;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.AuditoriaEventoRepository;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service

public class AuditoriaServiceImpl implements AuditoriaService {
    private static final List<String> CLAVES_SENSIBLES = List.of(
            "password", "contrasena", "clave", "token", "jwt", "authorization",
            "codigohash", "qr", "imagen", "foto", "base64"
    );

    private final AuditoriaEventoRepository auditoriaEventoRepository;
    private final AutorizacionService autorizacionService;
    private final ObjectMapper objectMapper;

    public AuditoriaServiceImpl(
            AuditoriaEventoRepository auditoriaEventoRepository,
            AutorizacionService autorizacionService,
            ObjectMapper objectMapper) {
        this.auditoriaEventoRepository = auditoriaEventoRepository;
        this.autorizacionService = autorizacionService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void registrar(String accion, String entidad, String entidadId, Map<String, Object> detalles) {
        Usuario actor = null;
        try {
            actor = autorizacionService.obtenerActor();
        } catch (RuntimeException ignorado) {
            actor = null;
        }

        String endpoint = null;
        String metodoHttp = null;
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes atributos) {
            HttpServletRequest solicitud = atributos.getRequest();
            endpoint = solicitud.getRequestURI();
            metodoHttp = solicitud.getMethod();
        }

        AuditoriaEvento evento = AuditoriaEvento.builder()
                .fechaHora(Instant.now())
                .actorId(actor != null ? actor.getId() : null)
                .actorEmail(actor != null ? actor.getEmail() : null)
                .actorNombre(actor != null ? actor.getNombre() : null)
                .actorRol(actor != null && actor.getRolUsuario() != null ? actor.getRolUsuario().name() : null)
                .actorMunicipalidadId(actor != null && actor.getMunicipalidad() != null
                        ? actor.getMunicipalidad().getId() : null)
                .actorMunicipalidadNombre(actor != null && actor.getMunicipalidad() != null
                        ? actor.getMunicipalidad().getNombre() : null)
                .accion(accion)
                .entidad(entidad)
                .entidadId(entidadId)
                .detalles(serialize(sanitizar(detalles)))
                .resultado("EXITOSO")
                .origen(actor == null ? "SISTEMA" : "WEB")
                .endpoint(endpoint)
                .metodoHttp(metodoHttp)
                .build();
        auditoriaEventoRepository.save(evento);
    }

    @Override
    public List<AuditoriaEventoResponseDTO> listar(
            Long actorId,
            String accion,
            String entidad,
            String entidadId,
            Instant desde,
            Instant hasta,
            int pagina,
            int tamanio) {
        Specification<AuditoriaEvento> filtros = (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicados = new ArrayList<>();
            if (actorId != null) {
                predicados.add(criteriaBuilder.equal(root.get("actorId"), actorId));
            }
            if (accion != null && !accion.isBlank()) {
                predicados.add(criteriaBuilder.like(
                        criteriaBuilder.upper(root.get("accion")), "%" + accion.toUpperCase(Locale.ROOT) + "%"));
            }
            if (entidad != null && !entidad.isBlank()) {
                predicados.add(criteriaBuilder.like(
                        criteriaBuilder.upper(root.get("entidad")), "%" + entidad.toUpperCase(Locale.ROOT) + "%"));
            }
            if (entidadId != null && !entidadId.isBlank()) {
                predicados.add(criteriaBuilder.equal(root.get("entidadId"), entidadId));
            }
            if (desde != null) {
                predicados.add(criteriaBuilder.greaterThanOrEqualTo(root.get("fechaHora"), desde));
            }
            if (hasta != null) {
                predicados.add(criteriaBuilder.lessThanOrEqualTo(root.get("fechaHora"), hasta));
            }
            return criteriaBuilder.and(predicados.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        int paginaSegura = Math.max(0, pagina);
        int tamanioSeguro = Math.max(1, Math.min(tamanio, 200));
        return auditoriaEventoRepository
                .findAll(filtros, PageRequest.of(paginaSegura, tamanioSeguro, Sort.by(Sort.Direction.DESC, "fechaHora")))
                .stream()
                .map(this::mapear)
                .toList();
    }

    private Map<String, Object> sanitizar(Map<String, Object> detalles) {
        Map<String, Object> resultado = new LinkedHashMap<>();
        if (detalles == null) return resultado;
        detalles.forEach((clave, valor) -> {
            String claveNormalizada = clave.toLowerCase(Locale.ROOT);
            boolean sensible = CLAVES_SENSIBLES.stream().anyMatch(claveNormalizada::contains);
            if (sensible) {
                resultado.put(clave, "***");
            } else if (valor instanceof String texto && texto.length() > 500) {
                resultado.put(clave, texto.substring(0, 500));
            } else {
                resultado.put(clave, valor);
            }
        });
        return resultado;
    }

    private String serialize(Map<String, Object> detalles) {
        try {
            return objectMapper.writeValueAsString(detalles);
        } catch (JsonProcessingException ex) {
            return "{}";
        }
    }

    private AuditoriaEventoResponseDTO mapear(AuditoriaEvento evento) {
        return AuditoriaEventoResponseDTO.builder()
                .id(evento.getId())
                .fechaHora(evento.getFechaHora())
                .actorId(evento.getActorId())
                .actorEmail(evento.getActorEmail())
                .actorNombre(evento.getActorNombre())
                .actorRol(evento.getActorRol())
                .actorMunicipalidadId(evento.getActorMunicipalidadId())
                .actorMunicipalidadNombre(evento.getActorMunicipalidadNombre())
                .accion(evento.getAccion())
                .entidad(evento.getEntidad())
                .entidadId(evento.getEntidadId())
                .detalles(evento.getDetalles())
                .resultado(evento.getResultado())
                .origen(evento.getOrigen())
                .endpoint(evento.getEndpoint())
                .metodoHttp(evento.getMetodoHttp())
                .build();
    }
}
