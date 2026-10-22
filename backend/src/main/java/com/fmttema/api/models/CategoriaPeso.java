package com.fmttema.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "categorias_peso")
public class CategoriaPeso implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "peso_maximo", nullable = false)
    private Double pesoMaximo;

    @Column(length = 20)
    private String genero;

    @Column(length = 255)
    private String descricao;

    @JsonIgnore
    @ManyToMany(mappedBy = "categorias", fetch = FetchType.LAZY)
    private List<Evento> eventos = new ArrayList<>();

    public CategoriaPeso() {
    }

    public CategoriaPeso(String nome, Double pesoMaximo) {
        this.nome = nome;
        this.pesoMaximo = pesoMaximo;
    }

    public CategoriaPeso(String nome, Double pesoMaximo, String genero, String descricao) {
        this.nome = nome;
        this.pesoMaximo = pesoMaximo;
        this.genero = genero;
        this.descricao = descricao;
    }

    public CategoriaPeso(Long id, String nome, Double pesoMaximo, String genero, String descricao) {
        this.id = id;
        this.nome = nome;
        this.pesoMaximo = pesoMaximo;
        this.genero = genero;
        this.descricao = descricao;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Double getPesoMaximo() {
        return pesoMaximo;
    }

    public void setPesoMaximo(Double pesoMaximo) {
        this.pesoMaximo = pesoMaximo;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public List<Evento> getEventos() {
        return eventos;
    }

    public void setEventos(List<Evento> eventos) {
        this.eventos = eventos;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CategoriaPeso that = (CategoriaPeso) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "CategoriaPeso{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", pesoMaximo=" + pesoMaximo +
                ", genero='" + genero + '\'' +
                '}';
    }
}
