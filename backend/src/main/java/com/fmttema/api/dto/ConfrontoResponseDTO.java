package com.fmttema.api.dto;

import com.fmttema.api.models.Confronto;

public record ConfrontoResponseDTO(
        Long id,
        Long eventoId,
        String eventoNome,
        Long categoriaPesoId,
        String categoriaPesoNome,
        Integer numeroLuta,
        String fase,
        AtletaChaveDTO atletaVermelho,
        AtletaChaveDTO atletaAzul,
        AtletaChaveDTO vencedor,
        String metodoVitoria,
        String status,
        Long proximoConfrontoId
) {
    public static ConfrontoResponseDTO fromEntity(Confronto c) {
        if (c == null) return null;
        return new ConfrontoResponseDTO(
                c.getId(),
                c.getEvento() != null ? c.getEvento().getId() : null,
                c.getEvento() != null ? c.getEvento().getNome() : null,
                c.getCategoriaPeso() != null ? c.getCategoriaPeso().getId() : null,
                c.getCategoriaPeso() != null ? c.getCategoriaPeso().getNome() : null,
                c.getNumeroLuta(),
                c.getFase(),
                AtletaChaveDTO.fromEntity(c.getAtletaVermelho()),
                AtletaChaveDTO.fromEntity(c.getAtletaAzul()),
                AtletaChaveDTO.fromEntity(c.getVencedor()),
                c.getMetodoVitoria(),
                c.getStatus(),
                c.getProximoConfronto() != null ? c.getProximoConfronto().getId() : null
        );
    }
}
