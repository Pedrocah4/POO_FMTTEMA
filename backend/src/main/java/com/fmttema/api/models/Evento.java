package com.fmttema.api.models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "eventos")
public class Evento implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false, length = 200)
    private String local;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusEvento status = StatusEvento.AGENDADO;

    @Column(name = "url_ingresso", length = 500)
    private String urlIngresso;

    @Column(name = "cartaz_url", length = 500)
    private String cartazUrl;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE})
    @JoinTable(
        name = "eventos_categorias",
        joinColumns = @JoinColumn(name = "evento_id", referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "categoria_id", referencedColumnName = "id")
    )
    private List<CategoriaPeso> categorias = new ArrayList<>();

    public Evento() {
    }

    public Evento(String nome, LocalDate data, String local) {
        this.nome = nome;
        this.data = data;
        this.local = local;
        this.status = StatusEvento.AGENDADO;
    }

    public Evento(String nome, LocalDate data, String local, StatusEvento status, String descricao) {
        this.nome = nome;
        this.data = data;
        this.local = local;
        this.status = status != null ? status : StatusEvento.AGENDADO;
        this.descricao = descricao;
    }

    public Evento(Long id, String nome, LocalDate data, String local, StatusEvento status, String descricao) {
        this.id = id;
        this.nome = nome;
        this.data = data;
        this.local = local;
        this.status = status != null ? status : StatusEvento.AGENDADO;
        this.descricao = descricao;
    }

    public void adicionarCategoria(CategoriaPeso categoria) {
        if (categoria != null && !this.categorias.contains(categoria)) {
            this.categorias.add(categoria);
            if (!categoria.getEventos().contains(this)) {
                categoria.getEventos().add(this);
            }
        }
    }

    public void removerCategoria(CategoriaPeso categoria) {
        if (categoria != null) {
            this.categorias.remove(categoria);
            categoria.getEventos().remove(this);
        }
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

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getLocal() {
        return local;
    }

    public void setLocal(String local) {
        this.local = local;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public StatusEvento getStatus() {
        return status;
    }

    public void setStatus(StatusEvento status) {
        this.status = status;
    }

    public List<CategoriaPeso> getCategorias() {
        return categorias;
    }

    public void setCategorias(List<CategoriaPeso> categorias) {
        this.categorias = categorias;
    }

    public String getUrlIngresso() {
        return urlIngresso;
    }

    public void setUrlIngresso(String urlIngresso) {
        this.urlIngresso = urlIngresso;
    }

    public String getCartazUrl() {
        return cartazUrl;
    }

    public void setCartazUrl(String cartazUrl) {
        this.cartazUrl = cartazUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Evento evento = (Evento) o;
        return Objects.equals(id, evento.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Evento{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", data=" + data +
                ", local='" + local + '\'' +
                ", status=" + status +
                '}';
    }
}
