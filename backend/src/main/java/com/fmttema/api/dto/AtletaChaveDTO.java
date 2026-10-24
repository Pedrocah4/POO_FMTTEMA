package com.fmttema.api.dto;

import com.fmttema.api.models.Atleta;

public record AtletaChaveDTO(
        Long id,
        String nome,
        String apelido,
        Double peso,
        Integer vitorias,
        Integer derrotas,
        String graduacao,
        String academia
) {
    public static AtletaChaveDTO fromEntity(Atleta atleta) {
        if (atleta == null) return null;
        return new AtletaChaveDTO(
                atleta.getId(),
                atleta.getNome(),
                atleta.getApelido(),
                atleta.getPeso(),
                atleta.getVitorias() != null ? atleta.getVitorias() : 0,
                atleta.getDerrotas() != null ? atleta.getDerrotas() : 0,
                atleta.getKruang() != null ? atleta.getKruang() : atleta.getGraduacao(),
                atleta.getAcademia() != null ? atleta.getAcademia().getNome() : null
        );
    }
}
