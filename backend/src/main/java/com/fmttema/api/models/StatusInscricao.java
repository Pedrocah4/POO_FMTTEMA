package com.fmttema.api.models;

public enum StatusInscricao {
    CONFIRMADA("Confirmada"),
    PENDENTE("Pendente"),
    CANCELADA("Cancelada");

    private final String descricao;

    StatusInscricao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
