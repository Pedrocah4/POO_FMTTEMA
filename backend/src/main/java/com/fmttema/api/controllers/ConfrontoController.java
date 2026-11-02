package com.fmttema.api.controllers;

import com.fmttema.api.dto.ConfrontoResponseDTO;
import com.fmttema.api.dto.RegistrarVencedorDTO;
import com.fmttema.api.services.ConfrontoService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/confrontos")
public class ConfrontoController {

    private final ConfrontoService confrontoService;

    public ConfrontoController(ConfrontoService confrontoService) {
        this.confrontoService = confrontoService;
    }

    /**
     * Registra o vencedor da luta e o método da vitória na súmula oficial (US07.1).
     * Convenção Obrigatória: Apenas ADMIN ou ARBITRO possuem permissão.
     */
    @PatchMapping("/{id}/vencedor")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARBITRO')")
    public ResponseEntity<?> registrarVencedor(
            @PathVariable Long id,
            @RequestBody @Valid RegistrarVencedorDTO dto,
            Authentication authentication
    ) {
        try {
            String email = authentication != null ? authentication.getName() : "arbitro@fmttema.com";
            ConfrontoResponseDTO response = confrontoService.registrarVencedor(id, dto, email);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Requisição inválida",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Lista todos os confrontos oficiais de um evento esportivo.
     */
    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<ConfrontoResponseDTO>> listarConfrontosPorEvento(@PathVariable Long eventoId) {
        try {
            return ResponseEntity.ok(confrontoService.listarConfrontosPorEvento(eventoId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of());
        }
    }
}
