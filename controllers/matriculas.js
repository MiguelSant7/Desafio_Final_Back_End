const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { errorJson } = require('../utils/response');

// Criar matricula (POST /matriculas)
router.post('/matriculas', (req, res) => {
  const { aluno_id, curso_id } = req.body || {};
  if (!aluno_id || !curso_id) return res.status(400).json(errorJson('aluno_id e curso_id são obrigatórios', 400));

  db.get('SELECT * FROM alunos WHERE id = ?', [aluno_id], (err, aluno) => {
    if (err) return res.status(500).json(errorJson('Erro ao verificar aluno', 500));
    if (!aluno) return res.status(404).json(errorJson('Aluno não encontrado', 404));

    db.get('SELECT * FROM cursos WHERE id = ?', [curso_id], (err2, curso) => {
      if (err2) return res.status(500).json(errorJson('Erro ao verificar curso', 500));
      if (!curso) return res.status(404).json(errorJson('Curso não encontrado', 404));

      db.get(
        "SELECT COUNT(*) as cnt FROM matriculas WHERE aluno_id = ? AND status = 'ativa'",
        [aluno_id],
        (err3, row) => {
          if (err3) return res.status(500).json(errorJson('Erro ao verificar matriculas', 500));
          if (row.cnt >= 5) return res.status(400).json(errorJson('Aluno já possui 5 matriculas ativas', 400));

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
              res.status(201).json({ id: this.lastID, aluno_id, curso_id, status: 'ativa' });
            }
          );
        }
      );
    });
  });
});

// Cancelar matrícula (PATCH /matriculas/:id/cancelar)
router.patch('/matriculas/:id/cancelar', (req, res) => {
  const id = req.params.id;
  db.run("UPDATE matriculas SET status = 'cancelada' WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao cancelar matricula', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Matricula não encontrada', 404));
    res.json({ id: Number(id), status: 'cancelada' });
  });
});

// Concluir matrícula (PATCH /matriculas/:id/concluir)
router.patch('/matriculas/:id/concluir', (req, res) => {
  const id = req.params.id;
  db.run("UPDATE matriculas SET status = 'concluida' WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao concluir matricula', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Matricula não encontrada', 404));
    res.json({ id: Number(id), status: 'concluida' });
  });
});

// Listar cursos de um aluno
router.get('/alunos/:id/cursos', (req, res) => {
  const alunoId = req.params.id;
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

// Listar alunos de um curso
router.get('/cursos/:id/alunos', (req, res) => {
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

module.exports = router;
