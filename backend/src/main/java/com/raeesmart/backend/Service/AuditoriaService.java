package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Response.AuditoriaEventoResponseDTO;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public interface AuditoriaService {
    void registrar(String accion, String entidad, String entidadId, Map<String, Object> detalles);

    List<AuditoriaEventoResponseDTO> listar(
            Long actorId,
            String accion,
            String entidad,
            String entidadId,
            Instant desde,
            Instant hasta,
            int pagina,
            int tamanio);
}
