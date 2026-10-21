package com.fmttema.api.dto;

import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;

public record UsuarioResponseDTO(
        Long id,
        String email,
        PerfilAcesso perfil,
        StatusUsuario status,
        String nome,
        String documento
) {
    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getStatus(),
                null,
                null
        );
    }

    public static UsuarioResponseDTO fromEntity(Usuario usuario, String nome, String documento) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getStatus(),
                nome,
                documento
        );
    }
}
