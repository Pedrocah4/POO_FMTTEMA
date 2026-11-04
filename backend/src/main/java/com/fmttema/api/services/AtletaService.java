package com.fmttema.api.services;

import com.fmttema.api.dto.AtletaRequestDTO;
import com.fmttema.api.dto.AtletaResponseDTO;
import com.fmttema.api.dto.AtualizarCartelDTO;
import com.fmttema.api.models.*;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AtletaService {

    private final AtletaRepository atletaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AcademiaRepository academiaRepository;
    private final PasswordEncoder passwordEncoder;

    public AtletaService(
            AtletaRepository atletaRepository,
            UsuarioRepository usuarioRepository,
            AcademiaRepository academiaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.atletaRepository = atletaRepository;
        this.usuarioRepository = usuarioRepository;
        this.academiaRepository = academiaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Cadastro atômico de atleta e usuário (CARD-04).
     * Caso qualquer validação ou persistência falhe, o rollback total é garantido.
     */
    @Transactional(rollbackFor = Exception.class)
    public AtletaResponseDTO cadastrarAtleta(AtletaRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("O e-mail informado já está cadastrado");
        }

        if (atletaRepository.existsByCpf(dto.cpf())) {
            throw new IllegalArgumentException("O CPF informado já está cadastrado");
        }

        Academia academia = null;
        if (dto.academiaId() != null) {
            academia = academiaRepository.findById(dto.academiaId())
                    .orElseThrow(() -> new IllegalArgumentException("Academia vinculada não encontrada para o ID informado"));
        }

        String senhaCriptografada = passwordEncoder.encode(dto.senha());

        Usuario usuario = new Usuario(
                dto.email(),
                senhaCriptografada,
                PerfilAcesso.ATLETA,
                StatusUsuario.PENDENTE_APROVACAO
        );
        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        Atleta atleta = new Atleta();
        atleta.setNome(dto.nome());
        atleta.setApelido(dto.apelido());
        atleta.setCpf(dto.cpf());
        atleta.setDataNascimento(dto.dataNascimento());
        atleta.setPeso(dto.peso());
        atleta.setCategoria(dto.categoria());
        atleta.setGraduacao(dto.graduacao());
        atleta.setKruang(dto.graduacao());
        atleta.setUsuario(usuarioSalvo);
        atleta.setAcademia(academia);

        Atleta atletaSalvo = atletaRepository.save(atleta);
        return AtletaResponseDTO.fromEntity(atletaSalvo);
    }

    /**
     * Lista atletas pertencentes à agremiação do usuário autenticado (TREINADOR / ACADEMIA) (CARD-06).
     */
    @Transactional(readOnly = true)
    public List<AtletaResponseDTO> listarMinhaEquipe(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + emailUsuario));

        if (usuario.getPerfil() == PerfilAcesso.ADMIN) {
            return listarTodos();
        }

        if (usuario.getPerfil() == PerfilAcesso.ATLETA) {
            Atleta atleta = atletaRepository.findByUsuarioEmail(emailUsuario)
                    .orElseThrow(() -> new EntityNotFoundException("Perfil de atleta não encontrado"));
            return List.of(AtletaResponseDTO.fromEntity(atleta));
        }

        // Para ACADEMIA ou TREINADOR, busca a academia vinculada ao usuário
        Academia academia = academiaRepository.findByUsuarioEmail(emailUsuario)
                .or(() -> academiaRepository.findByUsuarioId(usuario.getId()))
                .orElse(null);

        if (academia == null) {
            return List.of();
        }

        return atletaRepository.findByAcademiaId(academia.getId()).stream()
                .map(AtletaResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Atualiza o cartel e a graduação (Kruang) do atleta com garantia de transação ACID.
     * O mapeamento do DTO ocorre dentro da transação para evitar LazyInitializationException.
     */
    @Transactional
    public AtletaResponseDTO atualizarCartel(Long id, AtualizarCartelDTO dto) {
        Atleta atleta = atletaRepository.findById(id)
                .or(() -> atletaRepository.findByUsuarioId(id))
                .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado com o ID ou Usuário ID: " + id));

        if (dto.vitorias() != null) {
            atleta.setVitorias(dto.vitorias());
        }
        if (dto.derrotas() != null) {
            atleta.setDerrotas(dto.derrotas());
        }
        if (dto.empates() != null) {
            atleta.setEmpates(dto.empates());
        }
        if (dto.kruang() != null && !dto.kruang().isBlank()) {
            atleta.setKruang(dto.kruang());
        } else if (dto.graduacao() != null && !dto.graduacao().isBlank()) {
            atleta.setGraduacao(dto.graduacao());
        }

        Atleta atletaSalvo = atletaRepository.save(atleta);
        return AtletaResponseDTO.fromEntity(atletaSalvo);
    }

    @Transactional(readOnly = true)
    public List<AtletaResponseDTO> listarTodos() {
        return atletaRepository.findAll().stream()
                .map(AtletaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public AtletaResponseDTO buscarPorId(Long id) {
        Atleta atleta = atletaRepository.findById(id)
                .or(() -> atletaRepository.findByUsuarioId(id))
                .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado com o ID: " + id));
        return AtletaResponseDTO.fromEntity(atleta);
    }

    @Transactional(readOnly = true)
    public AtletaResponseDTO buscarPorEmailUsuario(String email) {
        Atleta atleta = atletaRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado para o e-mail: " + email));
        return AtletaResponseDTO.fromEntity(atleta);
    }

    @Transactional
    public AtletaResponseDTO atualizarStatusPagamento(Long id, StatusPagamento status) {
        Atleta atleta = atletaRepository.findById(id)
                .or(() -> atletaRepository.findByUsuarioId(id))
                .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado com o ID: " + id));
        atleta.setStatusPagamento(status);
        Atleta salvo = atletaRepository.save(atleta);
        return AtletaResponseDTO.fromEntity(salvo);
    }
}
