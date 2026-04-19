// Importa o driver do sqlite3 e o módulo path para resolver locais de arquivo
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do arquivo do banco (ficará em database.sqlite na pasta do projeto)
const DB_PATH = path.resolve(__dirname, 'database.sqlite');

// Abre (ou cria) o arquivo do banco SQLite
// Nota: aqui não usamos promessas pra manter o código simples, só callback
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    // Se der erro ao abrir, mostramos e encerramos — num app real talvez tentássemos recuperar
    console.error('Erro ao abrir o banco de dados', err.message);
    process.exit(1);
  }
});

// Cria as tabelas automaticamente se não existirem.
// Uso db.serialize para garantir que as criações aconteçam em sequência.
db.serialize(() => {
  // Tabela de alunos: id, nome e email (email único)
  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `);

  // Tabela de cursos: id e titulo
  db.run(`
    CREATE TABLE IF NOT EXISTS cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL
    );
  `);

  // Tabela de matriculas: referencia aluno e curso, e um status
  // UNIQUE(aluno_id, curso_id) evita matriculas duplicadas
  // ON DELETE CASCADE faz com que, se um aluno/curso for removido, suas matriculas sejam removidas também
  db.run(`
    CREATE TABLE IF NOT EXISTS matriculas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      curso_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'ativa',
      FOREIGN KEY(aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
      FOREIGN KEY(curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
      UNIQUE(aluno_id, curso_id)
    );
  `);
});

// Exporta o objeto db para ser usado pelo servidor (index.js)
module.exports = db;
