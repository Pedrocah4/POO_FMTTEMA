-- ============================================================================
-- US12 [BANCO/API] Ranking Estadual FMTTEMA: Views e Consultas SQL Nativas
-- ============================================================================

-- 1. View SQL para o Ranking de Volume (Maior Número Absoluto de Vitórias)
CREATE OR REPLACE VIEW vw_ranking_volume AS
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
    a.nome ASC;

-- 2. View SQL para o Ranking de Eficiência (Melhor Aproveitamento Percentual - Mínimo de 3 Lutas)
CREATE OR REPLACE VIEW vw_ranking_eficiencia AS
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
    a.nome ASC;

