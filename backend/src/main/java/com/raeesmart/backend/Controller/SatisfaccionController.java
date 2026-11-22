package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.ValoracionAppRequestDTO;
import com.raeesmart.backend.Dto.Response.ValoracionAppResponseDTO;
import com.raeesmart.backend.Service.SatisfaccionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/satisfaccion")

public class SatisfaccionController {
    private final SatisfaccionService satisfaccionService;

    public SatisfaccionController(SatisfaccionService satisfaccionService) {
        this.satisfaccionService = satisfaccionService;
    }

    @PostMapping
    public ResponseEntity<ValoracionAppResponseDTO> registrar(@Valid @RequestBody ValoracionAppRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(satisfaccionService.registrar(request));
    }

    @GetMapping("/mia")
    public ValoracionAppResponseDTO obtenerMia() {
        return satisfaccionService.obtenerMia();
    }

    @PutMapping("/mia")
    public ValoracionAppResponseDTO actualizarMia(@Valid @RequestBody ValoracionAppRequestDTO request) {
        return satisfaccionService.actualizarMia(request);
    }
}
