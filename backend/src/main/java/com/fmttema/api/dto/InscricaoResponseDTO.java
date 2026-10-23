package com.fmttema.api.dto;

import com.fmttema.api.models.Inscricao;
import com.fmttema.api.models.StatusInscricao;

import java.time.LocalDateTime;

public record InscricaoResponseDTO(
        Long id,
        Long eventoId,
        String eventoNome,
        Long atletaId,
        String atletaNome,
        Double atletaPeso,
        Long categoriaPesoId,
        String categoriaPesoNome,
        Double categoriaPesoMaximo,
        StatusInscricao status,
        LocalDateTime dataHoraInscricao
) {
    public static InscricaoResponseDTO fromEntity(Inscricao inscricao) {
        if (inscricao == null) return null;
        return new InscricaoResponseDTO(
                inscricao.getId(),
                inscricao.getEvento() != null ? inscricao.getEvento().getId() : null,
                inscricao.getEvento() != null ? inscricao.getEvento().getNome() : null,
                inscricao.getAtleta() != null ? inscricao.getAtleta().getId() : null,
                inscricao.getAtleta() != null ? inscricao.getAtleta().getNome() : null,
                inscricao.getAtleta() != null ? inscricao.getAtleta().getPeso() : null,
                inscricao.getCategoriaPeso() != null ? inscricao.getCategoriaPeso().getId() : null,
                inscricao.getCategoriaPeso() != null ? inscricao.getCategoriaPeso().getNome() : null,
                inscricao.getCategoriaPeso() != null ? inscricao.getCategoriaPeso().getPesoMaximo() : null,
                inscricao.getStatus(),
                inscricao.getDataHoraInscricao()
        );
    }
}
