package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.ClasificacionResponseDTO;
import com.raeesmart.backend.Service.ClasificacionIAService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/clasificaciones")

public class ClasificacionController {
    private final ClasificacionIAService clasificacionIAService;

    public ClasificacionController(ClasificacionIAService clasificacionIAService) {
        this.clasificacionIAService = clasificacionIAService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClasificacionResponseDTO> clasificar(@RequestParam("foto") MultipartFile foto) {
        return ResponseEntity.ok(clasificacionIAService.clasificar(foto));
    }

    @GetMapping("/estado")
    public ResponseEntity<Map<String, Object>> estado() {
        boolean disponible = clasificacionIAService.verificarDisponibilidad();
        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("disponible", disponible);
        if (disponible) {
            respuesta.put("categorias", clasificacionIAService.obtenerCategoriasIa());
        }
        return ResponseEntity.ok(respuesta);
    }
}
