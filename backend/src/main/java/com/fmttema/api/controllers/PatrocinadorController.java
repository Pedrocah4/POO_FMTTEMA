package com.fmttema.api.controllers;

import com.fmttema.api.dto.PatrocinadorRequestDTO;
import com.fmttema.api.dto.PatrocinadorResponseDTO;
import com.fmttema.api.services.FileUploadService;
import com.fmttema.api.services.PatrocinadorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patrocinadores")
public class PatrocinadorController {

    private final PatrocinadorService patrocinadorService;
    private final FileUploadService fileUploadService;

    public PatrocinadorController(PatrocinadorService patrocinadorService, FileUploadService fileUploadService) {
        this.patrocinadorService = patrocinadorService;
        this.fileUploadService = fileUploadService;
    }

    /**
     * Endpoint público: Lista patrocinadores (geral ou filtrado por ativos).
     * GET /api/patrocinadores?apenasAtivos=true
     */
    @GetMapping
    public ResponseEntity<List<PatrocinadorResponseDTO>> listar(
            @RequestParam(required = false, defaultValue = "false") boolean apenasAtivos
    ) {
        List<PatrocinadorResponseDTO> lista = apenasAtivos
                ? patrocinadorService.listarAtivos()
                : patrocinadorService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    /**
     * Endpoint público: Lista apenas patrocinadores ativos ordenados para vitrine comercial.
     * GET /api/patrocinadores/ativos
     */
    @GetMapping("/ativos")
    public ResponseEntity<List<PatrocinadorResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(patrocinadorService.listarAtivos());
    }

    /**
     * Endpoint público: Detalhes de um patrocinador por ID.
     * GET /api/patrocinadores/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PatrocinadorResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(patrocinadorService.buscarPorId(id));
    }

    /**
     * Endpoint administrativo: Cadastro via JSON (com link direto de imagem).
     * POST /api/patrocinadores
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatrocinadorResponseDTO> criarComJson(@Valid @RequestBody PatrocinadorRequestDTO dto) {
        PatrocinadorResponseDTO criado = patrocinadorService.criar(dto, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    /**
     * Endpoint administrativo: Cadastro completo via Multipart (dados + arquivo de imagem).
     * POST /api/patrocinadores/com-arquivo
     */
    @PostMapping(value = "/com-arquivo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatrocinadorResponseDTO> criarComArquivo(
            @RequestPart("dados") @Valid PatrocinadorRequestDTO dto,
            @RequestPart("arquivo") MultipartFile arquivo
    ) {
        PatrocinadorResponseDTO criado = patrocinadorService.criar(dto, arquivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    /**
     * Endpoint administrativo: Upload avulso de logomarca/imagem para pasta estática local.
     * POST /api/patrocinadores/upload
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadLogomarca(@RequestParam("arquivo") MultipartFile arquivo) {
        try {
            String url = fileUploadService.salvarLogomarca(arquivo);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "url", url,
                    "mensagem", "Logomarca enviada com sucesso"
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Falha ao salvar arquivo: " + e.getMessage()));
        }
    }

    /**
     * Endpoint administrativo: Atualização de dados cadastrais de um patrocinador.
     * PUT /api/patrocinadores/{id}
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatrocinadorResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody PatrocinadorRequestDTO dto
    ) {
        PatrocinadorResponseDTO atualizado = patrocinadorService.atualizar(id, dto, null);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Endpoint administrativo: Atualização de dados com substituição do arquivo de imagem.
     * PUT /api/patrocinadores/{id}/com-arquivo
     */
    @PutMapping(value = "/{id}/com-arquivo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatrocinadorResponseDTO> atualizarComArquivo(
            @PathVariable Long id,
            @RequestPart("dados") @Valid PatrocinadorRequestDTO dto,
            @RequestPart(value = "arquivo", required = false) MultipartFile arquivo
    ) {
        PatrocinadorResponseDTO atualizado = patrocinadorService.atualizar(id, dto, arquivo);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Endpoint administrativo: Ativar / Desativar exibição de um patrocinador.
     * PATCH /api/patrocinadores/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PatrocinadorResponseDTO> alterarStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean ativo
    ) {
        PatrocinadorResponseDTO atualizado = patrocinadorService.alterarStatus(id, ativo);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Endpoint administrativo: Exclusão de um patrocinador.
     * DELETE /api/patrocinadores/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        patrocinadorService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
