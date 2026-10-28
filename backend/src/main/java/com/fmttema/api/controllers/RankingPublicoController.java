package com.fmttema.api.controllers;

import com.fmttema.api.dto.AtletaRankingDTO;
import com.fmttema.api.dto.RankingPublicoResponseDTO;
import com.fmttema.api.services.RankingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/publico/ranking")
public class RankingPublicoController {

    private final RankingService rankingService;

    public RankingPublicoController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    /**
     * Endpoint 100% público (US12): Retorna o JSON consolidado contendo as duas listas ordenadas no SQL:
     * - rankingVolume (ordenado por total absoluto de vitórias)
     * - rankingEficiencia (fórmula matemática de percentual no SQL, mínimo de 3 lutas)
     *
     * GET /api/publico/ranking?categoria=Peso-Pesado
     */
    @GetMapping
    public ResponseEntity<RankingPublicoResponseDTO> obterRankingPublico(
            @RequestParam(required = false) String categoria
    ) {
        return ResponseEntity.ok(rankingService.obterRankingsPublicos(categoria));
    }

    /**
     * Endpoint público auxiliar: Retorna apenas o Ranking de Volume (Vitórias).
     * GET /api/publico/ranking/volume
     */
    @GetMapping("/volume")
    public ResponseEntity<List<AtletaRankingDTO>> obterRankingVolume(
            @RequestParam(required = false) String categoria
    ) {
        return ResponseEntity.ok(rankingService.listarRankingVolume(categoria));
    }

    /**
     * Endpoint público auxiliar: Retorna apenas o Ranking de Eficiência (Aproveitamento %, mín. 3 lutas).
     * GET /api/publico/ranking/eficiencia
     */
    @GetMapping("/eficiencia")
    public ResponseEntity<List<AtletaRankingDTO>> obterRankingEficiencia(
            @RequestParam(required = false) String categoria
    ) {
        return ResponseEntity.ok(rankingService.listarRankingEficiencia(categoria));
    }
}

