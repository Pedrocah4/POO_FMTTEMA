package com.fmttema.api.repositories;

import com.fmttema.api.models.Confronto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConfrontoRepository extends JpaRepository<Confronto, Long> {

    @Query("SELECT c FROM Confronto c " +
           "JOIN FETCH c.categoriaPeso " +
           "LEFT JOIN FETCH c.atletaVermelho " +
           "LEFT JOIN FETCH c.atletaAzul " +
           "LEFT JOIN FETCH c.vencedor " +
           "WHERE c.evento.id = :eventoId " +
           "ORDER BY c.numeroLuta ASC")
    List<Confronto> findByEventoIdComDetalhes(@Param("eventoId") Long eventoId);

    List<Confronto> findByEventoIdOrderByNumeroLutaAsc(Long eventoId);

    List<Confronto> findByEventoIdAndCategoriaPesoIdOrderByNumeroLutaAsc(Long eventoId, Long categoriaPesoId);

    boolean existsByEventoId(Long eventoId);

    void deleteByEventoId(Long eventoId);
}
