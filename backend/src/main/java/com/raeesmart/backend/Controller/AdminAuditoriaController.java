package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.AuditoriaEventoResponseDTO;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.AuditoriaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/auditoria")

public class AdminAuditoriaController {
    private final AuditoriaService auditoriaService;
    private final AutorizacionService autorizacionService;

    public AdminAuditoriaController(AuditoriaService auditoriaService, AutorizacionService autorizacionService) {
        this.auditoriaService = auditoriaService;
        this.autorizacionService = autorizacionService;
    }

    @GetMapping
    public List<AuditoriaEventoResponseDTO> listar(
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) String accion,
            @RequestParam(required = false) String entidad,
            @RequestParam(required = false) String entidadId,
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamanio) {
        autorizacionService.validarSuperAdmin();
        return auditoriaService.listar(
                actorId,
                accion,
                entidad,
                entidadId,
                parsearFecha(desde, "desde"),
                parsearFecha(hasta, "hasta"),
                pagina,
                tamanio);
    }

    private Instant parsearFecha(String valor, String nombre) {
        if (valor == null || valor.isBlank()) return null;
        try {
            return Instant.parse(valor);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("El parámetro " + nombre + " debe tener formato ISO 8601");
        }
    }
}
