package com.fmttema.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fmttema.api.dto.PatrocinadorRequestDTO;
import com.fmttema.api.models.Patrocinador;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.PatrocinadorRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import com.fmttema.api.security.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.nio.charset.StandardCharsets;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class PatrocinadorControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private PatrocinadorRepository patrocinadorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    private String tokenAdmin;
    private String tokenAtleta;
    private Patrocinador patrocinadorTeste;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // 1. Admin
        Usuario admin = usuarioRepository.findByEmail("admin.patrocinador@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("admin.patrocinador@fmttema.com", passwordEncoder.encode("senha123"), PerfilAcesso.ADMIN, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });
        tokenAdmin = tokenService.gerarToken(admin);

        // 2. Atleta (usuário sem permissão de escrita administrativa)
        Usuario atleta = usuarioRepository.findByEmail("atleta.patrocinador@fmttema.com").orElseGet(() -> {
            Usuario u = new Usuario("atleta.patrocinador@fmttema.com", passwordEncoder.encode("senha123"), PerfilAcesso.ATLETA, StatusUsuario.ATIVO);
            return usuarioRepository.save(u);
        });
        tokenAtleta = tokenService.gerarToken(atleta);

        // 3. Patrocinador Base de Teste
        Patrocinador p = new Patrocinador(
                "Muay Thai Gear Brasil",
                "https://gearbrasil.com.br",
                "https://gearbrasil.com.br/logo.png",
                "Patrocinador Master",
                true,
                1
        );
        patrocinadorTeste = patrocinadorRepository.save(p);
    }

    @Test
    @DisplayName("US11: GET /api/patrocinadores deve ser público e listar patrocinadores")
    void deveListarPatrocinadoresPublicamente() throws Exception {
        mockMvc.perform(get("/api/patrocinadores")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].nome", notNullValue()));
    }

    @Test
    @DisplayName("US11: GET /api/patrocinadores/ativos deve retornar apenas parceiros ativos")
    void deveListarApenasPatrocinadoresAtivos() throws Exception {
        // Criar patrocinador inativo
        Patrocinador inativo = new Patrocinador("Inativo Brand", null, "https://link.com/logo.png", "Apoiador", false, 99);
        patrocinadorRepository.save(inativo);

        mockMvc.perform(get("/api/patrocinadores/ativos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].ativo").value(org.hamcrest.Matchers.everyItem(is(true))));
    }

    @Test
    @DisplayName("US11: POST /api/patrocinadores com JSON deve cadastrar patrocinador para ADMIN")
    void deveCadastrarPatrocinadorComJson() throws Exception {
        PatrocinadorRequestDTO dto = new PatrocinadorRequestDTO(
                "Top King Boxing Brasil",
                "https://topkingboxing.com.br",
                "https://topkingboxing.com.br/banner_topking.png",
                "Material Esportivo",
                true,
                2
        );

        mockMvc.perform(post("/api/patrocinadores")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nome", is("Top King Boxing Brasil")))
                .andExpect(jsonPath("$.logoUrl", is("https://topkingboxing.com.br/banner_topking.png")))
                .andExpect(jsonPath("$.categoria", is("Material Esportivo")));
    }

    @Test
    @DisplayName("US11: POST /api/patrocinadores/upload deve salvar imagem localmente e retornar URL")
    void deveFazerUploadDeLogomarca() throws Exception {
        MockMultipartFile arquivo = new MockMultipartFile(
                "arquivo",
                "logo_parceiro.png",
                MediaType.IMAGE_PNG_VALUE,
                "fake image png content bytes".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/patrocinadores/upload")
                        .file(arquivo)
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url", org.hamcrest.Matchers.startsWith("/uploads/patrocinadores/")))
                .andExpect(jsonPath("$.mensagem", notNullValue()));
    }

    @Test
    @DisplayName("US11: POST /api/patrocinadores/com-arquivo deve cadastrar parceiro e fazer upload do logo")
    void deveCadastrarComArquivoMultipart() throws Exception {
        PatrocinadorRequestDTO dto = new PatrocinadorRequestDTO(
                "Academia e Suplementos Fit",
                "https://fitsuplementos.com",
                null,
                "Nutrição Esportiva",
                true,
                3
        );

        MockMultipartFile dadosPart = new MockMultipartFile(
                "dados",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(dto)
        );

        MockMultipartFile arquivoPart = new MockMultipartFile(
                "arquivo",
                "logo_fit.webp",
                "image/webp",
                "fake-webp-image-bytes".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/patrocinadores/com-arquivo")
                        .file(dadosPart)
                        .file(arquivoPart)
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nome", is("Academia e Suplementos Fit")))
                .andExpect(jsonPath("$.logoUrl", org.hamcrest.Matchers.startsWith("/uploads/patrocinadores/")));
    }

    @Test
    @DisplayName("US11: PUT /api/patrocinadores/{id} deve atualizar dados do patrocinador")
    void deveAtualizarPatrocinador() throws Exception {
        PatrocinadorRequestDTO dto = new PatrocinadorRequestDTO(
                "Muay Thai Gear Brasil Atualizado",
                "https://gearbrasil.com.br/novo",
                "https://gearbrasil.com.br/novo_logo.png",
                "Patrocinador Premium",
                true,
                1
        );

        mockMvc.perform(put("/api/patrocinadores/" + patrocinadorTeste.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Muay Thai Gear Brasil Atualizado")))
                .andExpect(jsonPath("$.categoria", is("Patrocinador Premium")));
    }

    @Test
    @DisplayName("US11: PATCH /api/patrocinadores/{id}/status deve alternar visibilidade")
    void deveAlterarStatusDoPatrocinador() throws Exception {
        mockMvc.perform(patch("/api/patrocinadores/" + patrocinadorTeste.getId() + "/status?ativo=false")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo", is(false)));
    }

    @Test
    @DisplayName("US11: DELETE /api/patrocinadores/{id} deve excluir patrocinador")
    void deveExcluirPatrocinador() throws Exception {
        mockMvc.perform(delete("/api/patrocinadores/" + patrocinadorTeste.getId())
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNoContent());

        assertFalse(patrocinadorRepository.existsById(patrocinadorTeste.getId()));
    }

    @Test
    @DisplayName("US11: Não deve permitir cadastro sem permissão ADMIN (401/403)")
    void deveProibirCadastroSemPermissao() throws Exception {
        PatrocinadorRequestDTO dto = new PatrocinadorRequestDTO(
                "Invasor Brand",
                "https://site.com",
                "https://site.com/logo.png",
                "Apoiador",
                true,
                1
        );

        // Sem token (401)
        mockMvc.perform(post("/api/patrocinadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());

        // Com token de Atleta (403)
        mockMvc.perform(post("/api/patrocinadores")
                        .header("Authorization", "Bearer " + tokenAtleta)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }
}
