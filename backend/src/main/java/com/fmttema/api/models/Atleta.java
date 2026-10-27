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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "atletas")
public class Atleta implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 100)
    private String apelido;

    @Column(length = 14, unique = true)
    private String cpf;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "peso")
    private Double peso;

    @Column(length = 50)
    private String categoria;

    @Column(length = 50)
    private String graduacao; // Prajied no Muaythai (ex: Branco, Branco Ponta Vermelha, etc.)

    @Column(length = 50)
    private String kruang;

    @Column(name = "vitorias")
    private Integer vitorias = 0;

    @Column(name = "derrotas")
    private Integer derrotas = 0;

    @Column(name = "empates")
    private Integer empates = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", length = 30)
    private StatusPagamento statusPagamento = StatusPagamento.PENDENTE;

    @Column(name = "comprovante_pagamento", length = 500)
    private String comprovantePagamento;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academia_id")
    private Academia academia;

    public Atleta() {
    }

    public Atleta(String nome, String apelido, String cpf, LocalDate dataNascimento, Double peso, String graduacao, Usuario usuario, Academia academia) {
        this.nome = nome;
        this.apelido = apelido;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.peso = peso;
        this.graduacao = graduacao;
        this.usuario = usuario;
        this.academia = academia;
    }

    public Atleta(Long id, String nome, String apelido, String cpf, LocalDate dataNascimento, Double peso, String graduacao, Usuario usuario, Academia academia) {
        this.id = id;
        this.nome = nome;
        this.apelido = apelido;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.peso = peso;
        this.graduacao = graduacao;
        this.usuario = usuario;
        this.academia = academia;
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

    public String getApelido() {
        return apelido;
    }

    public void setApelido(String apelido) {
        this.apelido = apelido;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getGraduacao() {
        return graduacao != null ? graduacao : kruang;
    }

    public void setGraduacao(String graduacao) {
        this.graduacao = graduacao;
        if (this.kruang == null) {
            this.kruang = graduacao;
        }
    }

    public String getKruang() {
        return kruang != null ? kruang : graduacao;
    }

    public void setKruang(String kruang) {
        this.kruang = kruang;
        this.graduacao = kruang;
    }

    public Integer getVitorias() {
        return vitorias != null ? vitorias : 0;
    }

    public void setVitorias(Integer vitorias) {
        this.vitorias = vitorias;
    }

    public Integer getDerrotas() {
        return derrotas != null ? derrotas : 0;
    }

    public void setDerrotas(Integer derrotas) {
        this.derrotas = derrotas;
    }

    public Integer getEmpates() {
        return empates != null ? empates : 0;
    }

    public void setEmpates(Integer empates) {
        this.empates = empates;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Academia getAcademia() {
        return academia;
    }

    public void setAcademia(Academia academia) {
        this.academia = academia;
    }

    public StatusPagamento getStatusPagamento() {
        return statusPagamento;
    }

    public void setStatusPagamento(StatusPagamento statusPagamento) {
        this.statusPagamento = statusPagamento;
    }

    public String getComprovantePagamento() {
        return comprovantePagamento;
    }

    public void setComprovantePagamento(String comprovantePagamento) {
        this.comprovantePagamento = comprovantePagamento;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Atleta atleta = (Atleta) o;
        return Objects.equals(id, atleta.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Atleta{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", apelido='" + apelido + '\'' +
                ", peso=" + peso +
                ", graduacao='" + graduacao + '\'' +
                '}';
    }
}
