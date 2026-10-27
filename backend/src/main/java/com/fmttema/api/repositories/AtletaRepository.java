package com.fmttema.api.repositories;

import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtletaRepository extends JpaRepository<Atleta, Long> {
    List<Atleta> findByAcademiaId(Long academiaId);
    Optional<Atleta> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
    Optional<Atleta> findByUsuarioId(Long usuarioId);
    Optional<Atleta> findByUsuarioEmail(String email);

    @Query("SELECT COUNT(a) FROM Atleta a WHERE a.usuario.status = :status")
    Long countByUsuarioStatus(@Param("status") StatusUsuario status);

    @Query("SELECT COUNT(a) FROM Atleta a WHERE a.statusPagamento = :status")
    Long countByStatusPagamento(@Param("status") StatusPagamento status);

    @Query("SELECT COALESCE(a.graduacao, 'Não informada'), COUNT(a) FROM Atleta a GROUP BY a.graduacao ORDER BY COUNT(a) DESC")
    java.util.List<Object[]> contarPorGraduacao();

    @Query("SELECT COALESCE(a.categoria, 'Não informada'), COUNT(a) FROM Atleta a GROUP BY a.categoria ORDER BY COUNT(a) DESC")
    java.util.List<Object[]> contarPorCategoria();
}
