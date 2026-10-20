package com.fmttema.api.models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "academias")
public class Academia implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 150)
    private String responsavel;

    @Column(length = 20)
    private String telefone;

    @Column(length = 100)
    private String cidade;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    @OneToMany(mappedBy = "academia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Atleta> atletas = new ArrayList<>();

    public Academia() {
    }

    public Academia(String nome, String responsavel, String telefone, String cidade, Usuario usuario) {
        this.nome = nome;
        this.responsavel = responsavel;
        this.telefone = telefone;
        this.cidade = cidade;
        this.usuario = usuario;
    }

    public Academia(Long id, String nome, String responsavel, String telefone, String cidade, Usuario usuario) {
        this.id = id;
        this.nome = nome;
        this.responsavel = responsavel;
        this.telefone = telefone;
        this.cidade = cidade;
        this.usuario = usuario;
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

    public String getResponsavel() {
        return responsavel;
    }

    public void setResponsavel(String responsavel) {
        this.responsavel = responsavel;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public List<Atleta> getAtletas() {
        return atletas;
    }

    public void setAtletas(List<Atleta> atletas) {
        this.atletas = atletas;
    }

    public void adicionarAtleta(Atleta atleta) {
        if (atleta != null) {
            this.atletas.add(atleta);
            atleta.setAcademia(this);
        }
    }

    public void removerAtleta(Atleta atleta) {
        if (atleta != null) {
            this.atletas.remove(atleta);
            atleta.setAcademia(null);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Academia academia = (Academia) o;
        return Objects.equals(id, academia.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Academia{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", responsavel='" + responsavel + '\'' +
                ", cidade='" + cidade + '\'' +
                '}';
    }
}
