package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.MunicipalidadRequestDTO;
import com.raeesmart.backend.Dto.Response.MunicipalidadResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Municipalidad;
import com.raeesmart.backend.Repository.MunicipalidadRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/municipalidades")
public class AdminMunicipalidadController {
    private final MunicipalidadRepository municipalidadRepository;

    public AdminMunicipalidadController(MunicipalidadRepository municipalidadRepository) {
        this.municipalidadRepository = municipalidadRepository;
    }

    @GetMapping
    public List<MunicipalidadResponseDTO> listar() {
        return municipalidadRepository.findAll().stream().map(this::mapearAResponse).toList();
    }

    @PostMapping
    public ResponseEntity<MunicipalidadResponseDTO> crear(@Valid @RequestBody MunicipalidadRequestDTO request) {
        Municipalidad municipalidad = Municipalidad.builder()
                .nombre(request.getNombre().trim())
                .distrito(request.getDistrito().trim())
                .direccion(request.getDireccion())
                .latitud(request.getLatitud())
                .longitud(request.getLongitud())
                .contactoEmail(request.getContactoEmail())
                .activo(request.getActivo() != null && request.getActivo())
                .campanasHabilitadas(request.getCampanasHabilitadas() != null && request.getCampanasHabilitadas())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(mapearAResponse(municipalidadRepository.save(municipalidad)));
    }

    @PutMapping("/{id}/activo")
    public MunicipalidadResponseDTO cambiarEstado(@PathVariable Long id, @RequestParam boolean valor) {
        Municipalidad municipalidad = municipalidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Municipalidad no encontrada"));
        municipalidad.setActivo(valor);
        return mapearAResponse(municipalidadRepository.save(municipalidad));
    }

    @PutMapping("/{id}")
    public MunicipalidadResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody MunicipalidadRequestDTO request) {
        Municipalidad municipalidad = municipalidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Municipalidad no encontrada"));
        municipalidad.setNombre(request.getNombre().trim());
        municipalidad.setDistrito(request.getDistrito().trim());
        municipalidad.setDireccion(request.getDireccion());
        municipalidad.setLatitud(request.getLatitud());
        municipalidad.setLongitud(request.getLongitud());
        municipalidad.setContactoEmail(request.getContactoEmail());
        if (request.getActivo() != null) {
            municipalidad.setActivo(request.getActivo());
        }
        if (request.getCampanasHabilitadas() != null) {
            municipalidad.setCampanasHabilitadas(request.getCampanasHabilitadas());
        }
        return mapearAResponse(municipalidadRepository.save(municipalidad));
    }

    private MunicipalidadResponseDTO mapearAResponse(Municipalidad m) {
        return MunicipalidadResponseDTO.builder()
                .id(m.getId())
                .nombre(m.getNombre())
                .distrito(m.getDistrito())
                .direccion(m.getDireccion())
                .latitud(m.getLatitud())
                .longitud(m.getLongitud())
                .contactoEmail(m.getContactoEmail())
                .activo(m.getActivo())
                .campanasHabilitadas(m.getCampanasHabilitadas())
                .build();
    }
}
