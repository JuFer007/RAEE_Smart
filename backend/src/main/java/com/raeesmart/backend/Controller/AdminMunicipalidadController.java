package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Request.MunicipalidadRequestDTO;
import com.raeesmart.backend.Dto.Response.MunicipalidadResponseDTO;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.Municipalidad;
import com.raeesmart.backend.Repository.MunicipalidadRepository;
import com.raeesmart.backend.Security.AutorizacionService;
import com.raeesmart.backend.Service.AuditoriaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/municipalidades")
public class AdminMunicipalidadController {
    private final MunicipalidadRepository municipalidadRepository;
    private final AutorizacionService autorizacionService;
    private AuditoriaService auditoriaService;

    public AdminMunicipalidadController(MunicipalidadRepository municipalidadRepository,
                                        AutorizacionService autorizacionService) {
        this.municipalidadRepository = municipalidadRepository;
        this.autorizacionService = autorizacionService;
    }

    @Autowired(required = false)
    public void setAuditoriaService(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public List<MunicipalidadResponseDTO> listar() {
        autorizacionService.validarSuperAdmin();
        return municipalidadRepository.findAll().stream().map(this::mapearAResponse).toList();
    }

    @PostMapping
    public ResponseEntity<MunicipalidadResponseDTO> crear(@Valid @RequestBody MunicipalidadRequestDTO request) {
        autorizacionService.validarSuperAdmin();
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
        Municipalidad guardada = municipalidadRepository.save(municipalidad);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("nombre", guardada.getNombre());
        detalles.put("distrito", guardada.getDistrito());
        detalles.put("activo", guardada.getActivo());
        registrar("MUNICIPALIDAD_CREAR", "MUNICIPALIDAD", String.valueOf(guardada.getId()), detalles);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapearAResponse(guardada));
    }

    @PutMapping("/{id}/activo")
    public MunicipalidadResponseDTO cambiarEstado(@PathVariable Long id, @RequestParam boolean valor) {
        autorizacionService.validarSuperAdmin();
        Municipalidad municipalidad = municipalidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Municipalidad no encontrada"));
        Boolean estadoAnterior = municipalidad.getActivo();
        municipalidad.setActivo(valor);
        Municipalidad guardada = municipalidadRepository.save(municipalidad);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("nombre", guardada.getNombre());
        detalles.put("estadoAnterior", estadoAnterior);
        detalles.put("estadoNuevo", valor);
        registrar("MUNICIPALIDAD_CAMBIAR_ESTADO", "MUNICIPALIDAD", String.valueOf(id), detalles);
        return mapearAResponse(guardada);
    }

    @PutMapping("/{id}")
    public MunicipalidadResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody MunicipalidadRequestDTO request) {
        autorizacionService.validarSuperAdmin();
        Municipalidad municipalidad = municipalidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Municipalidad no encontrada"));
        String nombreAnterior = municipalidad.getNombre();
        String distritoAnterior = municipalidad.getDistrito();
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
        Municipalidad guardada = municipalidadRepository.save(municipalidad);
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("nombreAnterior", nombreAnterior);
        detalles.put("nombreNuevo", guardada.getNombre());
        detalles.put("distritoAnterior", distritoAnterior);
        detalles.put("distritoNuevo", guardada.getDistrito());
        registrar("MUNICIPALIDAD_ACTUALIZAR", "MUNICIPALIDAD", String.valueOf(id), detalles);
        return mapearAResponse(guardada);
    }

    private void registrar(String accion, String entidad, String entidadId, Map<String, Object> detalles) {
        if (auditoriaService != null) {
            auditoriaService.registrar(accion, entidad, entidadId, detalles);
        }
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
