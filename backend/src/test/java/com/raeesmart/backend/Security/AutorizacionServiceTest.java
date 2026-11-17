package com.raeesmart.backend.Security;

import com.raeesmart.backend.Model.Campana;
import com.raeesmart.backend.Model.Entrega;
import com.raeesmart.backend.Model.Municipalidad;
import com.raeesmart.backend.Model.PuntoRecoleccion;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Model.Enums.RolUsuario;
import com.raeesmart.backend.Repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AutorizacionServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AutorizacionService autorizacionService;

    @AfterEach
    void limpiarContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void ciudadanoPuedeAccederASuPropiaEntrega() {
        Usuario dueno = crearUsuario(1L, RolUsuario.CIUDADANO, null);
        autenticar(dueno);

        assertDoesNotThrow(() -> autorizacionService.validarAccesoEntrega(crearEntrega(dueno, 10L)));
    }

    @Test
    void ciudadanoNoPuedeAccederAEntregaAjena() {
        Usuario dueno = crearUsuario(1L, RolUsuario.CIUDADANO, null);
        Usuario otro = crearUsuario(2L, RolUsuario.CIUDADANO, null);
        autenticar(otro);

        assertThrows(AccessDeniedException.class,
                () -> autorizacionService.validarAccesoEntrega(crearEntrega(dueno, 10L)));
    }

    @Test
    void adminPuedeAccederACualquierEntrega() {
        Usuario dueno = crearUsuario(1L, RolUsuario.CIUDADANO, null);
        Usuario admin = crearUsuario(9L, RolUsuario.ADMIN, null);
        autenticar(admin);

        assertDoesNotThrow(() -> autorizacionService.validarAccesoEntrega(crearEntrega(dueno, 10L)));
    }

    @Test
    void municipalidadPuedeAccederAEntregasDeSuMunicipalidad() {
        Usuario dueno = crearUsuario(1L, RolUsuario.CIUDADANO, null);
        Usuario municipal = crearUsuario(3L, RolUsuario.MUNICIPALIDAD, 10L);
        autenticar(municipal);

        assertDoesNotThrow(() -> autorizacionService.validarAccesoEntrega(crearEntrega(dueno, 10L)));
    }

    @Test
    void municipalidadNoPuedeAccederAEntregasDeOtraMunicipalidad() {
        Usuario dueno = crearUsuario(1L, RolUsuario.CIUDADANO, null);
        Usuario municipal = crearUsuario(3L, RolUsuario.MUNICIPALIDAD, 20L);
        autenticar(municipal);

        assertThrows(AccessDeniedException.class,
                () -> autorizacionService.validarAccesoEntrega(crearEntrega(dueno, 10L)));
    }

    @Test
    void ciudadanoDuenoNoPuedeGestionarEntrega() {
        Usuario dueno = crearUsuario(1L, RolUsuario.CIUDADANO, null);
        autenticar(dueno);

        assertThrows(AccessDeniedException.class,
                () -> autorizacionService.validarGestionEntrega(crearEntrega(dueno, 10L)));
    }

    @Test
    void municipalidadPuedeGestionarEntregasDeSuMunicipalidad() {
        Usuario dueno = crearUsuario(1L, RolUsuario.CIUDADANO, null);
        Usuario municipal = crearUsuario(3L, RolUsuario.MUNICIPALIDAD, 10L);
        autenticar(municipal);

        assertDoesNotThrow(() -> autorizacionService.validarGestionEntrega(crearEntrega(dueno, 10L)));
    }

    @Test
    void usuarioPuedeAccederASuPropioPerfil() {
        Usuario usuario = crearUsuario(5L, RolUsuario.CIUDADANO, null);
        autenticar(usuario);

        assertDoesNotThrow(() -> autorizacionService.validarAccesoUsuario(5L));
    }

    @Test
    void usuarioNoPuedeAccederAPerfilAjeno() {
        Usuario usuario = crearUsuario(5L, RolUsuario.CIUDADANO, null);
        autenticar(usuario);

        assertThrows(AccessDeniedException.class, () -> autorizacionService.validarAccesoUsuario(6L));
    }

    @Test
    void adminPuedeAccederAPerfilAjeno() {
        Usuario admin = crearUsuario(9L, RolUsuario.ADMIN, null);
        autenticar(admin);

        assertDoesNotThrow(() -> autorizacionService.validarAccesoUsuario(6L));
    }

    @Test
    void municipalidadSoloPuedeConsultarSuPropioReporte() {
        Usuario municipal = crearUsuario(3L, RolUsuario.MUNICIPALIDAD, 10L);
        autenticar(municipal);

        assertDoesNotThrow(() -> autorizacionService.validarAccesoMunicipalidad(10L));
        assertThrows(AccessDeniedException.class, () -> autorizacionService.validarAccesoMunicipalidad(20L));
    }

    @Test
    void municipalidadSiempreResuelveSuPropiaMunicipalidad() {
        Usuario municipal = crearUsuario(3L, RolUsuario.MUNICIPALIDAD, 10L);
        autenticar(municipal);

        assertEquals(10L, autorizacionService.resolverMunicipalidadId(20L));
        assertEquals(10L, autorizacionService.resolverMunicipalidadIdOpcional(20L));
    }

    @Test
    void municipalidadNoPuedeGestionarPuntosDeOtraMunicipalidad() {
        Usuario municipal = crearUsuario(3L, RolUsuario.MUNICIPALIDAD, 10L);
        autenticar(municipal);

        assertDoesNotThrow(() -> autorizacionService.validarGestionPunto(crearPunto(10L)));
        assertThrows(AccessDeniedException.class,
                () -> autorizacionService.validarGestionPunto(crearPunto(20L)));
    }

    @Test
    void municipalidadNoPuedeGestionarCampanasDeOtraMunicipalidad() {
        Usuario municipal = crearUsuario(3L, RolUsuario.MUNICIPALIDAD, 10L);
        autenticar(municipal);

        assertDoesNotThrow(() -> autorizacionService.validarGestionCampana(crearCampana(10L)));
        assertThrows(AccessDeniedException.class,
                () -> autorizacionService.validarGestionCampana(crearCampana(20L)));
    }

    @Test
    void adminVinculadoAUnaMunicipalidadNoEsSuperAdmin() {
        Usuario adminMunicipal = crearUsuario(9L, RolUsuario.ADMIN, 10L);
        autenticar(adminMunicipal);

        assertThrows(AccessDeniedException.class, () -> autorizacionService.validarSuperAdmin());
        assertThrows(AccessDeniedException.class,
                () -> autorizacionService.validarAccesoMunicipalidad(20L));
    }

    @Test
    void superAdminPuedeAdministrarMunicipalidadesYResolverCualquiera() {
        Usuario superAdmin = crearUsuario(9L, RolUsuario.ADMIN, null);
        autenticar(superAdmin);

        assertDoesNotThrow(() -> autorizacionService.validarSuperAdmin());
        assertEquals(20L, autorizacionService.resolverMunicipalidadId(20L));
    }

    @Test
    void sinAutenticacionDeniegaAcceso() {
        SecurityContextHolder.clearContext();

        assertThrows(AccessDeniedException.class, () -> autorizacionService.validarAccesoUsuario(1L));
    }

    private void autenticar(Usuario usuario) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuario.getEmail(), null, List.of()));
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
    }

    private Usuario crearUsuario(Long id, RolUsuario rol, Long municipalidadId) {
        Municipalidad municipalidad = municipalidadId == null
                ? null
                : Municipalidad.builder().id(municipalidadId).nombre("Municipalidad").build();
        return Usuario.builder()
                .id(id)
                .email("usuario" + id + "@raee.com")
                .rolUsuario(rol)
                .municipalidad(municipalidad)
                .build();
    }

    private PuntoRecoleccion crearPunto(Long municipalidadId) {
        Municipalidad municipalidad = Municipalidad.builder().id(municipalidadId).nombre("Municipalidad").build();
        return PuntoRecoleccion.builder()
                .id(100L)
                .nombre("Punto")
                .municipalidad(municipalidad)
                .build();
    }

    private Campana crearCampana(Long municipalidadId) {
        Municipalidad municipalidad = Municipalidad.builder().id(municipalidadId).nombre("Municipalidad").build();
        return Campana.builder()
                .id(200L)
                .titulo("Campaña")
                .municipalidad(municipalidad)
                .build();
    }

    private Entrega crearEntrega(Usuario dueno, Long municipalidadId) {
        Municipalidad municipalidad = Municipalidad.builder().id(municipalidadId).nombre("Municipalidad").build();
        PuntoRecoleccion punto = PuntoRecoleccion.builder()
                .id(100L)
                .nombre("Punto")
                .municipalidad(municipalidad)
                .build();
        return Entrega.builder()
                .id(50L)
                .usuario(dueno)
                .puntoRecoleccion(punto)
                .build();
    }
}
