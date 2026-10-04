package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Dto.Response.ClasificacionResponseDTO;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Service.ClasificacionIAService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.IOException;
import java.util.Map;

@Service

public class ClasificacionIAServiceImpl implements ClasificacionIAService {
    private final WebClient webClient;

    public ClasificacionIAServiceImpl(@Value("${raeesmart.ia.base-url}") String iaBaseUrl) {
        this.webClient = WebClient.builder().baseUrl(iaBaseUrl).build();
    }

    @Override
    public ClasificacionResponseDTO clasificar(MultipartFile foto) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        try {
            builder.part("imagen", new ByteArrayResource(foto.getBytes()) {
                @Override
                public String getFilename() {
                    return foto.getOriginalFilename();
                }
            });
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer la foto recibida", e);
        }

        Map<String, Object> respuesta = webClient.post()
                .uri("/clasificar")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (respuesta == null) {
            throw new RuntimeException("El servicio de IA no respondió");
        }

        return ClasificacionResponseDTO.builder()
                .tipoDetectado(TipoRAEE.valueOf((String) respuesta.get("categoria")))
                .confianza(((Number) respuesta.get("confianza")).doubleValue())
                .tiempoInferenciaMs(respuesta.get("tiempo_inferencia_ms") != null
                        ? ((Number) respuesta.get("tiempo_inferencia_ms")).intValue()
                        : null)
                .build();
    }
}
