package com.fmttema.api.services;

import com.fmttema.api.dto.AnuidadeDTO;
import com.fmttema.api.dto.BaixaAnuidadeRequestDTO;
import com.fmttema.api.dto.BaixaAnuidadeResponseDTO;
import com.fmttema.api.dto.FluxoCaixaResponseDTO;
import com.fmttema.api.models.Academia;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.FluxoCaixa;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.TipoTransacao;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.FluxoCaixaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FinanceiroService {

    private final AtletaRepository atletaRepository;
    private final AcademiaRepository academiaRepository;
    private final FluxoCaixaRepository fluxoCaixaRepository;

    public FinanceiroService(
            AtletaRepository atletaRepository,
            AcademiaRepository academiaRepository,
            FluxoCaixaRepository fluxoCaixaRepository
    ) {
        this.atletaRepository = atletaRepository;
        this.academiaRepository = academiaRepository;
        this.fluxoCaixaRepository = fluxoCaixaRepository;
    }

    /**
     * Realiza a baixa manual da anuidade com registro obrigatório de comprovante e lançamento em fluxo de caixa.
     * Convenção obrigatória: Uso estrito de @Transactional para garantir atomicidade ACID.
     */
    @Transactional
    public BaixaAnuidadeResponseDTO realizarBaixaManual(Long id, BaixaAnuidadeRequestDTO dto, String adminEmail) {
        String tipo = dto.tipoBeneficiario() != null ? dto.tipoBeneficiario().trim().toUpperCase() : null;

        if ("ACADEMIA".equals(tipo)) {
            Academia academia = academiaRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Academia não encontrada para o ID: " + id));
            return processarBaixaAcademia(academia, dto, adminEmail);
        }

        if ("ATLETA".equals(tipo)) {
            Atleta atleta = atletaRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado para o ID: " + id));
            return processarBaixaAtleta(atleta, dto, adminEmail);
        }

        // Se tipo não foi especificado explicitamente, verifica Atleta e depois Academia
        Optional<Atleta> atletaOpt = atletaRepository.findById(id);
        if (atletaOpt.isPresent()) {
            return processarBaixaAtleta(atletaOpt.get(), dto, adminEmail);
        }

        Optional<Academia> academiaOpt = academiaRepository.findById(id);
        if (academiaOpt.isPresent()) {
            return processarBaixaAcademia(academiaOpt.get(), dto, adminEmail);
        }

        throw new EntityNotFoundException("Nenhum atleta ou academia encontrado com o ID: " + id);
    }

    private BaixaAnuidadeResponseDTO processarBaixaAtleta(Atleta atleta, BaixaAnuidadeRequestDTO dto, String adminEmail) {
        // 1. Atualiza status e comprovante no Atleta
        atleta.setStatusPagamento(StatusPagamento.PAGO);
        atleta.setComprovantePagamento(dto.comprovante().trim());
        atletaRepository.save(atleta);

        // 2. Registra o lançamento atômico no Fluxo de Caixa
        Double valorFinal = (dto.valor() != null && dto.valor() > 0) ? dto.valor() : 150.00;
        String autor = (adminEmail != null && !adminEmail.isBlank()) ? adminEmail : "admin@fmttema.com";

        FluxoCaixa lancamento = new FluxoCaixa(
                TipoTransacao.ENTRADA,
                "Baixa Manual de Anuidade - Atleta: " + atleta.getNome(),
                valorFinal,
                dto.comprovante().trim(),
                atleta,
                null,
                autor
        );
        lancamento.setObservacoes(dto.observacoes());
        FluxoCaixa lancamentoSalvo = fluxoCaixaRepository.save(lancamento);

        return new BaixaAnuidadeResponseDTO(
                atleta.getId(),
                atleta.getNome(),
                "ATLETA",
                atleta.getStatusPagamento(),
                atleta.getComprovantePagamento(),
                lancamentoSalvo.getValor(),
                lancamentoSalvo.getDataHora(),
                lancamentoSalvo.getId(),
                "Anuidade do atleta baixada com sucesso e lançamento registrado no Fluxo de Caixa."
        );
    }

    private BaixaAnuidadeResponseDTO processarBaixaAcademia(Academia academia, BaixaAnuidadeRequestDTO dto, String adminEmail) {
        // 1. Atualiza status e comprovante na Academia
        academia.setStatusPagamento(StatusPagamento.PAGO);
        academia.setComprovantePagamento(dto.comprovante().trim());
        academiaRepository.save(academia);

        // 2. Registra o lançamento atômico no Fluxo de Caixa
        Double valorFinal = (dto.valor() != null && dto.valor() > 0) ? dto.valor() : 300.00;
        String autor = (adminEmail != null && !adminEmail.isBlank()) ? adminEmail : "admin@fmttema.com";

        FluxoCaixa lancamento = new FluxoCaixa(
                TipoTransacao.ENTRADA,
                "Baixa Manual de Anuidade - Academia: " + academia.getNome(),
                valorFinal,
                dto.comprovante().trim(),
                null,
                academia,
                autor
        );
        lancamento.setObservacoes(dto.observacoes());
        FluxoCaixa lancamentoSalvo = fluxoCaixaRepository.save(lancamento);

        return new BaixaAnuidadeResponseDTO(
                academia.getId(),
                academia.getNome(),
                "ACADEMIA",
                academia.getStatusPagamento(),
                academia.getComprovantePagamento(),
                lancamentoSalvo.getValor(),
                lancamentoSalvo.getDataHora(),
                lancamentoSalvo.getId(),
                "Anuidade da academia baixada com sucesso e lançamento registrado no Fluxo de Caixa."
        );
    }

    /**
     * Lista todas as anuidades cadastradas (atletas e academias) com status de adimplência.
     */
    @Transactional(readOnly = true)
    public List<AnuidadeDTO> listarTodasAnuidades() {
        List<AnuidadeDTO> lista = new ArrayList<>();

        for (Atleta a : atletaRepository.findAll()) {
            String email = (a.getUsuario() != null) ? a.getUsuario().getEmail() : null;
            String acadNome = (a.getAcademia() != null) ? a.getAcademia().getNome() : "Sem vínculo";
            lista.add(new AnuidadeDTO(
                    a.getId(),
                    "ATLETA",
                    a.getNome(),
                    a.getCpf(),
                    email,
                    a.getStatusPagamento(),
                    a.getComprovantePagamento(),
                    acadNome
            ));
        }

        for (Academia ac : academiaRepository.findAll()) {
            String email = (ac.getUsuario() != null) ? ac.getUsuario().getEmail() : null;
            lista.add(new AnuidadeDTO(
                    ac.getId(),
                    "ACADEMIA",
                    ac.getNome(),
                    ac.getCidade() + " / " + ac.getTelefone(),
                    email,
                    ac.getStatusPagamento(),
                    ac.getComprovantePagamento(),
                    ac.getResponsavel()
            ));
        }

        return lista;
    }

    /**
     * Lista o histórico do fluxo de caixa ordenado do mais recente para o mais antigo.
     */
    @Transactional(readOnly = true)
    public List<FluxoCaixaResponseDTO> listarFluxoCaixa() {
        return fluxoCaixaRepository.findAllByOrderByDataHoraDesc()
                .stream()
                .map(FluxoCaixaResponseDTO::fromEntity)
                .toList();
    }
}
