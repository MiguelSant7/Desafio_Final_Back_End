const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { errorJson } = require('../utils/response');

// Criar aluno
router.post('/', (req, res) => {
  const { nome, email } = req.body || {};
  if (!nome || !email || String(nome).trim() === '' || String(email).trim() === '') {
    return res.status(400).json(errorJson('nome e email são obrigatórios', 400));
  }
  const sql = 'INSERT INTO alunos (nome, email) VALUES (?, ?)';
  db.run(sql, [nome.trim(), email.trim()], function (err) {
    if (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        return res.status(400).json(errorJson('email já cadastrado', 400));
      }
      return res.status(500).json(errorJson('Erro ao criar aluno', 500));
    }
    const created = { id: this.lastID, nome: nome.trim(), email: email.trim() };
    res.status(201).json(created);
  });
});

// Listar todos
router.get('/', (req, res) => {
  db.all('SELECT * FROM alunos', [], (err, rows) => {
    if (err) return res.status(500).json(errorJson('Erro ao buscar alunos', 500));
    res.json(rows);
  });
});

// Buscar por id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM alunos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json(errorJson('Erro ao buscar aluno', 500));
    if (!row) return res.status(404).json(errorJson('Aluno não encontrado', 404));
    res.json(row);
  });
});

// Atualizar
router.put('/:id', (req, res) => {
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

// Deletar
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM alunos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao deletar aluno', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Aluno não encontrado', 404));
    res.status(204).send();
  });
});

module.exports = router;
