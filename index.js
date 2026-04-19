// Arquivo principal do servidor: monta routers e inicia o app
const express = require('express');

// Importa o DB para garantir que as tabelas sejam criadas ao iniciar
const db = require('./db/database');

const alunosRouter = require('./controllers/alunos');
const cursosRouter = require('./controllers/cursos');
const matriculasRouter = require('./controllers/matriculas');

const app = express();
app.use(express.json());

// Servir arquivos estáticos (pasta public) para uma landing page amigável
app.use(express.static('public'));

// Porta padrão (usamos process.env.PORT para compatibilidade com PaaS)
const PORT = process.env.PORT || 3000;

// Monta routers organizados por pasta
app.use('/alunos', alunosRouter);
app.use('/cursos', cursosRouter);
// O controller de matriculas usa rotas que começam com /alunos/:id/cursos e /cursos/:id/alunos
// por isso o montamos na raiz
app.use('/', matriculasRouter);

// Rota root simples
app.get('/', (req, res) => {
  // Serve o HTML mais amigável na raiz (se existir em public/index.html)
  res.sendFile('index.html', { root: 'public' });
});

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', statusCode: 404 });
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
