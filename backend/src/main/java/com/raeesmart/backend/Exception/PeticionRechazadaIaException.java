package com.raeesmart.backend.Exception;

public class PeticionRechazadaIaException extends RuntimeException {
    public PeticionRechazadaIaException(String mensaje) {
        super(mensaje);
    }

    public PeticionRechazadaIaException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
