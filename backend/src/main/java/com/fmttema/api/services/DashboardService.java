package com.fmttema.api.services;

import com.fmttema.api.dto.DashboardResumoDTO;
import com.fmttema.api.dto.ItemAgregacaoDTO;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.FluxoCaixaRepository;
import com.fmttema.api.repositories.InscricaoRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final FluxoCaixaRepository fluxoCaixaRepository;
    private final AtletaRepository atletaRepository;
    private final AcademiaRepository academiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoRepository eventoRepository;
    private final InscricaoRepository inscricaoRepository;

    public DashboardService(
            FluxoCaixaRepository fluxoCaixaRepository,
            AtletaRepository atletaRepository,
            AcademiaRepository academiaRepository,
            UsuarioRepository usuarioRepository,
            EventoRepository eventoRepository,
            InscricaoRepository inscricaoRepository
    ) {
        this.fluxoCaixaRepository = fluxoCaixaRepository;
        this.atletaRepository = atletaRepository;
        this.academiaRepository = academiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
        this.inscricaoRepository = inscricaoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResumoDTO obterResumoGeral() {
        // Financeiro agregado diretamente pelo banco
        Double receitaTotal = fluxoCaixaRepository.somarTotalEntradas();
        Double totalDespesas = fluxoCaixaRepository.somarTotalSaidas();
        Double saldoLiquido = receitaTotal - totalDespesas;
        Double receitaAnuidadesAtletas = fluxoCaixaRepository.somarEntradasAtletas();
        Double receitaAnuidadesAcademias = fluxoCaixaRepository.somarEntradasAcademias();

        // Atletas
        Long totalAtletas = atletaRepository.count();
        Long atletasAtivos = atletaRepository.countByUsuarioStatus(StatusUsuario.ATIVO);
        Long atletasPendentes = atletaRepository.countByUsuarioStatus(StatusUsuario.PENDENTE_APROVACAO);
        Long atletasAdimplentes = atletaRepository.countByStatusPagamento(StatusPagamento.PAGO);
        Long atletasInadimplentes = atletaRepository.countByStatusPagamento(StatusPagamento.PENDENTE);

        // Academias
        Long totalAcademias = academiaRepository.count();
        Long academiasAtivas = academiaRepository.countByUsuarioStatus(StatusUsuario.ATIVO);
        Long academiasAdimplentes = academiaRepository.countByStatusPagamento(StatusPagamento.PAGO);
        Long academiasInadimplentes = academiaRepository.countByStatusPagamento(StatusPagamento.PENDENTE);

        // Usuários / Arbitros
        Long totalArbitros = usuarioRepository.countByPerfil(PerfilAcesso.ARBITRO);

        // Eventos e Inscrições
        Long totalEventos = eventoRepository.count();
        Long eventosAtivos = eventoRepository.countEventosAtivos();
        Long totalInscricoes = inscricaoRepository.count();

        // Taxa de Adimplência consolidada (Atletas)
        long totalConsiderado = (atletasAdimplentes != null ? atletasAdimplentes : 0L)
                + (atletasInadimplentes != null ? atletasInadimplentes : 0L);
        Double taxaAdimplencia = 100.0;
        if (totalConsiderado > 0) {
            taxaAdimplencia = Math.round(((double) (atletasAdimplentes != null ? atletasAdimplentes : 0L) / totalConsiderado) * 1000.0) / 10.0;
        }

        // Distribuições agregadas por GROUP BY no SQL
        List<ItemAgregacaoDTO> distribuicaoGraduacao = atletaRepository.contarPorGraduacao().stream()
                .map(row -> new ItemAgregacaoDTO(String.valueOf(row[0]), ((Number) row[1]).longValue()))
                .toList();

        List<ItemAgregacaoDTO> distribuicaoCategoria = atletaRepository.contarPorCategoria().stream()
                .map(row -> new ItemAgregacaoDTO(String.valueOf(row[0]), ((Number) row[1]).longValue()))
                .toList();

        return new DashboardResumoDTO(
                receitaTotal,
                totalDespesas,
                saldoLiquido,
                receitaAnuidadesAtletas,
                receitaAnuidadesAcademias,
                totalAtletas,
                atletasAtivos,
                atletasPendentes,
                atletasAdimplentes,
                atletasInadimplentes,
                totalAcademias,
                academiasAtivas,
                academiasAdimplentes,
                academiasInadimplentes,
                totalArbitros,
                totalEventos,
                eventosAtivos,
                totalInscricoes,
                taxaAdimplencia,
                distribuicaoGraduacao,
                distribuicaoCategoria
        );
    }
}
