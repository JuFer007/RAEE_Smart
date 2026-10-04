package com.raeesmart.backend.Controller;
import com.raeesmart.backend.Dto.Response.EntregaResponseDTO;
import com.raeesmart.backend.Dto.Response.UsuarioResponseDTO;
import com.raeesmart.backend.Model.Usuario;
import com.raeesmart.backend.Service.EntregaService;
import com.raeesmart.backend.Service.UsuarioService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")

public class UsuarioController {
    private final UsuarioService usuarioService;
    private final EntregaService entregaService;

    public UsuarioController(UsuarioService usuarioService, EntregaService entregaService) {
        this.usuarioService = usuarioService;
        this.entregaService = entregaService;
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO obtenerPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .telefono(usuario.getTelefono())
                .rol(usuario.getRolUsuario())
                .build();
    }

    @GetMapping("/{id}/entregas")
    public List<EntregaResponseDTO> listarEntregas(@PathVariable Long id) {
        return entregaService.listarPorUsuario(id);
    }
}
