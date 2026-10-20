package com.fmttema.api.models;

import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RelacionamentoAtletaAcademiaTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AcademiaRepository academiaRepository;

    @Autowired
    private AtletaRepository atletaRepository;

    @Test
    @DisplayName("Deve persistir Academia com vinculo de Usuario e varios Atletas vinculados (1:N com academia_id)")
    void devePersistirAcademiaEAtletasComChaveEstrangeira() {
        // 1. Criar Usuario para a Academia
        Usuario userAcademia = new Usuario("ct.maranhao@fmttema.com", "senhaForte123", PerfilAcesso.ACADEMIA);
        userAcademia = usuarioRepository.save(userAcademia);

        // 2. Criar Entidade Academia vinculada ao Usuario
        Academia academia = new Academia(
                "Centro de Treinamento Maranhão Muaythai",
                "Mestre Silva",
                "(98) 99123-4567",
                "São Luís",
                userAcademia
        );
        Academia academiaSalva = academiaRepository.save(academia);
        assertNotNull(academiaSalva.getId(), "Academia deve ter ID gerado pelo banco");

        // 3. Criar Usuarios para os Atletas
        Usuario userAtleta1 = new Usuario("atleta1@fmttema.com", "senhaForte123", PerfilAcesso.ATLETA);
        userAtleta1 = usuarioRepository.save(userAtleta1);

        Usuario userAtleta2 = new Usuario("atleta2@fmttema.com", "senhaForte123", PerfilAcesso.ATLETA);
        userAtleta2 = usuarioRepository.save(userAtleta2);

        // 4. Criar Entidades Atleta vinculadas à Academia (academia_id) e aos seus respectivos Usuarios
        Atleta atleta1 = new Atleta(
                "Carlos Silva",
                "O Martelo",
                "123.456.789-01",
                LocalDate.of(1998, 5, 20),
                71.5,
                "Vermelho e Branco",
                userAtleta1,
                academiaSalva
        );

        Atleta atleta2 = new Atleta(
                "Rafael Santos",
                "Trovão",
                "987.654.321-09",
                LocalDate.of(2001, 10, 15),
                67.0,
                "Azul",
                userAtleta2,
                academiaSalva
        );

        Atleta atleta1Salvo = atletaRepository.save(atleta1);
        Atleta atleta2Salvo = atletaRepository.save(atleta2);

        // 5. Validações de Persistência e Chave Estrangeira
        assertNotNull(atleta1Salvo.getId());
        assertNotNull(atleta2Salvo.getId());
        assertEquals(academiaSalva.getId(), atleta1Salvo.getAcademia().getId(), "O atleta1 deve apontar para o ID da academia");
        assertEquals(academiaSalva.getId(), atleta2Salvo.getAcademia().getId(), "O atleta2 deve apontar para o ID da academia");

        // 6. Consultar Atletas por Academia (1:N)
        List<Atleta> atletasDaAcademia = atletaRepository.findByAcademiaId(academiaSalva.getId());
        assertEquals(2, atletasDaAcademia.size(), "A academia deve conter 2 atletas cadastrados");
    }
}
