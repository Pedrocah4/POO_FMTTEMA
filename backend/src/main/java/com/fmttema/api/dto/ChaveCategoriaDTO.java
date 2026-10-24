package com.fmttema.api.dto;

import java.util.List;

public record ChaveCategoriaDTO(
        Long categoriaId,
        String categoriaNome,
        Double pesoMaximo,
        Integer totalInscritos,
        String tipoChave,
        boolean temBye,
        AtletaChaveDTO atletaBye,
        String mensagemBye,
        List<LutaChaveDTO> lutas
) {
}
