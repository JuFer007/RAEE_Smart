package com.raeesmart.backend.Service.Impl;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.raeesmart.backend.Dto.Response.ClasificacionResponseDTO;
import com.raeesmart.backend.Dto.Response.PrediccionCategoriaDTO;
import com.raeesmart.backend.Exception.PeticionRechazadaIaException;
import com.raeesmart.backend.Exception.RespuestaIaInvalidaException;
import com.raeesmart.backend.Exception.ServicioIaNoDisponibleException;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Service.ClasificacionIAService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.codec.DecodingException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service

public class ClasificacionIAServiceImpl implements ClasificacionIAService {

    private static final Duration TIMEOUT_CLASIFICACION = Duration.ofSeconds(30);
    private static final Duration TIMEOUT_ESTADO = Duration.ofSeconds(5);
    private static final String MENSAJE_NO_DISPONIBLE =
            "El servicio de IA no está disponible. Verifica que esté en ejecución.";

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
                    String nombre = foto.getOriginalFilename();
                    return (nombre != null && !nombre.isBlank()) ? nombre : "raee.jpg";
                }
            }).contentType(mediaTypeDe(foto));
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo leer la foto recibida", e);
        }

        Map<String, Object> respuesta = ejecutarClasificacion(builder);
        if (respuesta == null) {
            throw new RespuestaIaInvalidaException("El servicio de IA no devolvió una respuesta.");
        }
        return mapearRespuesta(respuesta);
    }

    @Override
    public boolean verificarDisponibilidad() {
        try {
            webClient.get()
                    .uri("/salud")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(TIMEOUT_ESTADO);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<String> obtenerCategoriasIa() {
        try {
            Map<?, ?> respuesta = webClient.get()
                    .uri("/categorias")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(TIMEOUT_ESTADO);

            Object categorias = (respuesta != null) ? respuesta.get("categorias") : null;
            List<String> resultado = new ArrayList<>();
            if (categorias instanceof List<?> lista) {
                for (Object categoria : lista) {
                    if (categoria != null) {
                        resultado.add(categoria.toString());
                    }
                }
            }
            return resultado;
        } catch (Exception e) {
            throw new ServicioIaNoDisponibleException(
                    "No se pudieron obtener las categorías del servicio de IA.", e);
        }
    }

    private Map<String, Object> ejecutarClasificacion(MultipartBodyBuilder builder) {
        try {
            return webClient.post()
                    .uri("/clasificar")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(TIMEOUT_CLASIFICACION);
        } catch (WebClientResponseException e) {
            if (e.getStatusCode().is4xxClientError()) {
                throw new PeticionRechazadaIaException(extraerDetalle(e), e);
            }
            throw new ServicioIaNoDisponibleException(
                    "El servicio de IA respondió con un error (" + e.getStatusCode().value() + ").", e);
        } catch (WebClientRequestException e) {
            throw new ServicioIaNoDisponibleException(MENSAJE_NO_DISPONIBLE, e);
        } catch (DecodingException e) {
            throw new RespuestaIaInvalidaException(
                    "El servicio de IA devolvió una respuesta con formato inválido.", e);
        } catch (IllegalStateException e) {
            throw new ServicioIaNoDisponibleException(
                    "El servicio de IA tardó demasiado en responder.", e);
        } catch (Exception e) {
            throw new ServicioIaNoDisponibleException(MENSAJE_NO_DISPONIBLE, e);
        }
    }

    private ClasificacionResponseDTO mapearRespuesta(Map<String, Object> respuesta) {
        Object categoria = respuesta.get("categoria");
        if (!(categoria instanceof String) || ((String) categoria).isBlank()) {
            throw new RespuestaIaInvalidaException("El servicio de IA no devolvió una categoría válida.");
        }

        TipoRAEE tipoDetectado;
        try {
            tipoDetectado = TipoRAEE.valueOf((String) categoria);
        } catch (IllegalArgumentException e) {
            throw new RespuestaIaInvalidaException(
                    "El servicio de IA devolvió una categoría desconocida: " + categoria, e);
        }

        Object confianza = respuesta.get("confianza");
        if (!(confianza instanceof Number)) {
            throw new RespuestaIaInvalidaException("El servicio de IA no devolvió un valor de confianza válido.");
        }

        return ClasificacionResponseDTO.builder()
                .tipoDetectado(tipoDetectado)
                .confianza(((Number) confianza).doubleValue())
                .tiempoInferenciaMs(aEntero(respuesta.get("tiempo_inferencia_ms")))
                .alternativas(mapearAlternativas(respuesta.get("top3")))
                .build();
    }

    private List<PrediccionCategoriaDTO> mapearAlternativas(Object top3) {
        List<PrediccionCategoriaDTO> alternativas = new ArrayList<>();
        if (!(top3 instanceof List<?> lista)) {
            return alternativas;
        }

        for (Object item : lista) {
            if (!(item instanceof Map<?, ?> prediccion)) {
                continue;
            }
            Object categoria = prediccion.get("categoria");
            Object confianza = prediccion.get("confianza");
            if (categoria == null || !(confianza instanceof Number)) {
                continue;
            }
            try {
                alternativas.add(PrediccionCategoriaDTO.builder()
                        .categoria(TipoRAEE.valueOf(categoria.toString()))
                        .confianza(((Number) confianza).doubleValue())
                        .build());
            } catch (IllegalArgumentException ignored) {
                // Se omite cualquier categoría que el backend no reconozca.
            }
        }
        return alternativas;
    }

    private Integer aEntero(Object valor) {
        return (valor instanceof Number) ? ((Number) valor).intValue() : null;
    }

    private MediaType mediaTypeDe(MultipartFile foto) {
        String tipo = foto.getContentType();
        if (tipo != null) {
            try {
                MediaType mediaType = MediaType.parseMediaType(tipo);
                if ("image".equalsIgnoreCase(mediaType.getType())) {
                    return mediaType;
                }
            } catch (Exception ignored) {
                // Si el tipo declarado no es válido, se usa el valor por defecto.
            }
        }
        return MediaType.IMAGE_JPEG;
    }

    private String extraerDetalle(WebClientResponseException e) {
        try {
            JsonNode cuerpo = objectMapper.readTree(e.getResponseBodyAsString());
            JsonNode detalle = cuerpo.get("detail");
            if (detalle != null && !detalle.isNull()) {
                return detalle.isTextual() ? detalle.asText() : detalle.toString();
            }
        } catch (Exception ignored) {
            // Si el cuerpo de error no es JSON, se usa el mensaje genérico.
        }
        return "La imagen fue rechazada por el servicio de IA.";
    }
}
