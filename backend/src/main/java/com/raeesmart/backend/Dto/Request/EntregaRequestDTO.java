package com.raeesmart.backend.Dto.Request;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class EntregaRequestDTO {
    private Long puntoRecoleccionId;
    private MultipartFile foto;
    private Double latitud;
    private Double longitud;
}
