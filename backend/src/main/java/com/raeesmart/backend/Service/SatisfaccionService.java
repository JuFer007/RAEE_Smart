package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Request.ValoracionAppRequestDTO;
import com.raeesmart.backend.Dto.Response.ResumenSatisfaccionResponseDTO;
import com.raeesmart.backend.Dto.Response.ValoracionAppResponseDTO;

public interface SatisfaccionService {
    ValoracionAppResponseDTO registrar(ValoracionAppRequestDTO request);

    ValoracionAppResponseDTO obtenerMia();

    ValoracionAppResponseDTO actualizarMia(ValoracionAppRequestDTO request);

    ResumenSatisfaccionResponseDTO obtenerResumen(Long municipalidadId);
}
