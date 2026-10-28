package com.fmttema.api.services;

import com.fmttema.api.dto.AtletaRankingDTO;
import com.fmttema.api.dto.RankingPublicoResponseDTO;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class RankingService {

    public static final int MINIMO_LUTAS_EFICIENCIA = 3;

    private final AtletaRepository atletaRepository;
    private final CategoriaPesoRepository categoriaPesoRepository;

    public RankingService(AtletaRepository atletaRepository, CategoriaPesoRepository categoriaPesoRepository) {
        this.atletaRepository = atletaRepository;
        this.categoriaPesoRepository = categoriaPesoRepository;
    }

    /**
     * Retorna o consolidado público com os dois rankings (Volume e Eficiência)
     * processados e ordenados diretamente no banco de dados via SQL nativo.
     */
    @Transactional(readOnly = true)
    public RankingPublicoResponseDTO obterRankingsPublicos(String categoria) {
        String filtroCategoria = normalizarFiltroCategoria(categoria);

        List<AtletaRankingDTO> rankingVolume = listarRankingVolume(filtroCategoria);
        List<AtletaRankingDTO> rankingEficiencia = listarRankingEficiencia(filtroCategoria);
        List<String> categoriasDisponiveis = listarCategoriasDisponiveis();

        return new RankingPublicoResponseDTO(
                rankingVolume,
                rankingEficiencia,
                categoriasDisponiveis,
                MINIMO_LUTAS_EFICIENCIA,
                filtroCategoria != null ? filtroCategoria : "TODAS"
        );
    }

    @Transactional(readOnly = true)
    public List<AtletaRankingDTO> listarRankingVolume(String categoria) {
        String filtro = normalizarFiltroCategoria(categoria);
        List<Object[]> linhas = (filtro == null)
                ? atletaRepository.buscarRankingVolumeSql()
                : atletaRepository.buscarRankingVolumePorCategoriaSql(filtro);

        return mapearLinhasSqlParaDto(linhas);
    }

    @Transactional(readOnly = true)
    public List<AtletaRankingDTO> listarRankingEficiencia(String categoria) {
        String filtro = normalizarFiltroCategoria(categoria);
        List<Object[]> linhas = (filtro == null)
                ? atletaRepository.buscarRankingEficienciaSql()
                : atletaRepository.buscarRankingEficienciaPorCategoriaSql(filtro);

        return mapearLinhasSqlParaDto(linhas);
    }

    @Transactional(readOnly = true)
    public List<String> listarCategoriasDisponiveis() {
        Set<String> categorias = new LinkedHashSet<>();

        categoriaPesoRepository.findAll().stream()
                .map(CategoriaPeso::getNome)
                .filter(n -> n != null && !n.isBlank())
                .forEach(categorias::add);

        atletaRepository.listarCategoriasDistintasSql().stream()
                .filter(c -> c != null && !c.isBlank())
                .forEach(categorias::add);

        return new ArrayList<>(categorias);
    }

    private String normalizarFiltroCategoria(String categoria) {
        if (categoria == null || categoria.isBlank() || "TODAS".equalsIgnoreCase(categoria.trim())) {
            return null;
        }
        return categoria.trim();
    }

    private List<AtletaRankingDTO> mapearLinhasSqlParaDto(List<Object[]> linhas) {
        List<AtletaRankingDTO> resultado = new ArrayList<>(linhas.size());
        int posicao = 1;

        for (Object[] row : linhas) {
            Long atletaId = row[0] != null ? ((Number) row[0]).longValue() : null;
            String nome = row[1] != null ? row[1].toString() : "";
            String apelido = row[2] != null ? row[2].toString() : null;
            String categoria = row[3] != null ? row[3].toString() : "Sem Categoria";
            String graduacao = row[4] != null ? row[4].toString() : "Não informada";
            String academiaNome = row[5] != null ? row[5].toString() : "Independente";
            Integer vitorias = row[6] != null ? ((Number) row[6]).intValue() : 0;
            Integer derrotas = row[7] != null ? ((Number) row[7]).intValue() : 0;
            Integer empates = row[8] != null ? ((Number) row[8]).intValue() : 0;
            Integer totalLutas = row[9] != null ? ((Number) row[9]).intValue() : 0;
            Double percentualAproveitamento = row[10] != null ? ((Number) row[10]).doubleValue() : 0.0;

            resultado.add(new AtletaRankingDTO(
                    posicao++,
                    atletaId,
                    nome,
                    apelido,
                    categoria,
                    graduacao,
                    academiaNome,
                    vitorias,
                    derrotas,
                    empates,
                    totalLutas,
                    percentualAproveitamento
            ));
        }

        return resultado;
    }
}

