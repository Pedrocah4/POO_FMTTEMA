package com.fmttema.api.dto;

public record LutaChaveDTO(
        Long confrontoId,
        Integer numeroLuta,
        String fase,
        AtletaChaveDTO cornerVermelho,
        AtletaChaveDTO cornerAzul,
        AtletaChaveDTO vencedor,
        String metodoVitoria,
        String status
) {
    public LutaChaveDTO(Integer numeroLuta, String fase, AtletaChaveDTO cornerVermelho, AtletaChaveDTO cornerAzul, String status) {
        this(null, numeroLuta, fase, cornerVermelho, cornerAzul, null, null, status);
    }
}
