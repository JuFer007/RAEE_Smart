package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Request.PuntoRecoleccionRequestDTO;
import com.raeesmart.backend.Dto.Response.PuntoRecoleccionResponseDTO;
import java.util.List;

public interface PuntoRecoleccionService {
    PuntoRecoleccionResponseDTO crear(PuntoRecoleccionRequestDTO request);
    PuntoRecoleccionResponseDTO actualizar(Long id, PuntoRecoleccionRequestDTO request);
    void eliminar(Long id);
    List<PuntoRecoleccionResponseDTO> listarPorMunicipalidad(Long municipalidadId);
    List<PuntoRecoleccionResponseDTO> listarTodos();
}
