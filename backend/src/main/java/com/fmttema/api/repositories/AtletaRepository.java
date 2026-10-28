package com.fmttema.api.repositories;

import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtletaRepository extends JpaRepository<Atleta, Long> {
    List<Atleta> findByAcademiaId(Long academiaId);
    Optional<Atleta> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
    Optional<Atleta> findByUsuarioId(Long usuarioId);
    Optional<Atleta> findByUsuarioEmail(String email);

    @Query("SELECT COUNT(a) FROM Atleta a WHERE a.usuario.status = :status")
    Long countByUsuarioStatus(@Param("status") StatusUsuario status);

    @Query("SELECT COUNT(a) FROM Atleta a WHERE a.statusPagamento = :status")
    Long countByStatusPagamento(@Param("status") StatusPagamento status);

    @Query("SELECT COALESCE(a.graduacao, 'Não informada'), COUNT(a) FROM Atleta a GROUP BY a.graduacao ORDER BY COUNT(a) DESC")
    java.util.List<Object[]> contarPorGraduacao();

    @Query("SELECT COALESCE(a.categoria, 'Não informada'), COUNT(a) FROM Atleta a GROUP BY a.categoria ORDER BY COUNT(a) DESC")
    java.util.List<Object[]> contarPorCategoria();

    /**
     * US12: Query SQL nativa para o Ranking de Volume (ordenação por total absoluto de vitórias).
     * O cálculo de total de lutas e percentual de aproveitamento é executado diretamente no PostgreSQL.
     */
    @Query(value = """
            SELECT
                a.id AS atleta_id,
                a.nome AS nome,
                a.apelido AS apelido,
                COALESCE(a.categoria, 'Sem Categoria') AS categoria,
                COALESCE(a.graduacao, a.kruang, 'Não informada') AS graduacao,
                COALESCE(ac.nome, 'Independente') AS academia_nome,
                COALESCE(a.vitorias, 0) AS vitorias,
                COALESCE(a.derrotas, 0) AS derrotas,
                COALESCE(a.empates, 0) AS empates,
                (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) AS total_lutas,
                COALESCE(
                    ROUND(
                        (CAST(COALESCE(a.vitorias, 0) AS NUMERIC) * 100.0) /
                        NULLIF((COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)), 0),
                        2
                    ),
                    0.0
                ) AS percentual_aproveitamento
            FROM atletas a
            LEFT JOIN academias ac ON ac.id = a.academia_id
            ORDER BY
                COALESCE(a.vitorias, 0) DESC,
                percentual_aproveitamento DESC,
                COALESCE(a.derrotas, 0) ASC,
                a.nome ASC
            """, nativeQuery = true)
    List<Object[]> buscarRankingVolumeSql();

    /**
     * US12: Query SQL nativa para o Ranking de Volume filtrado por categoria de peso.
     */
    @Query(value = """
            SELECT
                a.id AS atleta_id,
                a.nome AS nome,
                a.apelido AS apelido,
                COALESCE(a.categoria, 'Sem Categoria') AS categoria,
                COALESCE(a.graduacao, a.kruang, 'Não informada') AS graduacao,
                COALESCE(ac.nome, 'Independente') AS academia_nome,
                COALESCE(a.vitorias, 0) AS vitorias,
                COALESCE(a.derrotas, 0) AS derrotas,
                COALESCE(a.empates, 0) AS empates,
                (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) AS total_lutas,
                COALESCE(
                    ROUND(
                        (CAST(COALESCE(a.vitorias, 0) AS NUMERIC) * 100.0) /
                        NULLIF((COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)), 0),
                        2
                    ),
                    0.0
                ) AS percentual_aproveitamento
            FROM atletas a
            LEFT JOIN academias ac ON ac.id = a.academia_id
            WHERE LOWER(COALESCE(a.categoria, '')) = LOWER(:categoria)
            ORDER BY
                COALESCE(a.vitorias, 0) DESC,
                percentual_aproveitamento DESC,
                COALESCE(a.derrotas, 0) ASC,
                a.nome ASC
            """, nativeQuery = true)
    List<Object[]> buscarRankingVolumePorCategoriaSql(@Param("categoria") String categoria);

    /**
     * US12: Query SQL nativa para o Ranking de Eficiência (fórmula matemática de percentual no banco,
     * filtrando atletas com mínimo de 3 lutas).
     */
    @Query(value = """
            SELECT
                a.id AS atleta_id,
                a.nome AS nome,
                a.apelido AS apelido,
                COALESCE(a.categoria, 'Sem Categoria') AS categoria,
                COALESCE(a.graduacao, a.kruang, 'Não informada') AS graduacao,
                COALESCE(ac.nome, 'Independente') AS academia_nome,
                COALESCE(a.vitorias, 0) AS vitorias,
                COALESCE(a.derrotas, 0) AS derrotas,
                COALESCE(a.empates, 0) AS empates,
                (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) AS total_lutas,
                COALESCE(
                    ROUND(
                        (CAST(COALESCE(a.vitorias, 0) AS NUMERIC) * 100.0) /
                        NULLIF((COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)), 0),
                        2
                    ),
                    0.0
                ) AS percentual_aproveitamento
            FROM atletas a
            LEFT JOIN academias ac ON ac.id = a.academia_id
            WHERE (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) >= 3
            ORDER BY
                percentual_aproveitamento DESC,
                COALESCE(a.vitorias, 0) DESC,
                COALESCE(a.derrotas, 0) ASC,
                a.nome ASC
            """, nativeQuery = true)
    List<Object[]> buscarRankingEficienciaSql();

    /**
     * US12: Query SQL nativa para o Ranking de Eficiência filtrado por categoria de peso (mínimo de 3 lutas).
     */
    @Query(value = """
            SELECT
                a.id AS atleta_id,
                a.nome AS nome,
                a.apelido AS apelido,
                COALESCE(a.categoria, 'Sem Categoria') AS categoria,
                COALESCE(a.graduacao, a.kruang, 'Não informada') AS graduacao,
                COALESCE(ac.nome, 'Independente') AS academia_nome,
                COALESCE(a.vitorias, 0) AS vitorias,
                COALESCE(a.derrotas, 0) AS derrotas,
                COALESCE(a.empates, 0) AS empates,
                (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) AS total_lutas,
                COALESCE(
                    ROUND(
                        (CAST(COALESCE(a.vitorias, 0) AS NUMERIC) * 100.0) /
                        NULLIF((COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)), 0),
                        2
                    ),
                    0.0
                ) AS percentual_aproveitamento
            FROM atletas a
            LEFT JOIN academias ac ON ac.id = a.academia_id
            WHERE (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) >= 3
              AND LOWER(COALESCE(a.categoria, '')) = LOWER(:categoria)
            ORDER BY
                percentual_aproveitamento DESC,
                COALESCE(a.vitorias, 0) DESC,
                COALESCE(a.derrotas, 0) ASC,
                a.nome ASC
            """, nativeQuery = true)
    List<Object[]> buscarRankingEficienciaPorCategoriaSql(@Param("categoria") String categoria);

    @Query(value = "SELECT DISTINCT categoria FROM atletas WHERE categoria IS NOT NULL AND TRIM(categoria) <> '' ORDER BY categoria ASC", nativeQuery = true)
    List<String> listarCategoriasDistintasSql();
}
