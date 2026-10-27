package com.fmttema.api.dto;

import com.fmttema.api.models.StatusPagamento;

import java.time.LocalDateTime;

public record BaixaAnuidadeResponseDTO(
        Long beneficiarioId,
        String beneficiarioNome,
        String tipoBeneficiario,
        StatusPagamento statusPagamento,
        String comprovante,
        Double valorPago,
        LocalDateTime dataPagamento,
        Long fluxoCaixaId,
        String mensagem
) {
}
