package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Request.CampanaRequestDTO;
import com.raeesmart.backend.Dto.Response.CampanaResponseDTO;
import java.util.List;

public interface CampanaService {
    CampanaResponseDTO crear(CampanaRequestDTO request);
    CampanaResponseDTO actualizar(Long id, CampanaRequestDTO request);
    CampanaResponseDTO cambiarEstado(Long id, boolean activa);
    void eliminar(Long id);

    List<CampanaResponseDTO> listarPorMunicipalidad(Long municipalidadId);
    List<CampanaResponseDTO> listarVigentes(Long municipalidadId);
    List<CampanaResponseDTO> listarVigentesPublic(Long municipalidadId);
    CampanaResponseDTO obtenerPublic(Long id);
}
