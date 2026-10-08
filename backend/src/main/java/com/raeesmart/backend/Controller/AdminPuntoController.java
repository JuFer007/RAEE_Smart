package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.PuntoRecoleccionRequestDTO;
import com.raeesmart.backend.Dto.Response.PuntoRecoleccionResponseDTO;
import com.raeesmart.backend.Service.PuntoRecoleccionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/puntos")

public class AdminPuntoController {
    private final PuntoRecoleccionService puntoService;

    public AdminPuntoController(PuntoRecoleccionService puntoService) {
        this.puntoService = puntoService;
    }

    @GetMapping
    public List<PuntoRecoleccionResponseDTO> listar(@RequestParam(required = false) Long municipalidadId) {
        return municipalidadId != null
                ? puntoService.listarPorMunicipalidad(municipalidadId)
                : puntoService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<PuntoRecoleccionResponseDTO> crear(@Valid @RequestBody PuntoRecoleccionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(puntoService.crear(request));
    }

    @PutMapping("/{id}")
    public PuntoRecoleccionResponseDTO actualizar(@PathVariable Long id,
                                                  @Valid @RequestBody PuntoRecoleccionRequestDTO request) {
        return puntoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        puntoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
