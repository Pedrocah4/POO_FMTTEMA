package com.fmttema.api.dto;

import java.time.LocalDate;
import java.util.List;

public record ChaveamentoResponseDTO(
        Long eventoId,
        String eventoNome,
        LocalDate eventoData,
        String eventoLocal,
        Integer totalCategorias,
        List<ChaveCategoriaDTO> categorias
) {
}
