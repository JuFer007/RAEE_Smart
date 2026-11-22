package com.raeesmart.backend.Service;

import com.raeesmart.backend.Dto.Request.AdminUsuarioPasswordRequestDTO;
import com.raeesmart.backend.Dto.Request.AdminUsuarioRequestDTO;
import com.raeesmart.backend.Dto.Response.AdminUsuarioResponseDTO;
import java.util.List;

public interface AdminUsuarioService {
    List<AdminUsuarioResponseDTO> listar(Long municipalidadId, String rol, Boolean activo, String q);
    AdminUsuarioResponseDTO crear(AdminUsuarioRequestDTO request);
    AdminUsuarioResponseDTO actualizar(Long id, AdminUsuarioRequestDTO request);
    AdminUsuarioResponseDTO cambiarEstado(Long id, boolean valor);
    void cambiarPassword(Long id, AdminUsuarioPasswordRequestDTO request);
}
