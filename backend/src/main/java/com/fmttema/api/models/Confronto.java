package com.fmttema.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/**
 * Entidade que representa um combate/luta individual na árvore de chaveamento do torneio (US07.1).
 */
@Entity
@Table(name = "confrontos")
public class Confronto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_peso_id", nullable = false)
    private CategoriaPeso categoriaPeso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atleta_vermelho_id")
    private Atleta atletaVermelho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atleta_azul_id")
    private Atleta atletaAzul;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vencedor_id")
    private Atleta vencedor;

    @Column(nullable = false, length = 100)
    private String fase; // ex: "Primeira Rodada Eliminatória", "Semifinais", "Final"

    @Column(name = "numero_luta", nullable = false)
    private Integer numeroLuta;

    @Column(name = "metodo_vitoria", length = 100)
    private String metodoVitoria; // ex: "Nocaute (KO)", "Decisão Unânime", "W.O."

    @Column(nullable = false, length = 50)
    private String status = "AGENDADA"; // "AGENDADA", "FINALIZADA"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proximo_confronto_id")
    private Confronto proximoConfronto;

    @Column(name = "data_hora_resultado")
    private LocalDateTime dataHoraResultado;

    public Confronto() {
    }

    public Confronto(Evento evento, CategoriaPeso categoriaPeso, Atleta atletaVermelho, Atleta atletaAzul, String fase, Integer numeroLuta) {
        this.evento = evento;
        this.categoriaPeso = categoriaPeso;
        this.atletaVermelho = atletaVermelho;
        this.atletaAzul = atletaAzul;
        this.fase = fase;
        this.numeroLuta = numeroLuta;
        this.status = "AGENDADA";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Atleta getAtletaVermelho() {
        return atletaVermelho;
    }

    public void setAtletaVermelho(Atleta atletaVermelho) {
        this.atletaVermelho = atletaVermelho;
    }

    public Atleta getAtletaAzul() {
        return atletaAzul;
    }

    public void setAtletaAzul(Atleta atletaAzul) {
        this.atletaAzul = atletaAzul;
    }

    public Atleta getVencedor() {
        return vencedor;
    }

    public void setVencedor(Atleta vencedor) {
        this.vencedor = vencedor;
    }

    public String getFase() {
        return fase;
    }

    public void setFase(String fase) {
        this.fase = fase;
    }

    public Integer getNumeroLuta() {
        return numeroLuta;
    }

    public void setNumeroLuta(Integer numeroLuta) {
        this.numeroLuta = numeroLuta;
    }

    public String getMetodoVitoria() {
        return metodoVitoria;
    }

    public void setMetodoVitoria(String metodoVitoria) {
        this.metodoVitoria = metodoVitoria;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Confronto getProximoConfronto() {
        return proximoConfronto;
    }

    public void setProximoConfronto(Confronto proximoConfronto) {
        this.proximoConfronto = proximoConfronto;
    }

    public LocalDateTime getDataHoraResultado() {
        return dataHoraResultado;
    }

    public void setDataHoraResultado(LocalDateTime dataHoraResultado) {
        this.dataHoraResultado = dataHoraResultado;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Confronto confronto = (Confronto) o;
        return Objects.equals(id, confronto.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
