package com.fmttema.api.models;

public enum StatusPagamento {
    PAGO("Pago"),
    PENDENTE("Pendente");

    private final String descricao;

    StatusPagamento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
