package com.fmttema.api.dto;

import jakarta.validation.constraints.Min;

public record AtualizarCartelDTO(
        @Min(value = 0, message = "O número de vitórias não pode ser negativo")
        Integer vitorias,

        @Min(value = 0, message = "O número de derrotas não pode ser negativo")
        Integer derrotas,

        @Min(value = 0, message = "O número de empates não pode ser negativo")
        Integer empates,

        String graduacao,

        String kruang
) {}
