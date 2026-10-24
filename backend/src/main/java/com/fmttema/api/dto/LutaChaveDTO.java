package com.fmttema.api.dto;

public record LutaChaveDTO(
        Integer numeroLuta,
        String fase,
        AtletaChaveDTO cornerVermelho,
        AtletaChaveDTO cornerAzul,
        String status
) {
}
