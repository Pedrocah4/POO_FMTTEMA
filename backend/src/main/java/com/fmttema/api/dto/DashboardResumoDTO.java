package com.fmttema.api.dto;

import java.util.List;

public record DashboardResumoDTO(
        Double receitaTotal,
        Double totalDespesas,
        Double saldoLiquido,
        Double receitaAnuidadesAtletas,
        Double receitaAnuidadesAcademias,
        Long totalAtletas,
        Long atletasAtivos,
        Long atletasPendentes,
        Long atletasAdimplentes,
        Long atletasInadimplentes,
        Long totalAcademias,
        Long academiasAtivas,
        Long academiasAdimplentes,
        Long academiasInadimplentes,
        Long totalArbitros,
        Long totalEventos,
        Long eventosAtivos,
        Long totalInscricoes,
        Double taxaAdimplencia,
        List<ItemAgregacaoDTO> distribuicaoGraduacao,
        List<ItemAgregacaoDTO> distribuicaoCategoria
) {}
