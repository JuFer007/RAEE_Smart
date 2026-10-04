package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Exception.ResourceNotFoundException;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Repository.PuntoRecoleccionRepository;
import com.raeesmart.backend.Service.GeolocalizacionService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service

public class GeolocalizacionServiceImpl implements GeolocalizacionService {
    private static final double RADIO_TIERRA_KM = 6371.0;
    private final PuntoRecoleccionRepository puntoRecoleccionRepository;

    public GeolocalizacionServiceImpl(PuntoRecoleccionRepository puntoRecoleccionRepository) {
        this.puntoRecoleccionRepository = puntoRecoleccionRepository;
    }

    @Override
    public PuntoRecoleccion encontrarPuntoMasCercano(Double latitud, Double longitud) {
        List<PuntoRecoleccion> puntos = puntoRecoleccionRepository.findByMunicipalidadActivoTrue();

        if (puntos.isEmpty()) {
            throw new ResourceNotFoundException("No hay puntos de recolección activos disponibles");
        }

        PuntoRecoleccion masCercano = null;
        double menorDistancia = Double.MAX_VALUE;

        for (PuntoRecoleccion punto : puntos) {
            double distancia = calcularDistanciaKm(latitud, longitud, punto.getLatitud(), punto.getLongitud());
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                masCercano = punto;
            }
        }

        return masCercano;
    }

    @Override
    public double calcularDistanciaKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return RADIO_TIERRA_KM * c;
    }
}
