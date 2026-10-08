Markdown
# 🥊 FMTTEMA - Sistema de Gestão Esportiva

> Plataforma web oficial para a **Federação de Muaythai Tradicional do Estado do Maranhão (FMTTEMA)**, focada em digitalizar processos logísticos, gerenciar inscrições de atletas e automatizar chaves de torneios.

## 🎓 Contexto Acadêmico
Projeto desenvolvido como requisito avaliativo (PJBL) para a disciplina de **Programação Orientada a Objetos (POO)** do curso de Análise e Desenvolvimento de Sistemas da **Unidade de Ensino Superior Dom Bosco (UNDB)**.

## 🚀 Tecnologias Utilizadas (Stack)

O projeto segue uma arquitetura moderna dividida entre API REST (Backend) e SPA (Frontend):

### Backend
* **Linguagem:** Java 21
* **Framework:** Spring Boot 3
* **Segurança:** Spring Security + JWT (JSON Web Token) + BCrypt
* **Persistência (ORM):** Spring Data JPA / Hibernate

### Frontend
* **Biblioteca:** React.js
* **Estilização:** Tailwind CSS

### Banco de Dados & Ferramentas
* **Banco Relacional:** PostgreSQL (com transações ACID)
* **IDE Recomendada:** IntelliJ IDEA Ultimate
* **Gestão Ágil:** Trello

## ⚙️ Módulos do Sistema (Épicos)
1. **Gestão de Cadastros (RBAC):** Controle de acesso e registro de atletas vinculados a academias.
2. **Logística de Eventos:** Criação de torneios, inscrições integradas e geração automática de chaves de luta (Regra do "Bye").
3. **Financeiro e Comercial:** Registro de pagamentos de anuidades e gestão de patrocinadores.
4. **Vitrine Pública:** Landing page com ranking estadual e calendário de competições aberto ao público.

## 💻 Como rodar o projeto localmente

### Pré-requisitos
Antes de começar, você precisará ter instalado em sua máquina:
* [JDK 21](https://adoptium.net/)
* [Node.js](https://nodejs.org/) (para o frontend)
* [PostgreSQL](https://www.postgresql.org/)
* [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/)

### 1. Clonando o repositório
```bash
git clone [https://github.com/SeuUsuario/POO_FMTTEMA.git](https://github.com/SeuUsuario/POO_FMTTEMA.git)
2. Configurando o Banco de Dados (PostgreSQL)
Crie um banco de dados local chamado fmttema_db.
No IntelliJ, configure as credenciais no arquivo src/main/resources/application.properties:

Properties
spring.datasource.url=jdbc:postgresql://localhost:5432/fmttema_db
spring.datasource.username=seu_usuario_postgres
spring.datasource.password=sua_senha
3. Rodando o Backend (Java)
Abra a pasta raiz do projeto no IntelliJ IDEA, espere o Maven baixar as dependências e execute a classe principal FmttemaApplication.java. A API rodará na porta 8080.

4. Rodando o Frontend (React)
Navegue até a pasta do frontend pelo terminal:

Bash
cd frontend
npm install
npm run dev
Acesse a aplicação no navegador em http://localhost:5173.
