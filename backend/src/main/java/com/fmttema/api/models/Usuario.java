package com.fmttema.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PerfilAcesso perfil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusUsuario status = StatusUsuario.PENDENTE_APROVACAO;

    @Column(name = "nome", length = 150)
    private String nome;

    @Column(name = "numero_licenca", unique = true, length = 60)
    private String numeroLicenca;

    @Column(name = "data_validade_licenca")
    private LocalDate dataValidadeLicenca;

    @Column(name = "nivel_arbitragem", length = 40)
    private String nivelArbitragem;

    public Usuario() {
    }

    public Usuario(String email, String senha, PerfilAcesso perfil) {
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
        this.status = StatusUsuario.PENDENTE_APROVACAO;
    }

    public Usuario(String email, String senha, PerfilAcesso perfil, StatusUsuario status) {
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
        this.status = status != null ? status : StatusUsuario.PENDENTE_APROVACAO;
    }

    public Usuario(Long id, String email, String senha, PerfilAcesso perfil) {
        this.id = id;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
        this.status = StatusUsuario.PENDENTE_APROVACAO;
    }

    public Usuario(Long id, String email, String senha, PerfilAcesso perfil, StatusUsuario status) {
        this.id = id;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
        this.status = status != null ? status : StatusUsuario.PENDENTE_APROVACAO;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public PerfilAcesso getPerfil() {
        return perfil;
    }

    public void setPerfil(PerfilAcesso perfil) {
        this.perfil = perfil;
    }

    public StatusUsuario getStatus() {
        return status;
    }

    public void setStatus(StatusUsuario status) {
        this.status = status;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNumeroLicenca() {
        return numeroLicenca;
    }

    public void setNumeroLicenca(String numeroLicenca) {
        this.numeroLicenca = numeroLicenca;
    }

    public LocalDate getDataValidadeLicenca() {
        return dataValidadeLicenca;
    }

    public void setDataValidadeLicenca(LocalDate dataValidadeLicenca) {
        this.dataValidadeLicenca = dataValidadeLicenca;
    }

    public String getNivelArbitragem() {
        return nivelArbitragem;
    }

    public void setNivelArbitragem(String nivelArbitragem) {
        this.nivelArbitragem = nivelArbitragem;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.perfil == null) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.perfil.name()));
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario = (Usuario) o;
        return Objects.equals(id, usuario.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", perfil=" + perfil +
                '}';
    }
}
