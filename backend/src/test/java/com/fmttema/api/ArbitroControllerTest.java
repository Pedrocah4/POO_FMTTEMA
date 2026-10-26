package com.fmttema.api;

import com.fmttema.api.models.EscalaArbitro;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.models.StatusPresencaArbitro;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.EscalaArbitroRepository;
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

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class ArbitroControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private EscalaArbitroRepository escalaArbitroRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;

    private Usuario arbitro1;
    private Usuario arbitro2;
    private Evento evento;
    private EscalaArbitro escala1;
    private EscalaArbitro escala2;
    private String tokenArbitro1;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Cria árbitro 1
        arbitro1 = usuarioRepository.findByEmail("arbitro.teste1@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("arbitro.teste1@fmttema.com", passwordEncoder.encode("123456"), PerfilAcesso.ARBITRO, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });

        // Cria árbitro 2
        arbitro2 = usuarioRepository.findByEmail("arbitro.teste2@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("arbitro.teste2@fmttema.com", passwordEncoder.encode("123456"), PerfilAcesso.ARBITRO, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });

        // Cria evento de teste
        evento = new Evento(
                "Torneio Teste Arbitragem 2026",
                LocalDate.now().plusMonths(1),
                "Ginásio Principal"
        );
        evento.setStatus(StatusEvento.AGENDADO);
        evento = eventoRepository.save(evento);

        // Escala para arbitro 1
        escala1 = new EscalaArbitro(arbitro1, evento, "Árbitro Central", StatusPresencaArbitro.PENDENTE);
        escala1 = escalaArbitroRepository.save(escala1);

        // Escala para arbitro 2
        escala2 = new EscalaArbitro(arbitro2, evento, "Juiz Lateral", StatusPresencaArbitro.PENDENTE);
        escala2 = escalaArbitroRepository.save(escala2);

        tokenArbitro1 = tokenService.gerarToken(arbitro1);
    }

    @Test
    @DisplayName("US08: GET /api/arbitros/me/escalas deve listar apenas as escalas do árbitro logado no token JWT")
    void deveListarApenasMinhasEscalas() throws Exception {
        mockMvc.perform(get("/api/arbitros/me/escalas")
                        .header("Authorization", "Bearer " + tokenArbitro1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].arbitroId").value(arbitro1.getId()))
                .andExpect(jsonPath("$[0].arbitroEmail").value("arbitro.teste1@fmttema.com"))
                .andExpect(jsonPath("$[0].funcao").value("Árbitro Central"))
                .andExpect(jsonPath("$[0].status").value("PENDENTE"));
    }

    @Test
    @DisplayName("US08: PATCH /api/arbitros/me/escalas/{id}/confirmar deve confirmar presença e salvar no banco")
    void deveConfirmarPresencaComSucesso() throws Exception {
        mockMvc.perform(patch("/api/arbitros/me/escalas/" + escala1.getId() + "/confirmar")
                        .header("Authorization", "Bearer " + tokenArbitro1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(escala1.getId()))
                .andExpect(jsonPath("$.status").value("CONFIRMADO"))
                .andExpect(jsonPath("$.dataConfirmacao").isNotEmpty());
    }

    @Test
    @DisplayName("US08: Árbitro não pode confirmar ou alterar a escala de outro árbitro (403 Forbidden)")
    void deveImpedirConfirmacaoDeOutroArbitro() throws Exception {
        mockMvc.perform(patch("/api/arbitros/me/escalas/" + escala2.getId() + "/confirmar")
                        .header("Authorization", "Bearer " + tokenArbitro1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro").value("Acesso negado"));
    }
}
