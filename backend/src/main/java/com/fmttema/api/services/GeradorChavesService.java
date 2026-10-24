package com.fmttema.api.services;

import com.fmttema.api.dto.AtletaChaveDTO;
import com.fmttema.api.dto.ChaveCategoriaDTO;
import com.fmttema.api.dto.ChaveamentoResponseDTO;
import com.fmttema.api.dto.LutaChaveDTO;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.Inscricao;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.InscricaoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeradorChavesService {

    private final EventoRepository eventoRepository;
    private final InscricaoRepository inscricaoRepository;

    public GeradorChavesService(EventoRepository eventoRepository, InscricaoRepository inscricaoRepository) {
        this.eventoRepository = eventoRepository;
        this.inscricaoRepository = inscricaoRepository;
    }

    /**
     * Gera o chaveamento completo de todas as categorias do torneio com cruzamento ranqueado e regra do Bye.
     */
    @Transactional(readOnly = true)
    public ChaveamentoResponseDTO gerarChavesPorEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado com o ID: " + eventoId));

        // Consulta obrigatória ordenada pelo ranking: ORDER BY a.vitorias DESC, a.id ASC
        List<Inscricao> todasInscricoes = inscricaoRepository.findByEventoIdOrderByAtletaVitoriasDesc(eventoId);

        if (todasInscricoes.isEmpty()) {
            return new ChaveamentoResponseDTO(
                    evento.getId(),
                    evento.getNome(),
                    evento.getData(),
                    evento.getLocal(),
                    0,
                    Collections.emptyList()
            );
        }

        // Agrupa as inscrições por categoria de peso preservando a ordem do ranking (ORDER BY vitorias DESC)
        Map<CategoriaPeso, List<Atleta>> atletasPorCategoria = new LinkedHashMap<>();
        for (Inscricao inscricao : todasInscricoes) {
            CategoriaPeso categoria = inscricao.getCategoriaPeso();
            atletasPorCategoria.computeIfAbsent(categoria, k -> new ArrayList<>()).add(inscricao.getAtleta());
        }

        List<ChaveCategoriaDTO> chavesCategorias = new ArrayList<>();
        for (Map.Entry<CategoriaPeso, List<Atleta>> entry : atletasPorCategoria.entrySet()) {
            CategoriaPeso categoria = entry.getKey();
            List<Atleta> atletasOrdenados = entry.getValue();

            ChaveCategoriaDTO chave = construirChaveCategoria(categoria, atletasOrdenados);
            chavesCategorias.add(chave);
        }

        return new ChaveamentoResponseDTO(
                evento.getId(),
                evento.getNome(),
                evento.getData(),
                evento.getLocal(),
                chavesCategorias.size(),
                chavesCategorias
        );
    }

    /**
     * Constrói a chave para uma categoria específica aplicando o algoritmo de cruzamento e a regra do Bye.
     */
    public ChaveCategoriaDTO construirChaveCategoria(CategoriaPeso categoria, List<Atleta> atletasRanqueados) {
        int total = atletasRanqueados.size();
        Long categoriaId = categoria != null ? categoria.getId() : null;
        String categoriaNome = categoria != null ? categoria.getNome() : "Categoria Geral";
        Double pesoMaximo = categoria != null ? categoria.getPesoMaximo() : null;

        if (total < 2) {
            Atleta unico = total == 1 ? atletasRanqueados.get(0) : null;
            return new ChaveCategoriaDTO(
                    categoriaId,
                    categoriaNome,
                    pesoMaximo,
                    total,
                    "Chave com Inscrição Única",
                    total == 1,
                    AtletaChaveDTO.fromEntity(unico),
                    total == 1 ? "Atleta sem oponentes na categoria (Avança por W.O.)." : "Nenhum atleta inscrito nesta categoria.",
                    Collections.emptyList()
            );
        }

        boolean temBye = (total % 2 != 0);
        Atleta atletaComBye = null;
        String mensagemBye = null;
        List<Atleta> atletasParaLuta = new ArrayList<>(atletasRanqueados);

        // REGRA DO BYE OBRIGATÓRIA:
        // O atleta com mais pontos (índice 0 após ORDER BY vitorias DESC) deve obrigatoriamente
        // receber o "Bye" e avançar direto para a próxima fase.
        if (temBye) {
            atletaComBye = atletasParaLuta.remove(0);
            mensagemBye = String.format(
                    "O atleta %s (%d vitórias) é o cabeça de chave número 1 e recebe o BYE, avançando direto para a próxima fase.",
                    atletaComBye.getNome(),
                    atletaComBye.getVitorias() != null ? atletaComBye.getVitorias() : 0
            );
        }

        int m = atletasParaLuta.size();
        String tipoChave = definirTipoChave(total, temBye);
        String faseRodada = definirFaseRodada(m, temBye);

        // Algoritmo de Cruzamento em Chaves (Torneio Eliminatório Clássico):
        List<LutaChaveDTO> lutas = cruzarAtletas(atletasParaLuta, faseRodada);

        return new ChaveCategoriaDTO(
                categoriaId,
                categoriaNome,
                pesoMaximo,
                total,
                tipoChave,
                temBye,
                AtletaChaveDTO.fromEntity(atletaComBye),
                mensagemBye,
                lutas
        );
    }

    /**
     * Algoritmo de cruzamento em chaves (Chaves de 4, 8, 16 ou emparelhamento olímpico de extremos).
     */
    private List<LutaChaveDTO> cruzarAtletas(List<Atleta> atletas, String fase) {
        int m = atletas.size();
        List<LutaChaveDTO> lutas = new ArrayList<>();
        int numeroLuta = 1;

        if (m == 4) {
            // Chave clássica de 4: 1v4 e 2v3
            lutas.add(new LutaChaveDTO(numeroLuta++, fase, AtletaChaveDTO.fromEntity(atletas.get(0)), AtletaChaveDTO.fromEntity(atletas.get(3)), "AGENDADA"));
            lutas.add(new LutaChaveDTO(numeroLuta++, fase, AtletaChaveDTO.fromEntity(atletas.get(1)), AtletaChaveDTO.fromEntity(atletas.get(2)), "AGENDADA"));
            return lutas;
        }

        if (m == 8) {
            // Chave clássica de 8 (Quartas de Final):
            // Lado A: 1v8, 4v5 | Lado B: 2v7, 3v6
            lutas.add(new LutaChaveDTO(numeroLuta++, fase, AtletaChaveDTO.fromEntity(atletas.get(0)), AtletaChaveDTO.fromEntity(atletas.get(7)), "AGENDADA"));
            lutas.add(new LutaChaveDTO(numeroLuta++, fase, AtletaChaveDTO.fromEntity(atletas.get(3)), AtletaChaveDTO.fromEntity(atletas.get(4)), "AGENDADA"));
            lutas.add(new LutaChaveDTO(numeroLuta++, fase, AtletaChaveDTO.fromEntity(atletas.get(1)), AtletaChaveDTO.fromEntity(atletas.get(6)), "AGENDADA"));
            lutas.add(new LutaChaveDTO(numeroLuta++, fase, AtletaChaveDTO.fromEntity(atletas.get(2)), AtletaChaveDTO.fromEntity(atletas.get(5)), "AGENDADA"));
            return lutas;
        }

        if (m == 16) {
            // Chave clássica de 16 (Oitavas de Final)
            int[][] pares = {
                    {0, 15}, {7, 8}, {3, 12}, {4, 11},
                    {1, 14}, {6, 9}, {2, 13}, {5, 10}
            };
            for (int[] par : pares) {
                lutas.add(new LutaChaveDTO(
                        numeroLuta++,
                        fase,
                        AtletaChaveDTO.fromEntity(atletas.get(par[0])),
                        AtletaChaveDTO.fromEntity(atletas.get(par[1])),
                        "AGENDADA"
                ));
            }
            return lutas;
        }

        // Cruzamento simétrico para qualquer quantidade par M (1 vs M, 2 vs M-1, etc.):
        for (int i = 0; i < m / 2; i++) {
            Atleta vermelho = atletas.get(i);
            Atleta azul = atletas.get(m - 1 - i);
            lutas.add(new LutaChaveDTO(
                    numeroLuta++,
                    fase,
                    AtletaChaveDTO.fromEntity(vermelho),
                    AtletaChaveDTO.fromEntity(azul),
                    "AGENDADA"
            ));
        }

        return lutas;
    }

    private String definirTipoChave(int total, boolean temBye) {
        if (temBye) {
            return String.format("Chave de %d Lutadores (Com Regra do Bye)", total);
        }
        if (total == 4) return "Chave de 4 Lutadores (Semifinais)";
        if (total == 8) return "Chave de 8 Lutadores (Quartas de Final)";
        if (total == 16) return "Chave de 16 Lutadores (Oitavas de Final)";
        return String.format("Chave de %d Lutadores", total);
    }

    private String definirFaseRodada(int lutadoresNaRodada, boolean temBye) {
        if (lutadoresNaRodada == 2) {
            return temBye ? "Semifinal Eliminatória" : "Final";
        }
        if (lutadoresNaRodada == 4) return "Semifinais";
        if (lutadoresNaRodada == 8) return "Quartas de Final";
        if (lutadoresNaRodada == 16) return "Oitavas de Final";
        return "Primeira Rodada Eliminatória";
    }
}
