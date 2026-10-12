package com.fmttema.api.dto;

import com.fmttema.api.models.PerfilAcesso;

public record LoginResponseDTO(
        String token,
        String tipo,
        String email,
        PerfilAcesso perfil
) {
    public LoginResponseDTO(String token, String email, PerfilAcesso perfil) {
        this(token, "Bearer", email, perfil);
    }
}
