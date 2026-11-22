package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Request.EntregaRequestDTO;
import com.raeesmart.backend.Dto.Response.EntregaResponseDTO;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import java.util.List;

public interface EntregaService {
    EntregaResponseDTO registrarEntrega(EntregaRequestDTO request);
    EntregaResponseDTO confirmarEntrega(Long entregaId);
    EntregaResponseDTO rechazarEntrega(Long entregaId, String motivo);
    EntregaResponseDTO corregirClasificacion(Long entregaId, TipoRAEE tipoCorregido);
    EntregaResponseDTO buscarPorId(Long id);
    List<EntregaResponseDTO> listarPorUsuario(Long usuarioId);
    List<EntregaResponseDTO> listarPorMunicipalidad(Long municipalidadId);
}
