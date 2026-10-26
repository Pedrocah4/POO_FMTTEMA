package com.fmttema.api.repositories;

import com.fmttema.api.models.EscalaArbitro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EscalaArbitroRepository extends JpaRepository<EscalaArbitro, Long> {

    @Query("SELECT e FROM EscalaArbitro e JOIN FETCH e.evento ev JOIN FETCH e.arbitro a WHERE a.id = :arbitroId ORDER BY ev.data ASC")
    List<EscalaArbitro> findByArbitroIdComEvento(@Param("arbitroId") Long arbitroId);

    @Query("SELECT e FROM EscalaArbitro e JOIN FETCH e.evento ev JOIN FETCH e.arbitro a WHERE ev.id = :eventoId ORDER BY a.email ASC")
    List<EscalaArbitro> findByEventoIdComArbitro(@Param("eventoId") Long eventoId);

    Optional<EscalaArbitro> findByIdAndArbitroId(Long id, Long arbitroId);

    boolean existsByArbitroIdAndEventoId(Long arbitroId, Long eventoId);
}
