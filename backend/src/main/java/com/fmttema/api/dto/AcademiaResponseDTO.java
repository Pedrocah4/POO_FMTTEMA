package com.fmttema.api.dto;

import com.fmttema.api.models.Academia;
import com.fmttema.api.models.StatusUsuario;

public record AcademiaResponseDTO(
        Long id,
        String nome,
        String responsavel,
        String telefone,
        String cidade,
        String email,
        StatusUsuario status
) {
    public static AcademiaResponseDTO fromEntity(Academia academia) {
        return new AcademiaResponseDTO(
                academia.getId(),
                academia.getNome(),
                academia.getResponsavel(),
                academia.getTelefone(),
                academia.getCidade(),
                academia.getUsuario() != null ? academia.getUsuario().getEmail() : null,
                academia.getUsuario() != null ? academia.getUsuario().getStatus() : null
        );
    }
}
