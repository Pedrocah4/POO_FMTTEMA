package com.fmttema.api;

import com.fmttema.api.models.Academia;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.FluxoCaixa;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.TipoTransacao;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.FluxoCaixaRepository;
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
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class DashboardControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private AcademiaRepository academiaRepository;

    @Autowired
    private FluxoCaixaRepository fluxoCaixaRepository;

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;

    private String tokenAdmin;
    private String tokenAtleta;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // 1. Criar Admin
        Usuario admin = usuarioRepository.findByEmail("admin.dashboard@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("admin.dashboard@fmttema.com", passwordEncoder.encode("senha123"), PerfilAcesso.ADMIN, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });
        tokenAdmin = tokenService.gerarToken(admin);

        // 2. Criar Arbitro
        Usuario arbitro = usuarioRepository.findByEmail("arbitro.dashboard@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("arbitro.dashboard@fmttema.com", passwordEncoder.encode("senha123"), PerfilAcesso.ARBITRO, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });

        // 3. Criar Atleta
        Usuario userAtleta = usuarioRepository.findByEmail("atleta.dashboard@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("atleta.dashboard@fmttema.com", passwordEncoder.encode("senha123"), PerfilAcesso.ATLETA, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });
        tokenAtleta = tokenService.gerarToken(userAtleta);

        Atleta atleta = new Atleta();
        atleta.setNome("Atleta Teste");
        atleta.setCpf("99988877766");
        atleta.setUsuario(userAtleta);
        atleta.setGraduacao("Ponta Vermelha");
        atleta.setCategoria("Amador");
        atleta.setStatusPagamento(StatusPagamento.PAGO);
        atleta = atletaRepository.save(atleta);

        // 4. Criar Academia
        Usuario userAcademia = usuarioRepository.findByEmail("academia.dashboard@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("academia.dashboard@fmttema.com", passwordEncoder.encode("senha123"), PerfilAcesso.ACADEMIA, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });

        Academia academia = new Academia("CT Muay Thai Tigre", "Mestre Carlos", "98988887777", "Sao Luis", userAcademia);
        academia.setStatusPagamento(StatusPagamento.PAGO);
        academia = academiaRepository.save(academia);

        // 5. Criar Transações de Fluxo de Caixa (1 Entrada Atleta 100, 1 Entrada Academia 300, 1 Saída 50)
        FluxoCaixa entrada1 = new FluxoCaixa(TipoTransacao.ENTRADA, "Anuidade Atleta", 100.0,
                "PIX-123456", atleta, null, admin.getEmail());
        fluxoCaixaRepository.save(entrada1);

        FluxoCaixa entrada2 = new FluxoCaixa(TipoTransacao.ENTRADA, "Anuidade Academia", 300.0,
                "PIX-987654", null, academia, admin.getEmail());
        fluxoCaixaRepository.save(entrada2);

        FluxoCaixa saida = new FluxoCaixa(TipoTransacao.SAIDA, "Material de Arbitragem", 50.0,
                null, null, null, admin.getEmail());
        fluxoCaixaRepository.save(saida);

        // 6. Criar Evento
        Evento evento = new Evento("Campeonato Estadual Maranhense", LocalDate.now().plusMonths(1), "Ginásio Castelinho");
        evento.setStatus(StatusEvento.AGENDADO);
        eventoRepository.save(evento);
    }

    @Test
    @DisplayName("US10: Deve retornar o resumo consolidado com agregações no banco para ADMIN")
    void deveRetornarResumoDashboardConsolidado() throws Exception {
        mockMvc.perform(get("/api/dashboard/resumo")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.receitaTotal", greaterThanOrEqualTo(400.0)))
                .andExpect(jsonPath("$.totalDespesas", greaterThanOrEqualTo(50.0)))
                .andExpect(jsonPath("$.saldoLiquido", greaterThanOrEqualTo(350.0)))
                .andExpect(jsonPath("$.receitaAnuidadesAtletas", greaterThanOrEqualTo(100.0)))
                .andExpect(jsonPath("$.receitaAnuidadesAcademias", greaterThanOrEqualTo(300.0)))
                .andExpect(jsonPath("$.totalAtletas", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.atletasAtivos", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.atletasAdimplentes", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalAcademias", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalArbitros", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalEventos", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.eventosAtivos", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.taxaAdimplencia", greaterThanOrEqualTo(0.0)))
                .andExpect(jsonPath("$.distribuicaoGraduacao").isArray())
                .andExpect(jsonPath("$.distribuicaoCategoria").isArray());
    }

    @Test
    @DisplayName("US10: Deve proibir acesso a perfil não autorizado (ATLETA) ao dashboard resumo")
    void deveProibirAcessoNaoAutorizado() throws Exception {
        mockMvc.perform(get("/api/dashboard/resumo")
                        .header("Authorization", "Bearer " + tokenAtleta)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US10: Deve exigir autenticação (401) sem token")
    void deveExigirAutenticacao() throws Exception {
        mockMvc.perform(get("/api/dashboard/resumo")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
