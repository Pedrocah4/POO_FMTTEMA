package com.fmttema.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AtletaRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,

        String apelido,

        @NotBlank(message = "O CPF é obrigatório")
        String cpf,

        @NotNull(message = "O peso é obrigatório")
        @Positive(message = "O peso deve ser maior que zero")
        Double peso,

        @NotBlank(message = "A categoria é obrigatória")
        String categoria,

        LocalDate dataNascimento,

        String graduacao,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "Formato de e-mail inválido")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        String senha,

        Long academiaId
) {}
