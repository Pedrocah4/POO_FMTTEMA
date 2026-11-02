package com.fmttema.api.services;

import com.fmttema.api.dto.ChaveCategoriaDTO;
import com.fmttema.api.dto.ChaveamentoResponseDTO;
import com.fmttema.api.dto.ConfrontoResponseDTO;
import com.fmttema.api.dto.LutaChaveDTO;
import com.fmttema.api.dto.RegistrarVencedorDTO;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.Confronto;
import com.fmttema.api.models.Evento;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import com.fmttema.api.repositories.ConfrontoRepository;
import com.fmttema.api.repositories.EventoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConfrontoService {

    private final ConfrontoRepository confrontoRepository;
    private final EventoRepository eventoRepository;
    private final AtletaRepository atletaRepository;
    private final CategoriaPesoRepository categoriaPesoRepository;
    private final GeradorChavesService geradorChavesService;

    public ConfrontoService(
            ConfrontoRepository confrontoRepository,
            EventoRepository eventoRepository,
            AtletaRepository atletaRepository,
            CategoriaPesoRepository categoriaPesoRepository,
            GeradorChavesService geradorChavesService
    ) {
        this.confrontoRepository = confrontoRepository;
        this.eventoRepository = eventoRepository;
        this.atletaRepository = atletaRepository;
        this.categoriaPesoRepository = categoriaPesoRepository;
        this.geradorChavesService = geradorChavesService;
    }

    /**
     * Persiste as lutas geradas pelo algoritmo de chaveamento e regra do Bye no banco de dados (US07.1).
     */
    @Transactional
    public List<ConfrontoResponseDTO> persistirChavesEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado com o ID: " + eventoId));

        // 1. Gera a chave com a regra do ranking e do Bye
        ChaveamentoResponseDTO chaveamento = geradorChavesService.gerarChavesPorEvento(eventoId);

        if (chaveamento.categorias() == null || chaveamento.categorias().isEmpty()) {
            return List.of();
        }

        // 2. Se já existem confrontos finalizados, preserva-os. Se não houver nenhum finalizado, limpa anteriores
        List<Confronto> existentes = confrontoRepository.findByEventoIdOrderByNumeroLutaAsc(eventoId);
        boolean temFinalizados = existentes.stream().anyMatch(c -> "FINALIZADA".equalsIgnoreCase(c.getStatus()));

        if (!temFinalizados && !existentes.isEmpty()) {
            confrontoRepository.deleteAll(existentes);
            confrontoRepository.flush();
        }

        List<Confronto> salvos = new ArrayList<>();

        for (ChaveCategoriaDTO catDto : chaveamento.categorias()) {
            if (catDto.lutas() == null || catDto.lutas().isEmpty()) {
                continue;
            }

            CategoriaPeso categoria = categoriaPesoRepository.findById(catDto.categoriaId())
                    .orElse(null);

            // Se a chave for de 4 lutadores (2 semifinais), cria e persiste o confronto da Grande Final
            Confronto finalConfronto = null;
            if (catDto.lutas().size() == 2 && "Semifinais".equalsIgnoreCase(catDto.lutas().get(0).fase())) {
                finalConfronto = new Confronto();
                finalConfronto.setEvento(evento);
                finalConfronto.setCategoriaPeso(categoria);
                finalConfronto.setFase("Grande Final");
                finalConfronto.setNumeroLuta(3);
                finalConfronto.setStatus("AGENDADA");

                // O corner vermelho da final pode ser o cabeça de chave do Bye se houver
                if (catDto.temBye() && catDto.atletaBye() != null) {
                    Atleta atletaBye = atletaRepository.findById(catDto.atletaBye().id()).orElse(null);
                    finalConfronto.setAtletaVermelho(atletaBye);
                }

                finalConfronto = confrontoRepository.save(finalConfronto);
                salvos.add(finalConfronto);
            }

            // Persiste cada luta gerada na fase inicial
            for (LutaChaveDTO lutaDto : catDto.lutas()) {
                // Se já existir luta com mesmo número e categoria preservada, não sobrescreve
                boolean jaExiste = existentes.stream().anyMatch(e ->
                        e.getCategoriaPeso() != null &&
                        e.getCategoriaPeso().getId().equals(catDto.categoriaId()) &&
                        e.getNumeroLuta().equals(lutaDto.numeroLuta())
                );

                if (jaExiste) {
                    continue;
                }

                Atleta vermelho = (lutaDto.cornerVermelho() != null)
                        ? atletaRepository.findById(lutaDto.cornerVermelho().id()).orElse(null)
                        : null;

                Atleta azul = (lutaDto.cornerAzul() != null)
                        ? atletaRepository.findById(lutaDto.cornerAzul().id()).orElse(null)
                        : null;

                Confronto confronto = new Confronto();
                confronto.setEvento(evento);
                confronto.setCategoriaPeso(categoria);
                confronto.setAtletaVermelho(vermelho);
                confronto.setAtletaAzul(azul);
                confronto.setFase(lutaDto.fase());
                confronto.setNumeroLuta(lutaDto.numeroLuta());
                confronto.setStatus("AGENDADA");

                if (finalConfronto != null) {
                    confronto.setProximoConfronto(finalConfronto);
                }

                salvos.add(confrontoRepository.save(confronto));
            }
        }

        return confrontoRepository.findByEventoIdComDetalhes(eventoId).stream()
                .map(ConfrontoResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Registra o vencedor da luta e o método da vitória, atualizando os cartéis em transação única (US07.1).
     * Regra 1: Uso estrito de @Transactional
     * Regra 2: Atualização atômica do cartel (+1 vitória vencedor, +1 derrota perdedor)
     * Regra 3: Avanço na chave (alocação automática no próximo confronto)
     */
    @Transactional
    public ConfrontoResponseDTO registrarVencedor(Long confrontoId, RegistrarVencedorDTO dto, String emailOperador) {
        Confronto confronto = confrontoRepository.findById(confrontoId)
                .orElseThrow(() -> new EntityNotFoundException("Confronto não encontrado com o ID: " + confrontoId));

        if ("FINALIZADA".equalsIgnoreCase(confronto.getStatus())) {
            throw new IllegalStateException("Este confronto já foi finalizado. O resultado oficial já consta na súmula.");
        }

        Atleta vencedor = atletaRepository.findById(dto.vencedorId())
                .orElseThrow(() -> new EntityNotFoundException("Atleta vencedor não encontrado com o ID: " + dto.vencedorId()));

        Long idVermelho = confronto.getAtletaVermelho() != null ? confronto.getAtletaVermelho().getId() : null;
        Long idAzul = confronto.getAtletaAzul() != null ? confronto.getAtletaAzul().getId() : null;

        // Validação: o vencedor precisa obrigatoriamente ser um dos lutadores escalados
        if (!vencedor.getId().equals(idVermelho) && !vencedor.getId().equals(idAzul)) {
            throw new IllegalArgumentException(
                    String.format("O atleta %s (ID %d) não pertence a este confronto (Lutadores: ID %d vs ID %d).",
                            vencedor.getNome(), vencedor.getId(), idVermelho, idAzul)
            );
        }

        // Identifica o perdedor
        Atleta perdedor = vencedor.getId().equals(idVermelho)
                ? confronto.getAtletaAzul()
                : confronto.getAtletaVermelho();

        // 1. Atualização do Cartel do Vencedor (+1 vitória)
        int vitoriasAtuais = vencedor.getVitorias() != null ? vencedor.getVitorias() : 0;
        vencedor.setVitorias(vitoriasAtuais + 1);
        atletaRepository.save(vencedor);

        // 2. Atualização do Cartel do Perdedor (+1 derrota)
        if (perdedor != null) {
            int derrotasAtuais = perdedor.getDerrotas() != null ? perdedor.getDerrotas() : 0;
            perdedor.setDerrotas(derrotasAtuais + 1);
            atletaRepository.save(perdedor);
        }

        // 3. Atualiza o status do Confronto
        confronto.setVencedor(vencedor);
        confronto.setMetodoVitoria(dto.metodoVitoria().trim());
        confronto.setStatus("FINALIZADA");
        confronto.setDataHoraResultado(LocalDateTime.now());

        Confronto salvo = confrontoRepository.save(confronto);

        // 4. Regra de Avanço na Árvore: Aloca o vencedor no próximo confronto (Final / Próxima Fase)
        Confronto proximo = confronto.getProximoConfronto();
        if (proximo == null && confronto.getNumeroLuta() != null && confronto.getNumeroLuta() <= 2) {
            // Busca a final da mesma categoria (Luta 3)
            List<Confronto> lutasCategoria = confrontoRepository.findByEventoIdAndCategoriaPesoIdOrderByNumeroLutaAsc(
                    confronto.getEvento().getId(),
                    confronto.getCategoriaPeso().getId()
            );
            proximo = lutasCategoria.stream()
                    .filter(c -> c.getNumeroLuta() > confronto.getNumeroLuta())
                    .findFirst()
                    .orElse(null);
        }

        if (proximo != null) {
            if (proximo.getAtletaVermelho() == null) {
                proximo.setAtletaVermelho(vencedor);
                confrontoRepository.save(proximo);
            } else if (proximo.getAtletaAzul() == null && !proximo.getAtletaVermelho().getId().equals(vencedor.getId())) {
                proximo.setAtletaAzul(vencedor);
                confrontoRepository.save(proximo);
            }
        }

        return ConfrontoResponseDTO.fromEntity(salvo);
    }

    /**
     * Lista todos os confrontos oficiais de um evento.
     */
    @Transactional(readOnly = true)
    public List<ConfrontoResponseDTO> listarConfrontosPorEvento(Long eventoId) {
        if (!eventoRepository.existsById(eventoId)) {
            throw new EntityNotFoundException("Evento não encontrado com o ID: " + eventoId);
        }
        return confrontoRepository.findByEventoIdComDetalhes(eventoId).stream()
                .map(ConfrontoResponseDTO::fromEntity)
                .toList();
    }
}
