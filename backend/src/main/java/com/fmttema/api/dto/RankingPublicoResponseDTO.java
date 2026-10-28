package com.fmttema.api.dto;

import java.util.List;

public record RankingPublicoResponseDTO(
        List<AtletaRankingDTO> rankingVolume,
        List<AtletaRankingDTO> rankingEficiencia,
        List<String> categoriasDisponiveis,
        Integer minimoLutasEficiencia,
        String categoriaFiltrada
) {}

