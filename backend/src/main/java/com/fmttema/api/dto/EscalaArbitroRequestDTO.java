package com.fmttema.api.dto;

import jakarta.validation.constraints.NotNull;

public record EscalaArbitroRequestDTO(
        @NotNull(message = "O ID do árbitro é obrigatório")
        Long arbitroId,

        @NotNull(message = "O ID do evento é obrigatório")
        Long eventoId,

        String funcao,

        String observacoes
) {
}
