package com.raeesmart.backend.Service;
import com.raeesmart.backend.Model.Usuario;

public interface UsuarioService {
    Usuario registrar(Usuario usuario);
    Usuario buscarPorId(Long id);
    Usuario buscarPorEmail(String email);
}
