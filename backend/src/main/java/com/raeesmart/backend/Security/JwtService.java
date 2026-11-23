package com.raeesmart.backend.Security;
import com.raeesmart.backend.Model.Enums.CanalAcceso;
import com.raeesmart.backend.Model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service

public class JwtService {
    private final SecretKey clave;
    private final long expiracionMs;

    public JwtService(
            @Value("${raeesmart.jwt.secret}") String secret,
            @Value("${raeesmart.jwt.expiration-ms}") long expiracionMs) {
        // El secret debe tener al menos 32 caracteres (256 bits) para HS256
        this.clave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiracionMs = expiracionMs;
    }

    public String generarToken(Usuario usuario) {
        return generarToken(usuario, CanalAcceso.WEB);
    }

    public String generarToken(Usuario usuario, CanalAcceso canal) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expiracionMs);
        long version = usuario.getPasswordVersion() == null ? 0L : usuario.getPasswordVersion();

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("usuarioId", usuario.getId())
                .claim("rol", usuario.getRolUsuario().name())
                .claim("canal", canal.name())
                .claim("passwordVersion", String.valueOf(version))
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(clave)
                .compact();
    }

    public Claims validarYObtenerClaims(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String obtenerEmail(String token) {
        return validarYObtenerClaims(token).getSubject();
    }

    public String obtenerRol(String token) {
        return validarYObtenerClaims(token).get("rol", String.class);
    }

    public long obtenerPasswordVersion(String token) {
        Object valor = validarYObtenerClaims(token).get("passwordVersion");
        if (valor == null) {
            return 0L;
        }
        try {
            return Long.parseLong(valor.toString());
        } catch (NumberFormatException ex) {
            return 0L;
        }
    }

    public CanalAcceso obtenerCanal(String token) {
        String canal = validarYObtenerClaims(token).get("canal", String.class);
        if (canal == null) {
            return CanalAcceso.WEB;
        }
        try {
            return CanalAcceso.valueOf(canal);
        } catch (IllegalArgumentException ex) {
            return CanalAcceso.WEB;
        }
    }

    public boolean esValido(String token) {
        try {
            validarYObtenerClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
