package com.fmttema.api.exceptions;

import com.fmttema.api.dto.ErroRespostaDTO;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(PagamentoPendenteException.class)
    public ResponseEntity<ErroRespostaDTO> handlePagamentoPendente(PagamentoPendenteException ex, HttpServletRequest request) {
        log.warn("Tentativa de ação com pagamento pendente na rota {}: {}", request.getRequestURI(), ex.getMessage());
        ErroRespostaDTO erro = new ErroRespostaDTO(
                HttpStatus.FORBIDDEN.value(),
                "Inscrição negada - Pendência Financeira",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(erro);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroRespostaDTO> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Acesso negado para {}: {}", request.getRequestURI(), ex.getMessage());
        ErroRespostaDTO erro = new ErroRespostaDTO(
                HttpStatus.FORBIDDEN.value(),
                "Acesso não autorizado",
                "Você não possui permissão para executar esta operação.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(erro);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroRespostaDTO> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Falha de autenticação na rota {}: {}", request.getRequestURI(), ex.getMessage());
        ErroRespostaDTO erro = new ErroRespostaDTO(
                HttpStatus.UNAUTHORIZED.value(),
                "Credenciais inválidas",
                "E-mail ou senha incorretos.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErroRespostaDTO> handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        log.warn("Entidade não encontrada na rota {}: {}", request.getRequestURI(), ex.getMessage());
        ErroRespostaDTO erro = new ErroRespostaDTO(
                HttpStatus.NOT_FOUND.value(),
                "Recurso não encontrado",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ErroRespostaDTO> handleRegraDeNegocio(RuntimeException ex, HttpServletRequest request) {
        log.warn("Regra de negócio violada na rota {}: {}", request.getRequestURI(), ex.getMessage());
        ErroRespostaDTO erro = new ErroRespostaDTO(
                HttpStatus.BAD_REQUEST.value(),
                "Requisição inválida",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroRespostaDTO> handleValidacaoCampos(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> validacoes = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            validacoes.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        log.warn("Erro de validação de DTO na rota {}: {}", request.getRequestURI(), validacoes);
        ErroRespostaDTO erro = new ErroRespostaDTO(
                HttpStatus.BAD_REQUEST.value(),
                "Erro de validação",
                "Um ou mais campos obrigatórios estão inválidos.",
                request.getRequestURI(),
                validacoes
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroRespostaDTO> handleErroInesperado(Exception ex, HttpServletRequest request) {
        log.error("Erro interno não tratado na rota " + request.getRequestURI(), ex);
        ErroRespostaDTO erro = new ErroRespostaDTO(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erro interno do servidor",
                "Ocorreu um erro interno inesperado ao processar a requisição.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
    }
}
