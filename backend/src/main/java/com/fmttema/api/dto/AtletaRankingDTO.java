package com.fmttema.api.dto;

public record AtletaRankingDTO(
        Integer posicao,
        Long atletaId,
        String nome,
        String apelido,
        String categoria,
        String graduacao,
        String academiaNome,
        Integer vitorias,
        Integer derrotas,
        Integer empates,
        Integer totalLutas,
        Double percentualAproveitamento
) {}

