package com.raeesmart.backend.Exception;
import com.raeesmart.backend.Dto.Response.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice

public class GlobalExceptionHandler {
    //404 — recurso no encontrado
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    //400 — reglas de negocio simples
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    //400 — fallos de @Valid en los DTO
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> detalles = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        return construirRespuesta(HttpStatus.BAD_REQUEST, "Datos inválidos", request, detalles);
    }

    //401 — credenciales incorrectas en el login
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos", request, null);
    }

    //403 — el usuario autenticado no tiene permisos sobre el recurso
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.FORBIDDEN,
                "No tienes permisos para realizar esta acción", request, null);
    }

    //409 — la operación no es válida para el estado actual del recurso
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalState(
            IllegalStateException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.CONFLICT, ex.getMessage(), request, null);
    }

    //502 — el microservicio de IA no está disponible
    @ExceptionHandler(ServicioIaNoDisponibleException.class)
    public ResponseEntity<ErrorResponseDTO> handleServicioIaNoDisponible(
            ServicioIaNoDisponibleException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.BAD_GATEWAY, ex.getMessage(), request, null);
    }

    //502 — el microservicio de IA respondió con un formato inesperado
    @ExceptionHandler(RespuestaIaInvalidaException.class)
    public ResponseEntity<ErrorResponseDTO> handleRespuestaIaInvalida(
            RespuestaIaInvalidaException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.BAD_GATEWAY, ex.getMessage(), request, null);
    }

    //400 — el microservicio de IA rechazó la imagen enviada
    @ExceptionHandler(PeticionRechazadaIaException.class)
    public ResponseEntity<ErrorResponseDTO> handlePeticionRechazadaIa(
            PeticionRechazadaIaException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    //400 — falta el archivo o un parámetro requerido en la solicitud
    @ExceptionHandler({MissingServletRequestPartException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<ErrorResponseDTO> handleMissingRequestPart(
            Exception ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.BAD_REQUEST,
                "Falta el archivo o un parámetro requerido en la solicitud", request, null);
    }

    //413 — la foto enviada supera el tamaño máximo configurado
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDTO> handleMaxUploadSize(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.PAYLOAD_TOO_LARGE,
                "La foto supera el tamaño máximo permitido", request, null);
    }

    //500 — cualquier otro error no contemplado
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(
            Exception ex, HttpServletRequest request) {
        return construirRespuesta(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error inesperado. Intenta nuevamente.", request, null);
    }

    private ResponseEntity<ErrorResponseDTO> construirRespuesta(
            HttpStatus status, String mensaje, HttpServletRequest request, List<String> detalles) {
        ErrorResponseDTO error = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .mensaje(mensaje)
                .ruta(request.getRequestURI())
                .detalles(detalles)
                .build();
        return ResponseEntity.status(status).body(error);
    }
}
