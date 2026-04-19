# Desafio Final - API de Alunos, Cursos e Matrículas

API simples escrita em Node.js usando Express e SQLite. O objetivo deste repositório é apresentar uma API REST minimalista
para gerenciar alunos, cursos e matrículas, com regras de negócio básicas e validações.

Link Público para testes
- https://desafio-final-back-end-dths.onrender.com

Esta versão usa apenas duas entradas principais de código:
- `index.js` - servidor Express e todas as rotas
- `database.js` - inicialização do banco SQLite e criação automática das tabelas

Requisitos
- Node.js (versão LTS recomendada) e npm

Instalação e execução
1. Clone este repositório e entre na pasta do projeto.
2. Instale dependências:

```powershell
cd 'c:/caminho/para/o/projeto'
npm install
```

3. Inicie a API:

```powershell
npm start
```

Por padrão a API roda na porta 3000. Se quiser alterar a porta, defina a variável de ambiente `PORT` antes de iniciar.

Banco de dados
- O projeto cria automaticamente um arquivo `database.sqlite` na raiz do projeto quando iniciado.
- Para resetar o banco, pare o servidor e remova `database.sqlite` (na próxima inicialização as tabelas serão recriadas vazias).

Formato de erro
Todos os erros retornam JSON no formato:

```json
{
  "error": "mensagem",
  "statusCode": 400
}
```

Endpoints (resumo)

Alunos
- POST /alunos
  - Body JSON: { "nome": "Nome", "email": "usuario@ex.com" }
  - Validações: `nome` e `email` obrigatórios; `email` único; não aceita string vazia
- GET /alunos
- GET /alunos/:id
- PUT /alunos/:id
  - Body JSON: { "nome": "Novo Nome", "email": "novo@ex.com" }
- DELETE /alunos/:id

Cursos
- POST /cursos
  - Body JSON: { "titulo": "Titulo do Curso" }
- GET /cursos
- GET /cursos/:id
- PUT /cursos/:id
  - Body JSON: { "titulo": "Novo Titulo" }
- DELETE /cursos/:id

Matrículas
- POST /matriculas
  - Body JSON: { "aluno_id": 1, "curso_id": 2 }
  - Regras: verificar existência de aluno e curso; impedir matrícula duplicada; máximo de 5 matrículas ativas por aluno
- GET /alunos/:id/cursos — lista cursos do aluno (com status da matrícula)
- GET /cursos/:id/alunos — lista alunos de um curso (com status)
- PATCH /matriculas/:id/cancelar — atualiza status para 'cancelada'
- PATCH /matriculas/:id/concluir — atualiza status para 'concluida'

Regras de negócio importantes
- Não é permitida matrícula duplicada (mesmo `aluno_id` e `curso_id`).
- Um aluno pode ter no máximo 5 matrículas com status `ativa`.
- Não é possível matricular se o aluno ou o curso não existirem (retorna 404).

Exemplos de uso (PowerShell)

- Criar um aluno:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/alunos -Body (@{nome='Alice';email='alice@example.com'} | ConvertTo-Json) -ContentType 'application/json'
```

- Criar um curso:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/cursos -Body (@{titulo='Matematica'} | ConvertTo-Json) -ContentType 'application/json'
```

- Matricular um aluno em um curso:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/matriculas -Body (@{aluno_id=1;curso_id=1} | ConvertTo-Json) -ContentType 'application/json'
```

Exemplos equivalentes com curl (Linux/macOS/Windows com curl)

```bash
curl -X POST http://localhost:3000/alunos -H 'Content-Type: application/json' -d '{"nome":"Alice","email":"alice@example.com"}'
curl -X POST http://localhost:3000/cursos -H 'Content-Type: application/json' -d '{"titulo":"Matematica"}'
curl -X POST http://localhost:3000/matriculas -H 'Content-Type: application/json' -d '{"aluno_id":1,"curso_id":1}'
```

