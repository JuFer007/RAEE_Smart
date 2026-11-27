package com.raeesmart.backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("estado", "ok");
        respuesta.put("servicio", "raee-smart-backend");
        respuesta.put("hora", Instant.now().toString());
        return ResponseEntity.ok(respuesta);
    }
}
