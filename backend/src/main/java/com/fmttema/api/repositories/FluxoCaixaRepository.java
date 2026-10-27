package com.fmttema.api.repositories;

import com.fmttema.api.models.FluxoCaixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FluxoCaixaRepository extends JpaRepository<FluxoCaixa, Long> {

    List<FluxoCaixa> findAllByOrderByDataHoraDesc();

    List<FluxoCaixa> findByAtletaId(Long atletaId);

    List<FluxoCaixa> findByAcademiaId(Long academiaId);

    @Query("SELECT COALESCE(SUM(f.valor), 0.0) FROM FluxoCaixa f WHERE f.tipo = 'ENTRADA'")
    Double somarTotalEntradas();

    @Query("SELECT COALESCE(SUM(f.valor), 0.0) FROM FluxoCaixa f WHERE f.tipo = 'SAIDA'")
    Double somarTotalSaidas();
}
