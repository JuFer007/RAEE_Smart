package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.CorreccionRequestDTO;
import com.raeesmart.backend.Dto.Request.EntregaRequestDTO;
import com.raeesmart.backend.Dto.Response.EntregaResponseDTO;
import com.raeesmart.backend.Service.EntregaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/entregas")

public class EntregaController {
    private final EntregaService entregaService;

    public EntregaController(EntregaService entregaService) {
        this.entregaService = entregaService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<EntregaResponseDTO> registrarEntrega(
            @RequestParam Long usuarioId,
            @RequestParam Double latitud,
            @RequestParam Double longitud,
            @RequestParam MultipartFile foto) {

        EntregaRequestDTO request = EntregaRequestDTO.builder()
                .usuarioId(usuarioId)
                .latitud(latitud)
                .longitud(longitud)
                .foto(foto)
                .build();

        EntregaResponseDTO entrega = entregaService.registrarEntrega(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(entrega);
    }

    @PutMapping("/{id}/corregir")
    public ResponseEntity<EntregaResponseDTO> corregirClasificacion(
            @PathVariable Long id, @Valid @RequestBody CorreccionRequestDTO request) {
        EntregaResponseDTO entrega = entregaService.corregirClasificacion(id, request.getTipoCorregido());
        return ResponseEntity.ok(entrega);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntregaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(entregaService.buscarPorId(id));
    }
}
