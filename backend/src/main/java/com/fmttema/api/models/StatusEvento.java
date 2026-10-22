package com.fmttema.api.models;

public enum StatusEvento {
    AGENDADO("Agendado"),
    EM_ANDAMENTO("Em Andamento"),
    FINALIZADO("Finalizado");

    private final String descricao;

    StatusEvento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
