package com.fmttema.api.controllers;

import com.fmttema.api.dto.EventoPublicoResponseDTO;
import com.fmttema.api.services.EventoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/publico/eventos")
public class EventoPublicoController {

    private final EventoService eventoService;

    public EventoPublicoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    /**
     * Endpoint 100% público (US13): Lista apenas eventos com datas futuras ou em andamento.
     * Retorna somente dados públicos da vitrine (Nome, Data, Local, Status, URL do Ingresso, Cartaz e Categorias),
     * sem expor dados sensíveis do administrador ou faturamento financeiro.
     *
     * GET /api/publico/eventos/ativos
     */
    @GetMapping("/ativos")
    public ResponseEntity<List<EventoPublicoResponseDTO>> listarEventosAtivos() {
        return ResponseEntity.ok(eventoService.listarEventosPublicosAtivos());
    }
}

