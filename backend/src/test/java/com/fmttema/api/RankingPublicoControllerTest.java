package com.fmttema.api;

import com.fmttema.api.models.Academia;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class RankingPublicoControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private AcademiaRepository academiaRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        Academia academia = new Academia();
        academia.setNome("CT Ranking Teste MA");
        academia.setCidade("São Luís");
        academia.setResponsavel("Kru Teste");
        academia.setTelefone("(98) 99999-0000");
        academia = academiaRepository.save(academia);

        // Atleta 1: Alto volume de vitórias (15V, 5D, 0E = 20 lutas, 75.00% aproveitamento)
        criarAtleta("Lutador Volume Max", "VolMax", "888.111.222-01", "Peso-Médio", "Preto", 15, 5, 0, academia);

        // Atleta 2: Máxima eficiência com >= 3 lutas (4V, 0D, 0E = 4 lutas, 100.00% aproveitamento)
        criarAtleta("Lutador Eficiencia Cem", "Sniper100", "888.111.222-02", "Peso-Médio", "Vermelho", 4, 0, 0, academia);

        // Atleta 3: Menos de 3 lutas (2V, 0D, 0E = 2 lutas, 100% mas NÃO deve entrar no Ranking de Eficiência)
        criarAtleta("Lutador Iniciante Duas Lutas", "Novato", "888.111.222-03", "Peso-Médio", "Branco", 2, 0, 0, academia);
    }

    private void criarAtleta(
            String nome, String apelido, String cpf, String categoria, String graduacao,
            int vitorias, int derrotas, int empates, Academia academia
    ) {
        Atleta a = new Atleta();
        a.setNome(nome);
        a.setApelido(apelido);
        a.setCpf(cpf);
        a.setDataNascimento(LocalDate.of(1998, 5, 10));
        a.setPeso(75.0);
        a.setCategoria(categoria);
        a.setGraduacao(graduacao);
        a.setKruang(graduacao);
        a.setVitorias(vitorias);
        a.setDerrotas(derrotas);
        a.setEmpates(empates);
        a.setStatusPagamento(StatusPagamento.PAGO);
        a.setAcademia(academia);
        atletaRepository.save(a);
    }

    @Test
    @DisplayName("US12: GET /api/publico/ranking deve ser 100% público (sem Bearer Token) e retornar os dois rankings ordenados")
    void deveRetornarRankingsPublicosSemToken() throws Exception {
        mockMvc.perform(get("/api/publico/ranking")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rankingVolume", notNullValue()))
                .andExpect(jsonPath("$.rankingEficiencia", notNullValue()))
                .andExpect(jsonPath("$.categoriasDisponiveis", notNullValue()))
                .andExpect(jsonPath("$.minimoLutasEficiencia", is(3)))
                // No Ranking de Volume, o 1º colocado deve ser "Lutador Volume Max" com 15 vitórias
                .andExpect(jsonPath("$.rankingVolume[0].nome", is("Lutador Volume Max")))
                .andExpect(jsonPath("$.rankingVolume[0].vitorias", is(15)))
                .andExpect(jsonPath("$.rankingVolume[0].posicao", is(1)))
                // No Ranking de Eficiência, o 1º colocado deve ter 100% de aproveitamento ("Lutador Eficiencia Cem")
                .andExpect(jsonPath("$.rankingEficiencia[0].nome", is("Lutador Eficiencia Cem")))
                .andExpect(jsonPath("$.rankingEficiencia[0].percentualAproveitamento", is(100.0)))
                // Todos os atletas do Ranking de Eficiência devem ter pelo menos 3 lutas no total
                .andExpect(jsonPath("$.rankingEficiencia[*].totalLutas", everyItem(greaterThanOrEqualTo(3))));
    }

    @Test
    @DisplayName("US12: GET /api/publico/ranking deve ignorar bloqueio JWT mesmo se um header Authorization inválido for enviado")
    void deveIgnorarBloqueioJwtMesmoComTokenInvalido() throws Exception {
        mockMvc.perform(get("/api/publico/ranking")
                        .header("Authorization", "Bearer token_invalido_ou_expirado_123")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rankingVolume", notNullValue()))
                .andExpect(jsonPath("$.rankingEficiencia", notNullValue()));
    }

    @Test
    @DisplayName("US12: GET /api/publico/ranking?categoria=Peso-Médio deve filtrar ambos os rankings pela categoria no SQL")
    void deveFiltrarRankingPorCategoriaNoSql() throws Exception {
        mockMvc.perform(get("/api/publico/ranking")
                        .param("categoria", "Peso-Médio")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoriaFiltrada", is("Peso-Médio")))
                .andExpect(jsonPath("$.rankingVolume[*].categoria", everyItem(is("Peso-Médio"))))
                .andExpect(jsonPath("$.rankingEficiencia[*].categoria", everyItem(is("Peso-Médio"))))
                .andExpect(jsonPath("$.rankingEficiencia[*].totalLutas", everyItem(greaterThanOrEqualTo(3))));
    }
}

