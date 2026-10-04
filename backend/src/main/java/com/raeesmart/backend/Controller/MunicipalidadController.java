package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.PuntoRecoleccionResponseDTO;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Repository.PuntoRecoleccionRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

public class MunicipalidadController {
    private final PuntoRecoleccionRepository puntoRecoleccionRepository;

    public MunicipalidadController(PuntoRecoleccionRepository puntoRecoleccionRepository) {
        this.puntoRecoleccionRepository = puntoRecoleccionRepository;
    }

    @GetMapping("/{id}/puntos")
    public List<PuntoRecoleccionResponseDTO> listarPuntos(@PathVariable Long id) {
        return puntoRecoleccionRepository.findByMunicipalidadId(id).stream()
                .map(this::mapearAResponse)
                .toList();
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
