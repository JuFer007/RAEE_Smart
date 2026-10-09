package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.NotificacionResponseDTO;
import com.raeesmart.backend.Service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {
    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping("/me")
    public List<NotificacionResponseDTO> listarMisNotificaciones() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificacionService.listarDeUsuario(email);
    }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<Void> marcarLeida(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        notificacionService.marcarLeida(id, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasLeidas() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        notificacionService.marcarTodasLeidas(email);
        return ResponseEntity.noContent().build();
    }
}
