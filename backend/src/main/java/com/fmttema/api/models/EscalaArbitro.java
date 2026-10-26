package com.fmttema.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "escalas_arbitros")
public class EscalaArbitro implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arbitro_id", nullable = false)
    private Usuario arbitro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @Column(nullable = false, length = 100)
    private String funcao = "Árbitro Central";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusPresencaArbitro status = StatusPresencaArbitro.PENDENTE;

    @Column(name = "data_convocacao")
    private LocalDateTime dataConvocacao = LocalDateTime.now();

    @Column(name = "data_confirmacao")
    private LocalDateTime dataConfirmacao;

    @Column(length = 255)
    private String observacoes;

    public EscalaArbitro() {
    }

    public EscalaArbitro(Usuario arbitro, Evento evento, String funcao) {
        this.arbitro = arbitro;
        this.evento = evento;
        this.funcao = funcao != null ? funcao : "Árbitro Central";
        this.status = StatusPresencaArbitro.PENDENTE;
        this.dataConvocacao = LocalDateTime.now();
    }

    public EscalaArbitro(Usuario arbitro, Evento evento, String funcao, StatusPresencaArbitro status) {
        this.arbitro = arbitro;
        this.evento = evento;
        this.funcao = funcao != null ? funcao : "Árbitro Central";
        this.status = status != null ? status : StatusPresencaArbitro.PENDENTE;
        this.dataConvocacao = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getArbitro() {
        return arbitro;
    }

    public void setArbitro(Usuario arbitro) {
        this.arbitro = arbitro;
    }

    public Evento getEvento() {
        return evento;
    }

    public void setEvento(Evento evento) {
        this.evento = evento;
    }

    public String getFuncao() {
        return funcao;
    }

    public void setFuncao(String funcao) {
        this.funcao = funcao;
    }

    public StatusPresencaArbitro getStatus() {
        return status;
    }

    public void setStatus(StatusPresencaArbitro status) {
        this.status = status;
    }

    public LocalDateTime getDataConvocacao() {
        return dataConvocacao;
    }

    public void setDataConvocacao(LocalDateTime dataConvocacao) {
        this.dataConvocacao = dataConvocacao;
    }

    public LocalDateTime getDataConfirmacao() {
        return dataConfirmacao;
    }

    public void setDataConfirmacao(LocalDateTime dataConfirmacao) {
        this.dataConfirmacao = dataConfirmacao;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EscalaArbitro that = (EscalaArbitro) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
