package com.fmttema.api.repositories;

import com.fmttema.api.models.Inscricao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscricaoRepository extends JpaRepository<Inscricao, Long> {
    boolean existsByAtletaIdAndEventoId(Long atletaId, Long eventoId);
    Optional<Inscricao> findByAtletaIdAndEventoId(Long atletaId, Long eventoId);
    List<Inscricao> findByEventoId(Long eventoId);
    List<Inscricao> findByAtletaId(Long atletaId);

    /**
     * Consulta as inscrições do evento ordenando pelo ranking de vitórias do atleta (ORDER BY vitorias DESC)
     */
    @Query("SELECT i FROM Inscricao i JOIN FETCH i.atleta a LEFT JOIN FETCH i.categoriaPeso c WHERE i.evento.id = :eventoId ORDER BY a.vitorias DESC, a.id ASC")
    List<Inscricao> findByEventoIdOrderByAtletaVitoriasDesc(@Param("eventoId") Long eventoId);

    /**
     * Consulta as inscrições de uma categoria específica ordenando pelo ranking de vitórias do atleta
     */
    @Query("SELECT i FROM Inscricao i JOIN FETCH i.atleta a LEFT JOIN FETCH i.categoriaPeso c WHERE i.evento.id = :eventoId AND i.categoriaPeso.id = :categoriaId ORDER BY a.vitorias DESC, a.id ASC")
    List<Inscricao> findByEventoIdAndCategoriaPesoIdOrderByAtletaVitoriasDesc(
            @Param("eventoId") Long eventoId,
            @Param("categoriaId") Long categoriaId
    );
}
