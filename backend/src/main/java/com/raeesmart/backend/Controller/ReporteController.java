package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.EntregaResponseDTO;
import com.raeesmart.backend.Service.EntregaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")

public class ReporteController {
    private final EntregaService entregaService;

    public ReporteController(EntregaService entregaService) {
        this.entregaService = entregaService;
    }

    @GetMapping("/municipalidad/{municipalidadId}")
    public List<EntregaResponseDTO> reportePorMunicipalidad(@PathVariable Long municipalidadId) {
        return entregaService.listarPorMunicipalidad(municipalidadId);
    }
}
