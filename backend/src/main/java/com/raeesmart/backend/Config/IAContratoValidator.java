package com.raeesmart.backend.Config;
import com.raeesmart.backend.Model.Enums.TipoRAEE;
import com.raeesmart.backend.Service.ClasificacionIAService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component

public class IAContratoValidator implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(IAContratoValidator.class);

    private final ClasificacionIAService clasificacionIAService;

    public IAContratoValidator(ClasificacionIAService clasificacionIAService) {
        this.clasificacionIAService = clasificacionIAService;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            List<String> categoriasIa = clasificacionIAService.obtenerCategoriasIa();
            if (categoriasIa.isEmpty()) {
                log.warn("[IA] El servicio de IA respondió sin categorías; no se pudo validar el contrato.");
                return;
            }

            Set<String> reconocidas = new HashSet<>(categoriasIa);
            List<String> faltantes = Arrays.stream(TipoRAEE.values())
                    .map(Enum::name)
                    .filter(categoria -> !reconocidas.contains(categoria))
                    .toList();

            if (faltantes.isEmpty()) {
                log.info("[IA] Contrato de categorías OK ({} categorías reconocidas).", categoriasIa.size());
            } else {
                log.warn("[IA] El servicio de IA no reconoce estas categorías del backend: {}", faltantes);
            }
        } catch (Exception e) {
            log.warn("[IA] No se pudo validar el contrato de categorías al arranque: {}", e.getMessage());
        }
    }
}
