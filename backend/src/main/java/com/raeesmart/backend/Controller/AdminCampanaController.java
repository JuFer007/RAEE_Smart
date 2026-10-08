package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.CampanaRequestDTO;
import com.raeesmart.backend.Dto.Response.CampanaResponseDTO;
import com.raeesmart.backend.Service.CampanaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/campanas")

public class AdminCampanaController {
    private final CampanaService campanaService;

    public AdminCampanaController(CampanaService campanaService) {
        this.campanaService = campanaService;
    }

    @GetMapping
    public List<CampanaResponseDTO> listar(@RequestParam Long municipalidadId) {
        return campanaService.listarPorMunicipalidad(municipalidadId);
    }

    @PostMapping
    public ResponseEntity<CampanaResponseDTO> crear(@Valid @RequestBody CampanaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campanaService.crear(request));
    }

    @PutMapping("/{id}")
    public CampanaResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody CampanaRequestDTO request) {
        return campanaService.actualizar(id, request);
    }

    @PutMapping("/{id}/activa")
    public CampanaResponseDTO cambiarEstado(@PathVariable Long id, @RequestParam boolean valor) {
        return campanaService.cambiarEstado(id, valor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        campanaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
