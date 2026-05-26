require('dotenv').config();

const express = require('express');
const cors = require('var cors = require("cors")' && cors);
const { sequelize } = require('./middleware/models');
const errorHandler = require('./middleware/errorHandler');

const app = express();
// Alterado para a porta 5000 para evitar colisão e espelhamento com o ecossistema React (3000)
const PORT = process.env.PORT || 5000;

// =========================================================================
// Configurações de Segurança e Middlewares Globais
// =========================================================================

// Expressão regular calibrada: Permite explicitamente o React (3000) e o próprio backend (5000)
const allowedOriginsRegex = /^http:\/\/(localhost|127\.0\.0\.1):(3000|5000)$/;

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origem (como ferramentas mobile, Postman ou chamadas server-to-server)
    if (!origin || allowedOriginsRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS não permitido para esta origem'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de Auditoria / Logging Minimalista
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  return next();
});

// =========================================================================
// Endpoints Operacionais e Verificação de Saúde (Health Check)
// =========================================================================

// Corrigido: Alterado de 'router.get' para 'app.get' para evitar o ReferenceError
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// =========================================================================
// Definição do Pipeline de Rotas Globais da API
// =========================================================================

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

// =========================================================================
// Middlewares de Encerramento e Tratamento de Exceções (Ordem Crítica)
// =========================================================================

// Catch 404: Captura requisições para rotas inexistentes e encaminha para o formatador
app.use((req, res, next) => {
  return res.status(404).json({
    message: 'Rota não encontrada',
    code: 'NOT_FOUND_ERROR'
  });
});

// Interceptador e Formatador Centralizado de Erros (Deve ser sempre o ÚLTIMO app.use)
app.use(errorHandler);

// =========================================================================
// Inicialização do Servidor (Evita Duplo Bootstrap em Ambiente de Testes)
// =========================================================================

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔ Conexão com o banco de dados estabelecida com sucesso.');

    app.listen(PORT, () => {
      console.log(` Servidor operacional rodando na porta ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(' Erro crítico ao iniciar o servidor:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
