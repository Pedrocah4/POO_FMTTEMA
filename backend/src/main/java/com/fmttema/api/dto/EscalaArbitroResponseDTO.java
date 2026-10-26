package com.fmttema.api.dto;

import com.fmttema.api.models.EscalaArbitro;
import com.fmttema.api.models.StatusPresencaArbitro;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EscalaArbitroResponseDTO(
        Long id,
        Long arbitroId,
        String arbitroEmail,
        Long eventoId,
        String eventoNome,
        LocalDate eventoData,
        String eventoLocal,
        String funcao,
        StatusPresencaArbitro status,
        LocalDateTime dataConvocacao,
        LocalDateTime dataConfirmacao,
        String observacoes
) {
    public static EscalaArbitroResponseDTO fromEntity(EscalaArbitro escala) {
        if (escala == null) return null;

        Long arbId = escala.getArbitro() != null ? escala.getArbitro().getId() : null;
        String arbEmail = escala.getArbitro() != null ? escala.getArbitro().getEmail() : null;
        Long evId = escala.getEvento() != null ? escala.getEvento().getId() : null;
        String evNome = escala.getEvento() != null ? escala.getEvento().getNome() : null;
        LocalDate evData = escala.getEvento() != null ? escala.getEvento().getData() : null;
        String evLocal = escala.getEvento() != null ? escala.getEvento().getLocal() : null;

        return new EscalaArbitroResponseDTO(
                escala.getId(),
                arbId,
                arbEmail,
                evId,
                evNome,
                evData,
                evLocal,
                escala.getFuncao(),
                escala.getStatus(),
                escala.getDataConvocacao(),
                escala.getDataConfirmacao(),
                escala.getObservacoes()
        );
    }
}
