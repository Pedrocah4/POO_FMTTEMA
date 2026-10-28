package com.fmttema.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PatrocinadorRequestDTO(
        @NotBlank(message = "O nome do patrocinador é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String nome,

        @Size(max = 500, message = "O link do site deve ter no máximo 500 caracteres")
        String siteUrl,

        @Size(max = 500, message = "O link da logomarca deve ter no máximo 500 caracteres")
        String logoUrl,

        @Size(max = 100, message = "A categoria deve ter no máximo 100 caracteres")
        String categoria,

        Boolean ativo,

        Integer ordemExibicao
) {}
