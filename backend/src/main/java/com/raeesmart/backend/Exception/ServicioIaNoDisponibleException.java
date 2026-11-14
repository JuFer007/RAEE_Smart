package com.raeesmart.backend.Exception;

public class ServicioIaNoDisponibleException extends RuntimeException {
    public ServicioIaNoDisponibleException(String mensaje) {
        super(mensaje);
    }

    public ServicioIaNoDisponibleException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
