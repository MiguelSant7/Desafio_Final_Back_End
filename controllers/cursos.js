const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { errorJson } = require('../utils/response');

// Criar curso
router.post('/', (req, res) => {
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
router.get('/', (req, res) => {
  db.all('SELECT * FROM cursos', [], (err, rows) => {
    if (err) return res.status(500).json(errorJson('Erro ao buscar cursos', 500));
    res.json(rows);
  });
});

// Buscar por id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM cursos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json(errorJson('Erro ao buscar curso', 500));
    if (!row) return res.status(404).json(errorJson('Curso não encontrado', 404));
    res.json(row);
  });
});

// Atualizar
router.put('/:id', (req, res) => {
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

// Deletar
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM cursos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json(errorJson('Erro ao deletar curso', 500));
    if (this.changes === 0) return res.status(404).json(errorJson('Curso não encontrado', 404));
    res.status(204).send();
  });
});

module.exports = router;
