package com.fmttema.api.dto;

import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;

import java.time.LocalDate;

public record ArbitroResponseDTO(
        Long id,
        String nome,
        String email,
        String numeroLicenca,
        LocalDate dataValidadeLicenca,
        StatusUsuario status,
        PerfilAcesso perfil
) {
    public static ArbitroResponseDTO fromEntity(Usuario usuario) {
        return new ArbitroResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getNumeroLicenca(),
                usuario.getDataValidadeLicenca(),
                usuario.getStatus(),
                usuario.getPerfil()
        );
    }
}
