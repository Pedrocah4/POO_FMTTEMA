package com.fmttema.api.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErroRespostaDTO(
        LocalDateTime timestamp,
        int status,
        String erro,
        String mensagem,
        String path,
        Map<String, String> validacoes
) {
    public ErroRespostaDTO(int status, String erro, String mensagem, String path) {
        this(LocalDateTime.now(), status, erro, mensagem, path, null);
    }

    public ErroRespostaDTO(int status, String erro, String mensagem, String path, Map<String, String> validacoes) {
        this(LocalDateTime.now(), status, erro, mensagem, path, validacoes);
    }
}
