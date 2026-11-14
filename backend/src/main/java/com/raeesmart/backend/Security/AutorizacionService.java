package com.raeesmart.backend.Security;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Model.Enums.RolUsuario;
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
        if (actor.getRolUsuario() == RolUsuario.ADMIN || actor.getId().equals(usuarioId)) {
            return;
        }
        throw new AccessDeniedException("No autorizado para acceder a este usuario");
    }

    public void validarAccesoEntrega(Entrega entrega) {
        Usuario actor = obtenerActor();
        if (actor.getRolUsuario() == RolUsuario.ADMIN) {
            return;
        }
        if (actor.getRolUsuario() == RolUsuario.CIUDADANO
                && entrega.getUsuario() != null
                && actor.getId().equals(entrega.getUsuario().getId())) {
            return;
        }
        if (actor.getRolUsuario() == RolUsuario.MUNICIPALIDAD && perteneceAMunicipalidad(actor, entrega)) {
            return;
        }
        throw new AccessDeniedException("No autorizado para acceder a esta entrega");
    }

    public void validarGestionEntrega(Entrega entrega) {
        Usuario actor = obtenerActor();
        if (actor.getRolUsuario() == RolUsuario.ADMIN) {
            return;
        }
        if (actor.getRolUsuario() == RolUsuario.MUNICIPALIDAD && perteneceAMunicipalidad(actor, entrega)) {
            return;
        }
        throw new AccessDeniedException("No autorizado para gestionar esta entrega");
    }

    public void validarAccesoMunicipalidad(Long municipalidadId) {
        Usuario actor = obtenerActor();
        if (actor.getRolUsuario() == RolUsuario.ADMIN) {
            return;
        }
        if (actor.getRolUsuario() == RolUsuario.MUNICIPALIDAD
                && actor.getMunicipalidad() != null
                && actor.getMunicipalidad().getId().equals(municipalidadId)) {
            return;
        }
        throw new AccessDeniedException("No autorizado para acceder a esta municipalidad");
    }

    private boolean perteneceAMunicipalidad(Usuario actor, Entrega entrega) {
        return actor.getMunicipalidad() != null
                && entrega.getPuntoRecoleccion() != null
                && entrega.getPuntoRecoleccion().getMunicipalidad() != null
                && actor.getMunicipalidad().getId().equals(entrega.getPuntoRecoleccion().getMunicipalidad().getId());
    }
}
