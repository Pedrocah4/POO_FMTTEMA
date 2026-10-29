package com.fmttema.api;

import com.fmttema.api.models.Evento;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.repositories.EventoRepository;
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
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class EventoPublicoControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private EventoRepository eventoRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // 1. Evento Futuro Agendado (Deve aparecer)
        Evento futuro = new Evento(
                "Copa Maranhão Futuro US13",
                LocalDate.now().plusDays(30),
                "Ginásio Castelinho - São Luís",
                StatusEvento.AGENDADO,
                "Etapa oficial futura"
        );
        futuro.setUrlIngresso("https://www.sympla.com.br/copa-maranhao");
        futuro.setCartazUrl("https://placehold.co/600x340/002868/FFFFFF?text=COPA+MA");
        eventoRepository.save(futuro);

        // 2. Evento Em Andamento (Deve aparecer)
        Evento emAndamento = new Evento(
                "Torneio Em Andamento US13",
                LocalDate.now(),
                "Arena Dom Bosco - São Luís",
                StatusEvento.EM_ANDAMENTO,
                "Torneio ocorrendo agora"
        );
        emAndamento.setUrlIngresso("https://www.bilheteriadigital.com/torneio");
        emAndamento.setCartazUrl("https://placehold.co/600x340/D91C22/FFFFFF?text=AO+VIVO");
        eventoRepository.save(emAndamento);

        // 3. Evento Finalizado (NÃO deve aparecer)
        Evento finalizado = new Evento(
                "Evento Finalizado Passado US13",
                LocalDate.now().minusDays(10),
                "Local Antigo",
                StatusEvento.FINALIZADO,
                "Já encerrado"
        );
        eventoRepository.save(finalizado);

        // 4. Evento Agendado mas com data já vencida no passado (NÃO deve aparecer)
        Evento vencido = new Evento(
                "Evento Vencido No Passado US13",
                LocalDate.now().minusDays(5),
                "Local Passado",
                StatusEvento.AGENDADO,
                "Data já passou"
        );
        eventoRepository.save(vencido);
    }

    @Test
    @DisplayName("US13: GET /api/publico/eventos/ativos deve ser 100% público e retornar apenas eventos futuros ou em andamento")
    void deveListarApenasEventosFuturosOuEmAndamentoSemAutenticacao() throws Exception {
        mockMvc.perform(get("/api/publico/eventos/ativos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].nome", hasItem("Copa Maranhão Futuro US13")))
                .andExpect(jsonPath("$[*].nome", hasItem("Torneio Em Andamento US13")))
                .andExpect(jsonPath("$[*].nome", not(hasItem("Evento Finalizado Passado US13"))))
                .andExpect(jsonPath("$[*].nome", not(hasItem("Evento Vencido No Passado US13"))))
                .andExpect(jsonPath("$[*].status", everyItem(not("FINALIZADO"))));
    }

    @Test
    @DisplayName("US13: Deve retornar apenas campos públicos seguros (Nome, Data, Local, URL do Ingresso, Cartaz) e ignorar bloqueio JWT")
    void deveRetornarApenasCamposPublicosSeguros() throws Exception {
        mockMvc.perform(get("/api/publico/eventos/ativos")
                        .header("Authorization", "Bearer token_invalido_teste")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome", notNullValue()))
                .andExpect(jsonPath("$[0].data", notNullValue()))
                .andExpect(jsonPath("$[0].local", notNullValue()))
                .andExpect(jsonPath("$[0].faturamento").doesNotExist())
                .andExpect(jsonPath("$[0].receitaTotal").doesNotExist())
                .andExpect(jsonPath("$[0].admin").doesNotExist());
    }
}

