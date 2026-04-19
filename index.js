// Dependências: express e o arquivo local database.js que exporta o db SQLite
const express = require('express');
const db = require('./database');

// Cria o app Express e habilita o parser JSON do body
const app = express();
app.use(express.json());

// Porta padrão 3000 pra facilitar (pode ser alterada via variável de ambiente)
const PORT = process.env.PORT || 3000;

// Função utilitária pra formatar erros no JSON exigido pelo enunciado
function errorJson(message, status = 400) {
  return { error: message, statusCode: status };
}

// ---------- Alunos CRUD ----------
// Criar aluno: valida nome e email, e trata erro de email duplicado
app.post('/alunos', (req, res) => {
  const { nome, email } = req.body || {};
  // Validação simples: campos obrigatórios e não vazios
  if (!nome || !email || String(nome).trim() === '' || String(email).trim() === '') {
    return res.status(400).json(errorJson('nome e email são obrigatórios', 400));
  }

  const sql = 'INSERT INTO alunos (nome, email) VALUES (?, ?)';
  // Usamos db.run com função callback pra obter lastID
  db.run(sql, [nome.trim(), email.trim()], function (err) {
    if (err) {
      // Se o erro vier do UNIQUE do email, devolvemos mensagem amigável
      if (err.message && err.message.includes('UNIQUE')) {
        return res.status(400).json(errorJson('email já cadastrado', 400));
      }
      return res.status(500).json(errorJson('Erro ao criar aluno', 500));
    }
    // this.lastID contém o id criado pelo SQLite
    const created = { id: this.lastID, nome: nome.trim(), email: email.trim() };
    res.status(201).json(created);
  });
});

// Listar todos os alunos
app.get('/alunos', (req, res) => {
  db.all('SELECT * FROM alunos', [], (err, rows) => {
    if (err) return res.status(500).json(errorJson('Erro ao buscar alunos', 500));
    res.json(rows);
  });
});

// Buscar aluno por id
app.get('/alunos/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM alunos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json(errorJson('Erro ao buscar aluno', 500));
    if (!row) return res.status(404).json(errorJson('Aluno não encontrado', 404));
    res.json(row);
  });
});

// Atualizar aluno: nome e email obrigatórios
app.put('/alunos/:id', (req, res) => {
  const id = req.params.id;
  const { nome, email } = req.body || {};
  if (!nome || !email || String(nome).trim() === '' || String(email).trim() === '') {
    return res.status(400).json(errorJson('nome e email são obrigatórios', 400));
  }
  db.run(
    'UPDATE alunos SET nome = ?, email = ? WHERE id = ?',
    [nome.trim(), email.trim(), id],
    function (err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE')) {
          return res.status(400).json(errorJson('email já cadastrado', 400));
        }
        return res.status(500).json(errorJson('Erro ao atualizar aluno', 500));
      }
      if (this.changes === 0) return res.status(404).json(errorJson('Aluno não encontrado', 404));
      res.json({ id: Number(id), nome: nome.trim(), email: email.trim() });
    }
  );
});

// Deletar aluno — se o id não existir, retorna 404
app.delete('/alunos/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM alunos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao deletar aluno', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Aluno não encontrado', 404));
    // 204 No Content quando deletado com sucesso
    res.status(204).send();
  });
});

// ---------- Cursos CRUD ----------
// Criar curso
app.post('/cursos', (req, res) => {
  const { titulo } = req.body || {};
  if (!titulo || String(titulo).trim() === '') {
    return res.status(400).json(errorJson('titulo é obrigatório', 400));
  }
  const sql = 'INSERT INTO cursos (titulo) VALUES (?)';
  db.run(sql, [titulo.trim()], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao criar curso', 500));
    res.status(201).json({ id: this.lastID, titulo: titulo.trim() });
  });
});

// Listar cursos
app.get('/cursos', (req, res) => {
  db.all('SELECT * FROM cursos', [], (err, rows) => {
    if (err) return res.status(500).json(errorJson('Erro ao buscar cursos', 500));
    res.json(rows);
  });
});

// Buscar curso por id
app.get('/cursos/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM cursos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json(errorJson('Erro ao buscar curso', 500));
    if (!row) return res.status(404).json(errorJson('Curso não encontrado', 404));
    res.json(row);
  });
});

// Atualizar curso
app.put('/cursos/:id', (req, res) => {
  const id = req.params.id;
  const { titulo } = req.body || {};
  if (!titulo || String(titulo).trim() === '') {
    return res.status(400).json(errorJson('titulo é obrigatório', 400));
  }
  db.run('UPDATE cursos SET titulo = ? WHERE id = ?', [titulo.trim(), id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao atualizar curso', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Curso não encontrado', 404));
    res.json({ id: Number(id), titulo: titulo.trim() });
  });
});

// Deletar curso
app.delete('/cursos/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM cursos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao deletar curso', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Curso não encontrado', 404));
    res.status(204).send();
  });
});

// ---------- Matrículas ----------
// Criar matricula: valida aluno/curso e regras de negócio
app.post('/matriculas', (req, res) => {
  const { aluno_id, curso_id } = req.body || {};
  if (!aluno_id || !curso_id) return res.status(400).json(errorJson('aluno_id e curso_id são obrigatórios', 400));

  // 1) Verifica se o aluno existe
  db.get('SELECT * FROM alunos WHERE id = ?', [aluno_id], (err, aluno) => {
    if (err) return res.status(500).json(errorJson('Erro ao verificar aluno', 500));
    if (!aluno) return res.status(404).json(errorJson('Aluno não encontrado', 404));

    // 2) Verifica se o curso existe
    db.get('SELECT * FROM cursos WHERE id = ?', [curso_id], (err2, curso) => {
      if (err2) return res.status(500).json(errorJson('Erro ao verificar curso', 500));
      if (!curso) return res.status(404).json(errorJson('Curso não encontrado', 404));

      // 3) Conta quantas matriculas ativas o aluno já tem
      db.get(
        "SELECT COUNT(*) as cnt FROM matriculas WHERE aluno_id = ? AND status = 'ativa'",
        [aluno_id],
        (err3, row) => {
          if (err3) return res.status(500).json(errorJson('Erro ao verificar matriculas', 500));
          // Se já tiver 5 ou mais ativas, não permite nova matrícula
          if (row.cnt >= 5) return res.status(400).json(errorJson('Aluno já possui 5 matriculas ativas', 400));

          // 4) Insere a matrícula
          // A constraint UNIQUE(aluno_id, curso_id) evita duplicatas; tratamos o erro abaixo
          db.run(
            'INSERT INTO matriculas (aluno_id, curso_id) VALUES (?, ?)',
            [aluno_id, curso_id],
            function (err4) {
              if (err4) {
                if (err4.message && err4.message.includes('UNIQUE')) {
                  return res.status(400).json(errorJson('Matricula duplicada', 400));
                }
                return res.status(500).json(errorJson('Erro ao criar matricula', 500));
              }
              // Retorna a matrícula criada (status por padrão é 'ativa')
              res.status(201).json({ id: this.lastID, aluno_id, curso_id, status: 'ativa' });
            }
          );
        }
      );
    });
  });
});

// Listar cursos de um aluno (com status da matrícula)
app.get('/alunos/:id/cursos', (req, res) => {
  const alunoId = req.params.id;
  // Verifica primeiro se o aluno existe pra retornar 404 se for o caso
  db.get('SELECT * FROM alunos WHERE id = ?', [alunoId], (err, aluno) => {
    if (err) return res.status(500).json(errorJson('Erro ao verificar aluno', 500));
    if (!aluno) return res.status(404).json(errorJson('Aluno não encontrado', 404));

    const sql = `
      SELECT m.id as matricula_id, c.id as curso_id, c.titulo, m.status
      FROM matriculas m
      JOIN cursos c ON m.curso_id = c.id
      WHERE m.aluno_id = ?
    `;
    db.all(sql, [alunoId], (err2, rows) => {
      if (err2) return res.status(500).json(errorJson('Erro ao buscar cursos do aluno', 500));
      res.json(rows);
    });
  });
});

// Listar alunos de um curso (com status da matrícula)
app.get('/cursos/:id/alunos', (req, res) => {
  const cursoId = req.params.id;
  db.get('SELECT * FROM cursos WHERE id = ?', [cursoId], (err, curso) => {
    if (err) return res.status(500).json(errorJson('Erro ao verificar curso', 500));
    if (!curso) return res.status(404).json(errorJson('Curso não encontrado', 404));

    const sql = `
      SELECT m.id as matricula_id, a.id as aluno_id, a.nome, a.email, m.status
      FROM matriculas m
      JOIN alunos a ON m.aluno_id = a.id
      WHERE m.curso_id = ?
    `;
    db.all(sql, [cursoId], (err2, rows) => {
      if (err2) return res.status(500).json(errorJson('Erro ao buscar alunos do curso', 500));
      res.json(rows);
    });
  });
});

// Cancelar matrícula (atualiza status para 'cancelada')
app.patch('/matriculas/:id/cancelar', (req, res) => {
  const id = req.params.id;
  db.run("UPDATE matriculas SET status = 'cancelada' WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao cancelar matricula', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Matricula não encontrada', 404));
    res.json({ id: Number(id), status: 'cancelada' });
  });
});

// Concluir matrícula (atualiza status para 'concluida')
app.patch('/matriculas/:id/concluir', (req, res) => {
  const id = req.params.id;
  db.run("UPDATE matriculas SET status = 'concluida' WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao concluir matricula', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Matricula não encontrada', 404));
    res.json({ id: Number(id), status: 'concluida' });
  });
});

// Fallback 404 pra rotas não encontradas (retorna JSON no formato pedido)
app.use((req, res) => {
  res.status(404).json(errorJson('Rota não encontrada', 404));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
