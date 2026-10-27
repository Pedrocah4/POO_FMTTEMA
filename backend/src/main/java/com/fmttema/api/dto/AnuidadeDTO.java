package com.fmttema.api.dto;

import com.fmttema.api.models.StatusPagamento;

public record AnuidadeDTO(
        Long id,
        String tipo, // "ATLETA" ou "ACADEMIA"
        String nome,
        String documento, // CPF ou Telefone/Cidade
        String email,
        StatusPagamento statusPagamento,
        String comprovante,
        String academiaNome
) {
}
