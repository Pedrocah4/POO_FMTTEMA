package com.fmttema.api.dto;

import com.fmttema.api.models.Patrocinador;

import java.time.LocalDateTime;

public record PatrocinadorResponseDTO(
        Long id,
        String nome,
        String siteUrl,
        String logoUrl,
        String categoria,
        Boolean ativo,
        Integer ordemExibicao,
        LocalDateTime dataCadastro
) {
    public static PatrocinadorResponseDTO fromEntity(Patrocinador p) {
        return new PatrocinadorResponseDTO(
                p.getId(),
                p.getNome(),
                p.getSiteUrl(),
                p.getLogoUrl(),
                p.getCategoria(),
                p.getAtivo(),
                p.getOrdemExibicao(),
                p.getDataCadastro()
        );
    }
}
