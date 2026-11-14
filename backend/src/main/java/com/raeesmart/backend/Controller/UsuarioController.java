package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.CambiarPasswordRequestDTO;
import com.raeesmart.backend.Dto.Request.PreferenciaNotificacionRequestDTO;
import com.raeesmart.backend.Dto.Response.EntregaResponseDTO;
import com.raeesmart.backend.Dto.Response.PreferenciaNotificacionResponseDTO;
import com.raeesmart.backend.Dto.Response.UsuarioResponseDTO;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.EntregaService;
import com.raeesmart.backend.Service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")

public class UsuarioController {
    private final UsuarioService usuarioService;
    private final EntregaService entregaService;
    private final AutorizacionService autorizacionService;

    public UsuarioController(UsuarioService usuarioService,
                             EntregaService entregaService,
                             AutorizacionService autorizacionService) {
        this.usuarioService = usuarioService;
        this.entregaService = entregaService;
        this.autorizacionService = autorizacionService;
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO obtenerPorId(@PathVariable Long id) {
        autorizacionService.validarAccesoUsuario(id);
        Usuario usuario = usuarioService.buscarPorId(id);
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .telefono(usuario.getTelefono())
                .rol(usuario.getRolUsuario())
                .build();
    }

    @GetMapping("/{id}/entregas")
    public List<EntregaResponseDTO> listarEntregas(@PathVariable Long id) {
        return entregaService.listarPorUsuario(id);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> cambiarPassword(@Valid @RequestBody CambiarPasswordRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        usuarioService.cambiarPassword(email, request.getPasswordActual(), request.getPasswordNueva());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/preferencias-notificaciones")
    public PreferenciaNotificacionResponseDTO obtenerPreferenciasNotificacion() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioService.obtenerPreferenciasNotificacion(email);
    }

    @PutMapping("/me/preferencias-notificaciones")
    public PreferenciaNotificacionResponseDTO actualizarPreferenciasNotificacion(
            @RequestBody PreferenciaNotificacionRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioService.actualizarPreferenciasNotificacion(email, request);
    }
}
