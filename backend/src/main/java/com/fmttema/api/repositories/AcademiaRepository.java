package com.fmttema.api.repositories;

import com.fmttema.api.models.Academia;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademiaRepository extends JpaRepository<Academia, Long> {
    Optional<Academia> findByNome(String nome);
    Optional<Academia> findByCnpj(String cnpj);
    boolean existsByCnpj(String cnpj);
    Optional<Academia> findByUsuarioId(Long usuarioId);

    @Query("SELECT COUNT(ac) FROM Academia ac WHERE ac.usuario.status = :status")
    Long countByUsuarioStatus(@Param("status") StatusUsuario status);

    @Query("SELECT COUNT(ac) FROM Academia ac WHERE ac.statusPagamento = :status")
    Long countByStatusPagamento(@Param("status") StatusPagamento status);
}
