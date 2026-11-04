package com.fmttema.api.controllers;

import com.fmttema.api.dto.AnuidadeDTO;
import com.fmttema.api.dto.BaixaAnuidadeRequestDTO;
import com.fmttema.api.dto.BaixaAnuidadeResponseDTO;
import com.fmttema.api.dto.FluxoCaixaResponseDTO;
import com.fmttema.api.services.FinanceiroService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/financeiro")
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    public FinanceiroController(FinanceiroService financeiroService) {
        this.financeiroService = financeiroService;
    }

    /**
     * Endpoint oficial da US09:
     * PATCH /api/financeiro/anuidades/{id}/pagar
     * Realiza a baixa manual da anuidade com registro obrigatório de comprovante e lançamento em fluxo de caixa.
     */
    @PatchMapping("/anuidades/{id}/pagar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> darBaixaManual(
            @PathVariable Long id,
            @RequestBody @Valid BaixaAnuidadeRequestDTO dto,
            Authentication authentication
    ) {
        String adminEmail = (authentication != null) ? authentication.getName() : "admin@fmttema.com";

        try {
            BaixaAnuidadeResponseDTO resposta = financeiroService.realizarBaixaManual(id, dto, adminEmail);
            return ResponseEntity.ok(resposta);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Requisição inválida",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Lista todas as anuidades de atletas e academias para o painel financeiro (Admin).
     * GET /api/financeiro/anuidades
     */
    @GetMapping("/anuidades")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnuidadeDTO>> listarAnuidades() {
        return ResponseEntity.ok(financeiroService.listarTodasAnuidades());
    }

    /**
     * Retorna a anuidade individual ou da agremiação do usuário autenticado (CARD-05).
     * GET /api/financeiro/anuidades/me
     */
    @GetMapping("/anuidades/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIA', 'ATLETA')")
    public ResponseEntity<List<AnuidadeDTO>> buscarMinhaAnuidade(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(financeiroService.buscarMinhaAnuidade(email));
    }

    /**
     * Lista o extrato completo de lançamentos no fluxo de caixa (Admin).
     * GET /api/financeiro/fluxo-caixa
     */
    @GetMapping("/fluxo-caixa")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FluxoCaixaResponseDTO>> listarFluxoCaixa() {
        return ResponseEntity.ok(financeiroService.listarFluxoCaixa());
    }

    /**
     * Endpoint para upload avulso de comprovante (CARD-08).
     * POST /api/financeiro/upload-comprovante
     */
    @PostMapping(value = "/upload-comprovante", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIA', 'ATLETA')")
    public ResponseEntity<Map<String, String>> uploadComprovante(@RequestParam("arquivo") MultipartFile arquivo) {
        try {
            String url = financeiroService.salvarComprovante(arquivo);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "url", url,
                    "mensagem", "Comprovante enviado com sucesso"
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Falha ao salvar comprovante: " + e.getMessage()));
        }
    }

    /**
     * Endpoint para anexar comprovante diretamente à anuidade de um atleta ou agremiação (CARD-08).
     * POST /api/financeiro/anuidades/{id}/comprovante
     */
    @PostMapping(value = "/anuidades/{id}/comprovante", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIA', 'ATLETA')")
    public ResponseEntity<Map<String, String>> anexarComprovante(
            @PathVariable Long id,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "tipo", required = false) String tipo,
            Authentication authentication
    ) {
        try {
            String email = authentication != null ? authentication.getName() : null;
            boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            String url = financeiroService.anexarComprovante(id, tipo, arquivo, email, isAdmin);
            return ResponseEntity.ok(Map.of(
                    "url", url,
                    "mensagem", "Comprovante anexado à anuidade com sucesso"
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Falha ao processar arquivo: " + e.getMessage()));
        }
    }
}
