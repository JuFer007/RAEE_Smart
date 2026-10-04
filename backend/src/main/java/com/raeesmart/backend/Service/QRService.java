package com.raeesmart.backend.Service;

public interface QRService {
    byte[] generarQR(String contenido);
    String generarCodigoHash();
}
