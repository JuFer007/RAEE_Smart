package com.raeesmart.backend.Dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ResumenSatisfaccionResponseDTO {
    private long total;
    private Double promedio;
    private List<SatisfaccionDistribucionDTO> distribucion;
    private List<ValoracionAppResponseDTO> recientes;
}
