package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.CampanaResponseDTO;
import com.raeesmart.backend.Dto.Response.PuntoRecoleccionResponseDTO;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Repository.PuntoRecoleccionRepository;
import com.raeesmart.backend.Service.CampanaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/municipalidades")
public class MunicipalidadController {
    private final PuntoRecoleccionRepository puntoRecoleccionRepository;
    private final CampanaService campanaService;

    public MunicipalidadController(PuntoRecoleccionRepository puntoRecoleccionRepository,
                                   CampanaService campanaService) {
        this.puntoRecoleccionRepository = puntoRecoleccionRepository;
        this.campanaService = campanaService;
    }

    @GetMapping("/{id}/puntos")
    public List<PuntoRecoleccionResponseDTO> listarPuntos(@PathVariable Long id) {
        return puntoRecoleccionRepository.findByMunicipalidadId(id).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    @GetMapping("/{id}/campanas")
    public List<CampanaResponseDTO> listarCampanas(@PathVariable Long id) {
        return campanaService.listarVigentesPublic(id);
    }

    @GetMapping("/campanas/{campanaId}")
    public CampanaResponseDTO obtenerCampana(@PathVariable Long campanaId) {
        return campanaService.obtenerPublic(campanaId);
    }

    private PuntoRecoleccionResponseDTO mapearAResponse(PuntoRecoleccion punto) {
        return PuntoRecoleccionResponseDTO.builder()
                .id(punto.getId())
                .nombre(punto.getNombre())
                .latitud(punto.getLatitud())
                .longitud(punto.getLongitud())
                .horarioAtencion(punto.getHorarioAtencion())
                .build();
    }
}
