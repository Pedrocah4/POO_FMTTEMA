package com.fmttema.api.dto;

import com.fmttema.api.models.StatusEvento;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record EventoRequestDTO(
        @NotBlank(message = "O nome do evento é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String nome,

        @NotNull(message = "A data do evento é obrigatória")
        @FutureOrPresent(message = "A data do evento não pode ser no passado")
        LocalDate data,

        @NotBlank(message = "O local do evento é obrigatório")
        @Size(max = 200, message = "O local deve ter no máximo 200 caracteres")
        String local,

        String descricao,

        StatusEvento status,

        List<Long> categoriasIds
) {
}
