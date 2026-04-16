require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./middleware/models');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3005'
];

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS não permitido'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor rodando',
    timestamp: new Date().toISOString()
  });
});

// ROTAS (SEMPRE carregadas, inclusive nos testes)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/paises', require('./routes/paisesRoutes'));
app.use('/api/estados', require('./routes/estadosRoutes'));
app.use('/api/cidades', require('./routes/cidadesRoutes'));
app.use('/api/tipos-usuario', require('./routes/tiposUsuarioRoutes'));
app.use('/api/categorias', require('./routes/categoriasRoutes'));
app.use('/api/projetos', require('./routes/projetosRoutes'));
app.use('/api/info-campanha', require('./routes/infoCampanhaRoutes'));
app.use('/api/preferencias', require('./routes/preferenciasRoutes'));
app.use('/api/participacoes', require('./routes/participacoesRoutes'));
app.use('/api/avaliacoes', require('./routes/avaliacoesRoutes'));
app.use('/api/favoritos', require('./routes/favoritosRoutes'));
app.use('/api/servicos', require('./routes/servicosDisponiveisRoutes'));

// Error handler centralizado
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// 🚀 Inicialização do servidor (NÃO roda em teste)
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

//  evita rodar servidor no Jest
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;