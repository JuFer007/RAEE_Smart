package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Dto.Request.ValoracionAppRequestDTO;
import com.raeesmart.backend.Dto.Response.ResumenSatisfaccionResponseDTO;
import com.raeesmart.backend.Dto.Response.SatisfaccionDistribucionDTO;
import com.raeesmart.backend.Dto.Response.ValoracionAppResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Model.ValoracionApp;
import com.raeesmart.backend.Repository.ValoracionAppRepository;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.AuditoriaService;
import com.raeesmart.backend.Service.SatisfaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service

public class SatisfaccionServiceImpl implements SatisfaccionService {
    private final ValoracionAppRepository valoracionAppRepository;
    private final AutorizacionService autorizacionService;
    private AuditoriaService auditoriaService;

    public SatisfaccionServiceImpl(ValoracionAppRepository valoracionAppRepository,
                                   AutorizacionService autorizacionService) {
        this.valoracionAppRepository = valoracionAppRepository;
        this.autorizacionService = autorizacionService;
    }

    @Autowired(required = false)
    public void setAuditoriaService(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @Override
    @Transactional
    public ValoracionAppResponseDTO registrar(ValoracionAppRequestDTO request) {
        Usuario usuario = obtenerCiudadano();
        if (valoracionAppRepository.findByUsuarioId(usuario.getId()).isPresent()) {
            throw new IllegalStateException("Ya registraste tu opinión para esta aplicación");
        }
        ValoracionApp valoracion = ValoracionApp.builder()
                .usuario(usuario)
                .calificacion(request.getCalificacion())
                .comentario(normalizarComentario(request.getComentario()))
                .build();
        ValoracionApp guardada = valoracionAppRepository.save(valoracion);
        registrarAuditoria("VALORACION_APP_REGISTRAR", guardada);
        return mapear(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public ValoracionAppResponseDTO obtenerMia() {
        Usuario usuario = obtenerCiudadano();
        ValoracionApp valoracion = valoracionAppRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Todavía no registraste una opinión"));
        return mapear(valoracion);
    }

    @Override
    @Transactional
    public ValoracionAppResponseDTO actualizarMia(ValoracionAppRequestDTO request) {
        Usuario usuario = obtenerCiudadano();
        ValoracionApp valoracion = valoracionAppRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Todavía no registraste una opinión"));
        valoracion.setCalificacion(request.getCalificacion());
        valoracion.setComentario(normalizarComentario(request.getComentario()));
        ValoracionApp guardada = valoracionAppRepository.save(valoracion);
        registrarAuditoria("VALORACION_APP_ACTUALIZAR", guardada);
        return mapear(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenSatisfaccionResponseDTO obtenerResumen(Long municipalidadId) {
        Long filtro = resolverFiltroMunicipalidad(municipalidadId);
        List<ValoracionApp> valoraciones = filtro == null
                ? valoracionAppRepository.findAllByOrderByFechaRegistroDesc()
                : valoracionAppRepository.findByUsuarioMunicipalidadIdOrderByFechaRegistroDesc(filtro);
        long total = valoraciones.size();
        Double promedio = null;
        if (total > 0) {
            long suma = valoraciones.stream().mapToLong(ValoracionApp::getCalificacion).sum();
            promedio = Math.round((suma * 10.0) / total) / 10.0;
        }

        List<SatisfaccionDistribucionDTO> distribucion = new ArrayList<>();
        for (int calificacion = 1; calificacion <= 5; calificacion++) {
            final int valor = calificacion;
            long cantidad = valoraciones.stream()
                    .filter(v -> valor == v.getCalificacion())
                    .count();
            distribucion.add(SatisfaccionDistribucionDTO.builder()
                    .calificacion(valor)
                    .total(cantidad)
                    .build());
        }

        List<ValoracionAppResponseDTO> recientes = valoraciones.stream()
                .limit(5)
                .map(this::mapear)
                .toList();

        return ResumenSatisfaccionResponseDTO.builder()
                .total(total)
                .promedio(promedio)
                .distribucion(distribucion)
                .recientes(recientes)
                .build();
    }

    private Usuario obtenerCiudadano() {
        Usuario usuario = autorizacionService.obtenerActor();
        if (usuario.getRolUsuario() != RolUsuario.CIUDADANO) {
            throw new AccessDeniedException("Solo los ciudadanos pueden calificar la aplicación");
        }
        return usuario;
    }

    private Long resolverFiltroMunicipalidad(Long municipalidadId) {
        Usuario actor = autorizacionService.obtenerActor();
        boolean superAdmin = actor.getRolUsuario() == RolUsuario.ADMIN && actor.getMunicipalidad() == null;
        if (superAdmin) {
            return municipalidadId;
        }
        Long municipalidadActor = actor.getMunicipalidad() != null ? actor.getMunicipalidad().getId() : null;
        if (municipalidadActor == null) {
            throw new AccessDeniedException("No autorizado para consultar estas valoraciones");
        }
        if (municipalidadId != null && !municipalidadId.equals(municipalidadActor)) {
            throw new AccessDeniedException("No autorizado para consultar otra municipalidad");
        }
        return municipalidadActor;
    }

    private String normalizarComentario(String comentario) {
        if (comentario == null) return null;
        String texto = comentario.trim();
        return texto.isEmpty() ? null : texto;
    }

    private void registrarAuditoria(String accion, ValoracionApp valoracion) {
        if (auditoriaService == null) return;
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("calificacion", valoracion.getCalificacion());
        detalles.put("tieneComentario", valoracion.getComentario() != null && !valoracion.getComentario().isBlank());
        auditoriaService.registrar(accion, "VALORACION_APP", String.valueOf(valoracion.getId()), detalles);
    }

    private ValoracionAppResponseDTO mapear(ValoracionApp valoracion) {
        Usuario usuario = valoracion.getUsuario();
        return ValoracionAppResponseDTO.builder()
                .id(valoracion.getId())
                .calificacion(valoracion.getCalificacion())
                .comentario(valoracion.getComentario())
                .fechaRegistro(valoracion.getFechaRegistro())
                .fechaActualizacion(valoracion.getFechaActualizacion())
                .ciudadanoNombre(usuario != null ? usuario.getNombre() : null)
                .municipalidadId(usuario != null && usuario.getMunicipalidad() != null
                        ? usuario.getMunicipalidad().getId() : null)
                .municipalidadNombre(usuario != null && usuario.getMunicipalidad() != null
                        ? usuario.getMunicipalidad().getNombre() : null)
                .build();
    }
}
