package com.raeesmart.backend.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class PreferenciaNotificacionResponseDTO {
    private Boolean push;
    private Boolean campanas;
    private Boolean entregas;
    private Boolean recordatorios;
}
