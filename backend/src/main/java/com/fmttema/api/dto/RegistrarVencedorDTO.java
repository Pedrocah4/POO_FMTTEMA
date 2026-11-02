package com.fmttema.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistrarVencedorDTO(
        @NotNull(message = "O ID do atleta vencedor é obrigatório")
        Long vencedorId,

        @NotBlank(message = "O método da vitória é obrigatório (ex: KO, Pontos, W.O.)")
        String metodoVitoria
) {
}
