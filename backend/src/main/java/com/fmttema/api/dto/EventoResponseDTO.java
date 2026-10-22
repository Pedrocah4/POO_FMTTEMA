package com.fmttema.api.dto;

import com.fmttema.api.models.Evento;
import com.fmttema.api.models.StatusEvento;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

public record EventoResponseDTO(
        Long id,
        String nome,
        LocalDate data,
        String local,
        String descricao,
        StatusEvento status,
        List<CategoriaPesoResponseDTO> categorias
) {
    public static EventoResponseDTO fromEntity(Evento evento) {
        if (evento == null) return null;

        List<CategoriaPesoResponseDTO> categoriasDTO = evento.getCategorias() != null
                ? evento.getCategorias().stream().map(CategoriaPesoResponseDTO::fromEntity).toList()
                : Collections.emptyList();

        return new EventoResponseDTO(
                evento.getId(),
                evento.getNome(),
                evento.getData(),
                evento.getLocal(),
                evento.getDescricao(),
                evento.getStatus(),
                categoriasDTO
        );
    }
}
