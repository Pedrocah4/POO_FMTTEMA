package com.fmttema.api.repositories;

import com.fmttema.api.models.Evento;
import com.fmttema.api.models.StatusEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByStatus(StatusEvento status);
    List<Evento> findByNomeContainingIgnoreCase(String nome);

    Long countByStatus(StatusEvento status);

    @Query("SELECT COUNT(e) FROM Evento e WHERE e.status = 'AGENDADO' OR e.status = 'EM_ANDAMENTO'")
    Long countEventosAtivos();

    /**
     * US13: Retorna apenas eventos com datas futuras (ou data atual) ou status EM_ANDAMENTO,
     * excluindo eventos finalizados ou eventos agendados cujas datas já passaram.
     */
    @Query("""
            SELECT DISTINCT e FROM Evento e
            LEFT JOIN FETCH e.categorias
            WHERE e.status <> com.fmttema.api.models.StatusEvento.FINALIZADO
              AND (e.data >= :dataReferencia OR e.status = com.fmttema.api.models.StatusEvento.EM_ANDAMENTO)
            ORDER BY e.data ASC, e.id ASC
            """)
    List<Evento> buscarEventosPublicosAtivos(@Param("dataReferencia") LocalDate dataReferencia);
}
