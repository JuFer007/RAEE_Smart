package com.raeesmart.backend.Service;
import com.raeesmart.backend.Model.PuntoRecoleccion;

public interface GeolocalizacionService {
    PuntoRecoleccion encontrarPuntoMasCercano(Double latitud, Double longitud);
    double calcularDistanciaKm(double lat1, double lon1, double lat2, double lon2);
}
