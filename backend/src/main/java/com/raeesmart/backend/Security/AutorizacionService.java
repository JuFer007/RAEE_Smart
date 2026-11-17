package com.raeesmart.backend.Security;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Campana;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service

public class AutorizacionService {
    private final UsuarioRepository usuarioRepository;

    public AutorizacionService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario obtenerActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("No autorizado");
        }
        return usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public void validarAccesoUsuario(Long usuarioId) {
        Usuario actor = obtenerActor();
        if (esSuperAdmin(actor) || actor.getId().equals(usuarioId)) {
            return;
        }
        throw new AccessDeniedException("No autorizado para acceder a este usuario");
    }

    public void validarAccesoEntrega(Entrega entrega) {
        Usuario actor = obtenerActor();
        if (esSuperAdmin(actor)) {
            return;
        }
        if (actor.getMunicipalidad() != null) {
            if (perteneceAMunicipalidad(actor, entrega)) {
                return;
            }
            throw new AccessDeniedException("No autorizado para acceder a esta entrega");
        }
        if (actor.getRolUsuario() == RolUsuario.CIUDADANO
                && entrega.getUsuario() != null
                && actor.getId().equals(entrega.getUsuario().getId())) {
            return;
        }
        throw new AccessDeniedException("No autorizado para acceder a esta entrega");
    }

    public void validarGestionEntrega(Entrega entrega) {
        Usuario actor = obtenerActor();
        if (esSuperAdmin(actor) || perteneceAMunicipalidad(actor, entrega)) {
            return;
        }
        throw new AccessDeniedException("No autorizado para gestionar esta entrega");
    }

    public void validarAccesoMunicipalidad(Long municipalidadId) {
        Usuario actor = obtenerActor();
        if (esSuperAdmin(actor)) {
            return;
        }
        if (actor.getMunicipalidad() != null && actor.getMunicipalidad().getId().equals(municipalidadId)) {
            return;
        }
        throw new AccessDeniedException("No autorizado para acceder a esta municipalidad");
    }

    public void validarGestionPunto(PuntoRecoleccion punto) {
        Usuario actor = obtenerActor();
        if (esSuperAdmin(actor)) {
            return;
        }
        if (actor.getMunicipalidad() != null
                && punto.getMunicipalidad() != null
                && actor.getMunicipalidad().getId().equals(punto.getMunicipalidad().getId())) {
            return;
        }
        throw new AccessDeniedException("No autorizado para gestionar este punto de entrega");
    }

    public void validarGestionCampana(Campana campana) {
        Usuario actor = obtenerActor();
        if (esSuperAdmin(actor)) {
            return;
        }
        if (actor.getMunicipalidad() != null
                && campana.getMunicipalidad() != null
                && actor.getMunicipalidad().getId().equals(campana.getMunicipalidad().getId())) {
            return;
        }
        throw new AccessDeniedException("No autorizado para gestionar esta campaña");
    }

    public void validarSuperAdmin() {
        if (!esSuperAdmin(obtenerActor())) {
            throw new AccessDeniedException("No autorizado para administrar municipalidades");
        }
    }

    public Long obtenerMunicipalidadIdDelActor() {
        Usuario actor = obtenerActor();
        return actor.getMunicipalidad() != null ? actor.getMunicipalidad().getId() : null;
    }

    public Long resolverMunicipalidadId(Long municipalidadSolicitada) {
        Long municipalidadActor = obtenerMunicipalidadIdDelActor();
        if (municipalidadActor != null) {
            return municipalidadActor;
        }
        if (municipalidadSolicitada == null) {
            throw new IllegalArgumentException("La municipalidad es obligatoria");
        }
        return municipalidadSolicitada;
    }

    public Long resolverMunicipalidadIdOpcional(Long municipalidadSolicitada) {
        Long municipalidadActor = obtenerMunicipalidadIdDelActor();
        return municipalidadActor != null ? municipalidadActor : municipalidadSolicitada;
    }

    private boolean esSuperAdmin(Usuario actor) {
        return actor.getRolUsuario() == RolUsuario.ADMIN && actor.getMunicipalidad() == null;
    }

    private boolean perteneceAMunicipalidad(Usuario actor, Entrega entrega) {
        return actor.getMunicipalidad() != null
                && entrega.getPuntoRecoleccion() != null
                && entrega.getPuntoRecoleccion().getMunicipalidad() != null
                && actor.getMunicipalidad().getId().equals(entrega.getPuntoRecoleccion().getMunicipalidad().getId());
    }
}
