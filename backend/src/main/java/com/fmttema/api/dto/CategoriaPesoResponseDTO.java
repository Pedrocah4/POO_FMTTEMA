package com.fmttema.api.dto;

import com.fmttema.api.models.CategoriaPeso;

public record CategoriaPesoResponseDTO(
        Long id,
        String nome,
        Double pesoMaximo,
        String genero,
        String descricao
) {
    public static CategoriaPesoResponseDTO fromEntity(CategoriaPeso categoria) {
        if (categoria == null) return null;
        return new CategoriaPesoResponseDTO(
                categoria.getId(),
                categoria.getNome(),
                categoria.getPesoMaximo(),
                categoria.getGenero(),
                categoria.getDescricao()
        );
    }
}
