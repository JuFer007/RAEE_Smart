package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Response.ClasificacionResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ClasificacionIAService {
    ClasificacionResponseDTO clasificar(MultipartFile foto);

    boolean verificarDisponibilidad();

    List<String> obtenerCategoriasIa();
}
