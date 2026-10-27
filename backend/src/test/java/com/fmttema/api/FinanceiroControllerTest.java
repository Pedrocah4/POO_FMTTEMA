package com.fmttema.api;

import com.fmttema.api.models.Academia;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.FluxoCaixa;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.TipoTransacao;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class FinanceiroControllerTest {

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
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;

    private Usuario admin;
    private Usuario atletaUser;
    private Atleta atletaPendente;
    private String tokenAdmin;
    private String tokenAtleta;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // 1. Admin
        admin = usuarioRepository.findByEmail("admin.financeiro@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("admin.financeiro@fmttema.com", passwordEncoder.encode("admin123"), PerfilAcesso.ADMIN, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });
        tokenAdmin = tokenService.gerarToken(admin);

        // 2. Atleta com pagamento PENDENTE
        atletaUser = usuarioRepository.findByEmail("atleta.pendente@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("atleta.pendente@fmttema.com", passwordEncoder.encode("123456"), PerfilAcesso.ATLETA, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });
        tokenAtleta = tokenService.gerarToken(atletaUser);

        atletaPendente = new Atleta();
        atletaPendente.setNome("Carlos Teste Financeiro");
        atletaPendente.setCpf("999.888.777-66");
        atletaPendente.setDataNascimento(LocalDate.of(2000, 1, 1));
        atletaPendente.setPeso(70.0);
        atletaPendente.setStatusPagamento(StatusPagamento.PENDENTE);
        atletaPendente.setUsuario(atletaUser);
        atletaPendente = atletaRepository.save(atletaPendente);
    }

    @Test
    @DisplayName("US09: PATCH /api/financeiro/anuidades/{id}/pagar deve alterar status para PAGO, salvar comprovante e gerar lançamento em FluxoCaixa")
    void deveDarBaixaManualComComprovanteERegistrarFluxoCaixa() throws Exception {
        String jsonPayload = """
                {
                    "comprovante": "https://comprovantes.fmttema.com/2026/pix_carlos_123.pdf",
                    "valor": 150.00,
                    "tipoBeneficiario": "ATLETA",
                    "observacoes": "Pagamento recebido via PIX verificado em extrato bancário."
                }
                """;

        mockMvc.perform(patch("/api/financeiro/anuidades/" + atletaPendente.getId() + "/pagar")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.beneficiarioId").value(atletaPendente.getId()))
                .andExpect(jsonPath("$.statusPagamento").value("PAGO"))
                .andExpect(jsonPath("$.comprovante").value("https://comprovantes.fmttema.com/2026/pix_carlos_123.pdf"))
                .andExpect(jsonPath("$.valorPago").value(150.00))
                .andExpect(jsonPath("$.fluxoCaixaId").isNotEmpty());

        // Validação no banco de dados (Critério de Conclusão)
        Atleta atletaAtualizado = atletaRepository.findById(atletaPendente.getId()).orElseThrow();
        assertEquals(StatusPagamento.PAGO, atletaAtualizado.getStatusPagamento());
        assertEquals("https://comprovantes.fmttema.com/2026/pix_carlos_123.pdf", atletaAtualizado.getComprovantePagamento());

        // Validação da persistência atômica no Fluxo de Caixa
        List<FluxoCaixa> lancamentos = fluxoCaixaRepository.findByAtletaId(atletaPendente.getId());
        assertFalse(lancamentos.isEmpty());
        FluxoCaixa lancamento = lancamentos.get(0);
        assertEquals(TipoTransacao.ENTRADA, lancamento.getTipo());
        assertEquals(150.00, lancamento.getValor());
        assertEquals("https://comprovantes.fmttema.com/2026/pix_carlos_123.pdf", lancamento.getComprovanteUrl());
        assertNotNull(lancamento.getDataHora());
    }

    @Test
    @DisplayName("US09: Deve recusar baixa manual de quem não tem perfil ADMIN (403 Forbidden)")
    void deveRecusarBaixaSemRoleAdmin() throws Exception {
        String jsonPayload = """
                {
                    "comprovante": "https://comprovantes.fmttema.com/tentativa_fraude.pdf",
                    "valor": 150.00
                }
                """;

        mockMvc.perform(patch("/api/financeiro/anuidades/" + atletaPendente.getId() + "/pagar")
                        .header("Authorization", "Bearer " + tokenAtleta)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US09: Deve retornar 404 caso o ID do beneficiário não exista")
    void deveRetornar404ParaIdInexistente() throws Exception {
        String jsonPayload = """
                {
                    "comprovante": "https://comprovantes.fmttema.com/comprovante_inexistente.pdf",
                    "valor": 150.00
                }
                """;

        mockMvc.perform(patch("/api/financeiro/anuidades/999999/pagar")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Não encontrado"));
    }
}
