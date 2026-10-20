package com.fmttema.api.dto;

import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;

public record UsuarioResponseDTO(
        Long id,
        String email,
        PerfilAcesso perfil,
        StatusUsuario status
) {
    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getStatus()
        );
    }
}
