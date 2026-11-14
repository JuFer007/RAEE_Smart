package com.raeesmart.backend.Dto.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class PreferenciaNotificacionRequestDTO {
    private Boolean push;
    private Boolean campanas;
    private Boolean entregas;
    private Boolean recordatorios;
}
