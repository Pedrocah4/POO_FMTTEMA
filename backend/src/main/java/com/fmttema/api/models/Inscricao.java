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
import jakarta.persistence.UniqueConstraint;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
    name = "inscricoes",
    uniqueConstraints = @UniqueConstraint(name = "uk_inscricao_atleta_evento", columnNames = {"atleta_id", "evento_id"})
)
public class Inscricao implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "atleta_id", nullable = false)
    private Atleta atleta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_peso_id")
    private CategoriaPeso categoriaPeso;

    @Column(name = "data_hora_inscricao", nullable = false)
    private LocalDateTime dataHoraInscricao = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusInscricao status = StatusInscricao.CONFIRMADA;

    public Inscricao() {
    }

    public Inscricao(Atleta atleta, Evento evento, CategoriaPeso categoriaPeso) {
        this.atleta = atleta;
        this.evento = evento;
        this.categoriaPeso = categoriaPeso;
        this.dataHoraInscricao = LocalDateTime.now();
        this.status = StatusInscricao.CONFIRMADA;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Atleta getAtleta() {
        return atleta;
    }

    public void setAtleta(Atleta atleta) {
        this.atleta = atleta;
    }

    public Evento getEvento() {
        return evento;
    }

    public void setEvento(Evento evento) {
        this.evento = evento;
    }

    public CategoriaPeso getCategoriaPeso() {
        return categoriaPeso;
    }

    public void setCategoriaPeso(CategoriaPeso categoriaPeso) {
        this.categoriaPeso = categoriaPeso;
    }

    public LocalDateTime getDataHoraInscricao() {
        return dataHoraInscricao;
    }

    public void setDataHoraInscricao(LocalDateTime dataHoraInscricao) {
        this.dataHoraInscricao = dataHoraInscricao;
    }

    public StatusInscricao getStatus() {
        return status;
    }

    public void setStatus(StatusInscricao status) {
        this.status = status;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Inscricao inscricao = (Inscricao) o;
        return Objects.equals(id, inscricao.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Inscricao{" +
                "id=" + id +
                ", atleta=" + (atleta != null ? atleta.getId() : null) +
                ", evento=" + (evento != null ? evento.getId() : null) +
                ", categoriaPeso=" + (categoriaPeso != null ? categoriaPeso.getNome() : null) +
                ", status=" + status +
                '}';
    }
}
