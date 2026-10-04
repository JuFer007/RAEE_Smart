package com.raeesmart.backend.Service.Impl;
import com.raeesmart.backend.Service.AlmacenamientoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service

public class AlmacenamientoServiceImpl implements AlmacenamientoService {
    private final String directorioBase;

    public AlmacenamientoServiceImpl(@Value("${raeesmart.almacenamiento.directorio}") String directorioBase) {
        this.directorioBase = directorioBase;
    }

    @Override
    public String guardarFoto(MultipartFile foto) {
        try {
            Files.createDirectories(Path.of(directorioBase));
            String nombreArchivo = UUID.randomUUID() + "-" + foto.getOriginalFilename();
            Path destino = Path.of(directorioBase, nombreArchivo);
            Files.copy(foto.getInputStream(), destino);
            return destino.toString();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar la foto de la entrega", e);
        }
    }
}
