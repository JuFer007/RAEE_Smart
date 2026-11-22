package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.ResumenSatisfaccionResponseDTO;
import com.raeesmart.backend.Service.SatisfaccionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/satisfaccion")

public class AdminSatisfaccionController {
    private final SatisfaccionService satisfaccionService;

    public AdminSatisfaccionController(SatisfaccionService satisfaccionService) {
        this.satisfaccionService = satisfaccionService;
    }

    @GetMapping
    public ResumenSatisfaccionResponseDTO resumen(@RequestParam(required = false) Long municipalidadId) {
        return satisfaccionService.obtenerResumen(municipalidadId);
    }
}
