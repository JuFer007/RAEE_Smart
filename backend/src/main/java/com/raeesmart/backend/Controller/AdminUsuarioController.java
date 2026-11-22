package com.raeesmart.backend.Controller;

import com.raeesmart.backend.Dto.Request.AdminUsuarioPasswordRequestDTO;
import com.raeesmart.backend.Dto.Request.AdminUsuarioRequestDTO;
import com.raeesmart.backend.Dto.Response.AdminUsuarioResponseDTO;
import com.raeesmart.backend.Service.AdminUsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")

public class AdminUsuarioController {
    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    @GetMapping
    public List<AdminUsuarioResponseDTO> listar(
            @RequestParam(required = false) Long municipalidadId,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String q) {
        return adminUsuarioService.listar(municipalidadId, rol, activo, q);
    }

    @PostMapping
    public ResponseEntity<AdminUsuarioResponseDTO> crear(@Valid @RequestBody AdminUsuarioRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUsuarioService.crear(request));
    }

    @PutMapping("/{id}")
    public AdminUsuarioResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody AdminUsuarioRequestDTO request) {
        return adminUsuarioService.actualizar(id, request);
    }

    @PutMapping("/{id}/estado")
    public AdminUsuarioResponseDTO cambiarEstado(@PathVariable Long id, @RequestParam boolean valor) {
        return adminUsuarioService.cambiarEstado(id, valor);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> cambiarPassword(@PathVariable Long id,
                                                @Valid @RequestBody AdminUsuarioPasswordRequestDTO request) {
        adminUsuarioService.cambiarPassword(id, request);
        return ResponseEntity.noContent().build();
    }
}
