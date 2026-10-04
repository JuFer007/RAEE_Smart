package com.raeesmart.backend.Service;
import com.raeesmart.backend.Dto.Response.ClasificacionResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface ClasificacionIAService {
    ClasificacionResponseDTO clasificar(MultipartFile foto);
}
