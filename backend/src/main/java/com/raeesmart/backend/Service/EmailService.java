package com.raeesmart.backend.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class EmailService {
    private static final Logger LOG = Logger.getLogger(EmailService.class.getName());

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${raeesmart.correo.from:}")
    private String remitente;

    @Value("${spring.mail.username:}")
    private String usuarioSmtp;

    @Value("${raeesmart.correo.logo:email/logoRAEE.png}")
    private String rutaLogo;

    @Value("${raeesmart.password-reset.expiration-minutes:10}")
    private long minutosExpiracion;

    @Async
    public void enviarCodigoRecuperacion(String nombre, String email, String codigo) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("nombre", nombre);
        variables.put("codigo", codigo);
        variables.put("minutos", minutosExpiracion);
        enviarPlantilla("email/recuperar-password", "Código de recuperación - RAEE Smart", email, variables);
    }

    @Async
    public void enviarBienvenida(String nombre, String email, String perfil, String punto) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("nombre", nombre);
        variables.put("perfil", perfil);
        variables.put("punto", punto);
        enviarPlantilla("email/bienvenida", "Bienvenido a RAEE Smart", email, variables);
    }

    @Async
    public void enviarEntregaRegistrada(String nombre, String email, String codigoEntrega, String residuos, String fecha, String punto) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("nombre", nombre);
        variables.put("codigoEntrega", codigoEntrega);
        variables.put("residuos", residuos);
        variables.put("fecha", fecha);
        variables.put("punto", punto);
        enviarPlantilla("email/entrega-registrada", "Entrega registrada - RAEE Smart", email, variables);
    }

    @Async
    public void enviarEntregaConfirmada(String nombre, String email, String codigoEntrega, String fecha, String punto, String puntos, String codigoCertificado) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("nombre", nombre);
        variables.put("codigoEntrega", codigoEntrega);
        variables.put("fecha", fecha);
        variables.put("punto", punto);
        variables.put("puntos", puntos);
        variables.put("codigoCertificado", codigoCertificado);
        enviarPlantilla("email/entrega-confirmada", "Entrega confirmada - RAEE Smart", email, variables);
    }

    @Async
    public void enviarEntregaRechazada(String nombre, String email, String codigoEntrega, String fecha, String motivo) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("nombre", nombre);
        variables.put("codigoEntrega", codigoEntrega);
        variables.put("fecha", fecha);
        variables.put("motivo", motivo);
        enviarPlantilla("email/entrega-rechazada", "Entrega rechazada - RAEE Smart", email, variables);
    }

    @Async
    public void enviarCampana(String nombre, String email, String titulo, String estado, String descripcion, String fechaInicio, String fechaFin, String punto) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("nombre", nombre);
        variables.put("titulo", titulo);
        variables.put("estado", estado);
        variables.put("descripcion", descripcion);
        variables.put("fechaInicio", fechaInicio);
        variables.put("fechaFin", fechaFin);
        variables.put("punto", punto);
        enviarPlantilla("email/campana", titulo + " - RAEE Smart", email, variables);
    }

    @Async
    public void enviarPuntoAcopio(String nombre, String email, String accion, String punto, String direccion, String horario) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("nombre", nombre);
        variables.put("accion", accion);
        variables.put("punto", punto);
        variables.put("direccion", direccion);
        variables.put("horario", horario);
        enviarPlantilla("email/punto-acopio", "Punto de acopio actualizado - RAEE Smart", email, variables);
    }

    @Async
    public void enviarAvisoSeguridad(String nombre, String email, String fechaHora, String dispositivo, String ip) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("nombre", nombre);
        variables.put("fechaHora", fechaHora);
        variables.put("dispositivo", dispositivo);
        variables.put("ip", ip);
        enviarPlantilla("email/seguridad-password", "Aviso de seguridad - RAEE Smart", email, variables);
    }

    private void enviarPlantilla(String plantilla, String asunto, String destinatario, Map<String, Object> variables) {
        try {
            Context context = new Context();
            variables.forEach(context::setVariable);
            String html = templateEngine.process(plantilla, context);
            enviarCorreo(destinatario, asunto, html);
        } catch (Exception ex) {
            LOG.warning("No se pudo enviar " + plantilla + ": " + ex.getMessage());
        }
    }

    private void enviarCorreo(String destinatario, String asunto, String html) throws Exception {
        MimeMessage mensaje = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
        String desde = remitente == null || remitente.isBlank() ? usuarioSmtp : remitente;
        helper.setFrom(desde);
        helper.setTo(destinatario);
        helper.setSubject(asunto);
        helper.setText(html, true);
        ClassPathResource logo = new ClassPathResource(rutaLogo);
        if (logo.exists()) {
            helper.addInline("logoRAEE", logo);
        }
        mailSender.send(mensaje);
    }
}
