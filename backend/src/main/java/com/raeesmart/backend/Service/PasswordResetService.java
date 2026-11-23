package com.raeesmart.backend.Service;

import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Model.PasswordResetCodigo;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Repository.PasswordResetCodigoRepository;
import com.raeesmart.backend.Repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class PasswordResetService {
    private static final String MENSAJE_GENERICO = "Código inválido o expirado";
    private static final String ALGORITMO_HMAC = "HmacSHA256";

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetCodigoRepository codigoRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String secreto;
    private final long minutosExpiracion;
    private final int maxIntentos;
    private final long segundosEspera;
    private final SecureRandom aleatorio = new SecureRandom();

    public PasswordResetService(
            UsuarioRepository usuarioRepository,
            PasswordResetCodigoRepository codigoRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${raeesmart.password-reset.secret}") String secreto,
            @Value("${raeesmart.password-reset.expiration-minutes}") long minutosExpiracion,
            @Value("${raeesmart.password-reset.max-attempts}") int maxIntentos,
            @Value("${raeesmart.password-reset.cooldown-seconds}") long segundosEspera) {
        this.usuarioRepository = usuarioRepository;
        this.codigoRepository = codigoRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.secreto = secreto;
        this.minutosExpiracion = minutosExpiracion;
        this.maxIntentos = maxIntentos;
        this.segundosEspera = segundosEspera;
    }

    @Transactional
    public void solicitarCodigo(String email) {
        String correo = normalizar(email);
        Optional<Usuario> usuario = buscarCiudadano(correo);
        if (usuario.isEmpty()) {
            return;
        }
        crearCodigo(usuario.get());
    }

    @Transactional
    public void reenviarCodigo(String email) {
        String correo = normalizar(email);
        Optional<Usuario> usuario = buscarCiudadano(correo);
        if (usuario.isEmpty()) {
            return;
        }
        Optional<PasswordResetCodigo> activo = codigoRepository
                .findTopByEmailAndUsadoEnIsNullOrderByCreadoEnDesc(correo);
        if (activo.isPresent() && activo.get().getCreadoEn().isAfter(LocalDateTime.now().minusSeconds(segundosEspera))) {
            return;
        }
        crearCodigo(usuario.get());
    }

    @Transactional
    public void verificarCodigo(String email, String codigo) {
        String correo = normalizar(email);
        PasswordResetCodigo registro = obtenerRegistroValido(correo);
        validarHash(registro, correo, codigo);
        registro.setVerificadoEn(LocalDateTime.now());
        codigoRepository.save(registro);
    }

    @Transactional
    public void restablecerPassword(String email, String codigo, String passwordNueva) {
        String correo = normalizar(email);
        PasswordResetCodigo registro = obtenerRegistroValido(correo);
        if (registro.getVerificadoEn() == null) {
            throw new IllegalStateException(MENSAJE_GENERICO);
        }
        validarHash(registro, correo, codigo);

        Usuario usuario = usuarioRepository.findByEmail(correo)
                .orElseThrow(() -> new IllegalStateException(MENSAJE_GENERICO));
        usuario.setPassword(passwordEncoder.encode(passwordNueva));
        long version = usuario.getPasswordVersion() == null ? 0L : usuario.getPasswordVersion();
        usuario.setPasswordVersion(version + 1);
        usuarioRepository.save(usuario);

        registro.setUsadoEn(LocalDateTime.now());
        codigoRepository.save(registro);
    }

    private void crearCodigo(Usuario usuario) {
        String correo = usuario.getEmail().toLowerCase(Locale.ROOT);
        List<PasswordResetCodigo> anteriores = codigoRepository.findByEmailAndUsadoEnIsNull(correo);
        if (!anteriores.isEmpty()) {
            codigoRepository.deleteAll(anteriores);
        }

        String codigo = String.format(Locale.ROOT, "%06d", 100000 + aleatorio.nextInt(900000));
        LocalDateTime ahora = LocalDateTime.now();
        PasswordResetCodigo registro = PasswordResetCodigo.builder()
                .email(correo)
                .codigoHash(calcularHash(correo, codigo))
                .creadoEn(ahora)
                .expiraEn(ahora.plusMinutes(minutosExpiracion))
                .intentos(0)
                .build();
        codigoRepository.save(registro);
        emailService.enviarCodigoRecuperacion(usuario.getNombre(), correo, codigo);
    }

    private Optional<Usuario> buscarCiudadano(String correo) {
        return usuarioRepository.findByEmail(correo)
                .filter(usuario -> usuario.getRolUsuario() == RolUsuario.CIUDADANO)
                .filter(usuario -> !Boolean.FALSE.equals(usuario.getActivo()));
    }

    private PasswordResetCodigo obtenerRegistroValido(String correo) {
        PasswordResetCodigo registro = codigoRepository
                .findTopByEmailAndUsadoEnIsNullOrderByCreadoEnDesc(correo)
                .orElseThrow(() -> new IllegalStateException(MENSAJE_GENERICO));
        if (buscarCiudadano(correo).isEmpty()
                || registro.getExpiraEn().isBefore(LocalDateTime.now())
                || registro.getIntentos() >= maxIntentos) {
            throw new IllegalStateException(MENSAJE_GENERICO);
        }
        return registro;
    }

    private void validarHash(PasswordResetCodigo registro, String correo, String codigo) {
        String esperado = registro.getCodigoHash();
        String recibido = calcularHash(correo, codigo == null ? "" : codigo.trim());
        if (!esperado.equals(recibido)) {
            registro.setIntentos(registro.getIntentos() + 1);
            codigoRepository.save(registro);
            throw new IllegalStateException(MENSAJE_GENERICO);
        }
    }

    private String calcularHash(String correo, String codigo) {
        try {
            Mac mac = Mac.getInstance(ALGORITMO_HMAC);
            mac.init(new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), ALGORITMO_HMAC));
            byte[] bytes = mac.doFinal((correo + ":" + codigo).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo procesar el código", ex);
        }
    }

    private String normalizar(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
