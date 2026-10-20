package com.fmttema.api.dto;

import com.fmttema.api.models.StatusUsuario;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusUsuarioDTO(
        @NotNull(message = "O status é obrigatório")
        StatusUsuario status
) {}
