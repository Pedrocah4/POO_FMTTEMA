package com.fmttema.api.repositories;

import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByNumeroLicenca(String numeroLicenca);

    List<Usuario> findByStatus(StatusUsuario status);

    List<Usuario> findByStatusIn(List<StatusUsuario> statuses);

    Long countByPerfil(com.fmttema.api.models.PerfilAcesso perfil);

    Long countByStatus(StatusUsuario status);

    Long countByPerfilAndStatus(com.fmttema.api.models.PerfilAcesso perfil, StatusUsuario status);
}
