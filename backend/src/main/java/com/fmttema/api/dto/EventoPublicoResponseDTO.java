package com.fmttema.api.dto;

import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.StatusEvento;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

/**
 * DTO público para a Vitrine de Eventos Ativos (US13).
 * Por segurança, expõe apenas informações públicas do evento (Nome, Data, Local,
 * Status, URL do Ingresso, Cartaz e Categorias), omitindo dados administrativos ou financeiros.
 */
public record EventoPublicoResponseDTO(
        Long id,
        String nome,
        LocalDate data,
        String local,
        String descricao,
        StatusEvento status,
        String urlIngresso,
        String cartazUrl,
        List<String> categorias
) {
    public static EventoPublicoResponseDTO fromEntity(Evento evento) {
        if (evento == null) return null;

        List<String> nomesCategorias = evento.getCategorias() != null
                ? evento.getCategorias().stream()
                    .map(CategoriaPeso::getNome)
                    .toList()
                : Collections.emptyList();

        return new EventoPublicoResponseDTO(
                evento.getId(),
                evento.getNome(),
                evento.getData(),
                evento.getLocal(),
                evento.getDescricao(),
                evento.getStatus(),
                evento.getUrlIngresso(),
                evento.getCartazUrl(),
                nomesCategorias
        );
    }
}

