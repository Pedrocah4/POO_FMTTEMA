package com.fmttema.api.dto;

import jakarta.validation.constraints.NotBlank;

public record BaixaAnuidadeRequestDTO(
        @NotBlank(message = "O comprovante de pagamento é obrigatório (link ou identificador do arquivo)")
        String comprovante,

        Double valor,

        String tipoBeneficiario, // "ATLETA" ou "ACADEMIA" (opcional se determinável pelo ID)

        String observacoes
) {
}
