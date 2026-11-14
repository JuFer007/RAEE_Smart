package com.raeesmart.backend.Exception;

import com.raeesmart.backend.Dto.Response.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private final HttpServletRequest request = mock(HttpServletRequest.class);

    @Test
    void accessDeniedDevuelve403() {
        when(request.getRequestURI()).thenReturn("/api/entregas/1");

        ResponseEntity<ErrorResponseDTO> response =
                handler.handleAccessDenied(new AccessDeniedException("denegado"), request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("No tienes permisos para realizar esta acción", response.getBody().getMensaje());
        assertEquals(403, response.getBody().getStatus());
    }

    @Test
    void illegalStateDevuelve409() {
        when(request.getRequestURI()).thenReturn("/api/entregas/1/confirmar");

        ResponseEntity<ErrorResponseDTO> response =
                handler.handleIllegalState(new IllegalStateException("Estado inválido"), request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Estado inválido", response.getBody().getMensaje());
        assertEquals(409, response.getBody().getStatus());
    }
}
