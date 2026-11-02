package com.fmttema.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fmttema.api.dto.RegistrarVencedorDTO;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.Confronto;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import com.fmttema.api.repositories.ConfrontoRepository;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import com.fmttema.api.security.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class ConfrontoControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private CategoriaPesoRepository categoriaPesoRepository;

    @Autowired
    private ConfrontoRepository confrontoRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    private Usuario arbitro;
    private Usuario atletaUser;
    private Atleta atletaVermelho;
    private Atleta atletaAzul;
    private Evento evento;
    private CategoriaPeso categoria;
    private Confronto semiFinal;
    private Confronto grandeFinal;
    private String tokenArbitro;
    private String tokenAtleta;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        try {
            jdbcTemplate.execute("ALTER TABLE confrontos ALTER COLUMN atleta_vermelho_id DROP NOT NULL");
        } catch (Exception ignored) {
        }

        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Usuário Árbitro
        arbitro = usuarioRepository.findByEmail("arbitro.teste.confronto@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario(
                    "arbitro.teste.confronto@fmttema.com",
                    passwordEncoder.encode("senha123"),
                    PerfilAcesso.ARBITRO,
                    StatusUsuario.ATIVO
            );
            return usuarioRepository.save(u);
        });
        tokenArbitro = tokenService.gerarToken(arbitro);

        // Usuário Atleta (para teste de RBAC 403 Forbidden)
        atletaUser = usuarioRepository.findByEmail("atleta.teste.confronto@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario(
                    "atleta.teste.confronto@fmttema.com",
                    passwordEncoder.encode("senha123"),
                    PerfilAcesso.ATLETA,
                    StatusUsuario.ATIVO
            );
            return usuarioRepository.save(u);
        });
        tokenAtleta = tokenService.gerarToken(atletaUser);

        // Categoria de peso
        categoria = categoriaPesoRepository.findAll().stream().findFirst().orElseGet(() -> {
            return categoriaPesoRepository.save(new CategoriaPeso("Super-Leve", 63.5, "MASCULINO", "Até 63.5 kg"));
        });

        // Evento
        evento = eventoRepository.save(new Evento(
                "Torneio Teste Confrontos FMTTEMA",
                LocalDate.now().plusDays(10),
                "Ginásio Teste",
                StatusEvento.AGENDADO,
                "Descrição teste"
        ));

        // Busca ou cria Atletas de teste com CPFs únicos
        String cpfVermelho = "888.777.666-11";
        atletaVermelho = atletaRepository.findByCpf(cpfVermelho).orElseGet(() -> {
            Atleta a = new Atleta();
            a.setNome("Lutador Vermelho Teste");
            a.setCpf(cpfVermelho);
            a.setPeso(62.0);
            a.setVitorias(5);
            a.setDerrotas(1);
            a.setStatusPagamento(StatusPagamento.PAGO);
            return atletaRepository.save(a);
        });

        String cpfAzul = "888.777.666-22";
        atletaAzul = atletaRepository.findByCpf(cpfAzul).orElseGet(() -> {
            Atleta a = new Atleta();
            a.setNome("Lutador Azul Teste");
            a.setCpf(cpfAzul);
            a.setPeso(63.0);
            a.setVitorias(2);
            a.setDerrotas(3);
            a.setStatusPagamento(StatusPagamento.PAGO);
            return atletaRepository.save(a);
        });

        // Grande Final (próximo confronto)
        grandeFinal = new Confronto(
                evento,
                categoria,
                null,
                null,
                "Final",
                2,
                null
        );
        grandeFinal = confrontoRepository.save(grandeFinal);

        // Semifinal vinculada à Grande Final
        semiFinal = new Confronto(
                evento,
                categoria,
                atletaVermelho,
                atletaAzul,
                "Semifinal",
                1,
                grandeFinal
        );
        semiFinal = confrontoRepository.save(semiFinal);
    }

    @Test
    @DisplayName("US07.1: Árbitro deve registrar vencedor, finalizar combate, avançar na chave e atualizar cartéis atomicamente")
    void deveRegistrarVencedorComSucessoEAtualizarCartel() throws Exception {
        RegistrarVencedorDTO dto = new RegistrarVencedorDTO(
                atletaVermelho.getId(),
                "Nocaute Técnico (TKO)"
        );

        mockMvc.perform(patch("/api/confrontos/" + semiFinal.getId() + "/vencedor")
                        .header("Authorization", "Bearer " + tokenArbitro)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINALIZADA"))
                .andExpect(jsonPath("$.vencedor.id").value(atletaVermelho.getId()))
                .andExpect(jsonPath("$.metodoVitoria").value("Nocaute Técnico (TKO)"));

        // Validação no banco: Confronto finalizado
        Confronto confrontoSalvo = confrontoRepository.findById(semiFinal.getId()).orElseThrow();
        assertThat(confrontoSalvo.getStatus()).isEqualTo("FINALIZADA");
        assertThat(confrontoSalvo.getVencedor().getId()).isEqualTo(atletaVermelho.getId());
        assertThat(confrontoSalvo.getMetodoVitoria()).isEqualTo("Nocaute Técnico (TKO)");

        // Validação no banco: Avanço automático para a Grande Final
        Confronto finalSalva = confrontoRepository.findById(grandeFinal.getId()).orElseThrow();
        assertThat(finalSalva.getAtletaVermelho()).isNotNull();
        assertThat(finalSalva.getAtletaVermelho().getId()).isEqualTo(atletaVermelho.getId());

        // Validação no banco: Cartéis incrementados (+1 vitória para vencedor, +1 derrota para perdedor)
        Atleta vencedorRecarregado = atletaRepository.findById(atletaVermelho.getId()).orElseThrow();
        assertThat(vencedorRecarregado.getVitorias()).isEqualTo(6); // 5 + 1
        assertThat(vencedorRecarregado.getDerrotas()).isEqualTo(1);

        Atleta perdedorRecarregado = atletaRepository.findById(atletaAzul.getId()).orElseThrow();
        assertThat(perdedorRecarregado.getVitorias()).isEqualTo(2);
        assertThat(perdedorRecarregado.getDerrotas()).isEqualTo(4); // 3 + 1
    }

    @Test
    @DisplayName("US07.1: Usuário sem Role ADMIN ou ARBITRO (ex: ATLETA) deve ser barrado com 403 Forbidden")
    void deveBloquearPerfilNaoAutorizadoCom403() throws Exception {
        RegistrarVencedorDTO dto = new RegistrarVencedorDTO(
                atletaVermelho.getId(),
                "Decisão Unânime"
        );

        mockMvc.perform(patch("/api/confrontos/" + semiFinal.getId() + "/vencedor")
                        .header("Authorization", "Bearer " + tokenAtleta)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US07.1: Endpoint público deve listar os confrontos de um evento")
    void deveListarConfrontosPorEvento() throws Exception {
        mockMvc.perform(get("/api/confrontos/evento/" + evento.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
