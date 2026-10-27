package com.fmttema.api.controllers;

import com.fmttema.api.dto.DashboardResumoDTO;
import com.fmttema.api.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAnyRole('ADMIN', 'TREINADOR')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Endpoint oficial da US10:
     * GET /api/dashboard/resumo
     * Retorna métricas pré-agregadas diretamente no banco de dados (SUM, COUNT, GROUP BY).
     */
    @GetMapping("/resumo")
    public ResponseEntity<DashboardResumoDTO> obterResumo() {
        DashboardResumoDTO resumo = dashboardService.obterResumoGeral();
        return ResponseEntity.ok(resumo);
    }
}
