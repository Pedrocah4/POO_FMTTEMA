package com.fmttema.api.dto;

import com.fmttema.api.models.FluxoCaixa;
import com.fmttema.api.models.TipoTransacao;

import java.time.LocalDateTime;

public record FluxoCaixaResponseDTO(
        Long id,
        TipoTransacao tipo,
        String descricao,
        Double valor,
        LocalDateTime dataHora,
        String comprovanteUrl,
        String registradoPor,
        String observacoes,
        Long atletaId,
        String atletaNome,
        Long academiaId,
        String academiaNome
) {
    public static FluxoCaixaResponseDTO fromEntity(FluxoCaixa f) {
        if (f == null) return null;
        Long atlId = f.getAtleta() != null ? f.getAtleta().getId() : null;
        String atlNome = f.getAtleta() != null ? f.getAtleta().getNome() : null;
        Long acadId = f.getAcademia() != null ? f.getAcademia().getId() : null;
        String acadNome = f.getAcademia() != null ? f.getAcademia().getNome() : null;

        return new FluxoCaixaResponseDTO(
                f.getId(),
                f.getTipo(),
                f.getDescricao(),
                f.getValor(),
                f.getDataHora(),
                f.getComprovanteUrl(),
                f.getRegistradoPor(),
                f.getObservacoes(),
                atlId,
                atlNome,
                acadId,
                acadNome
        );
    }
}
