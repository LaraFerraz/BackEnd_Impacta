/**
 * Error Handler Middleware - Centraliza tratamento de erros no Backend
 * Evita duplicação de lógica em múltiplas rotas
 */

const handleSequelizeValidationError = (error, res) => {
  const errors = error.errors.map(err => ({
    field: err.path,
    message: ` ${err.message}`,
    problema: err.message,
    type: err.type
  }));

  return res.status(400).json({
    message: 'Erro de validação do banco de dados',
    code: 'SEQUELIZE_VALIDATION_ERROR',
    errors
  });
};

const handleSequelizeUniqueConstraintError = (error, res) => {
  const field = error.fields?.[0] || error.path || 'campo';
  const message = `${field} já está registrado no sistema`;

  return res.status(409).json({
    message: 'Erro de unicidade',
    code: 'UNIQUE_CONSTRAINT_VIOLATION',
    errors: [{ field, message: ` ${message}` }]
  });
};

const handleSequelizeForeignKeyConstraintError = (error, res) => {
  return res.status(400).json({
    message: 'Erro de referência no banco de dados',
    code: 'FOREIGN_KEY_CONSTRAINT_ERROR',
    errors: [{ message: ' Um ou mais registros relacionados não foram encontrados' }]
  });
};

const handleSequelizeBaseError = (error, res) => {
  return res.status(500).json({
    message: 'Erro no banco de dados',
    code: 'DATABASE_ERROR',
    errors: [{ message: ` ${error.message}` }]
  });
};

const handleAuthenticationError = (error, res) => {
  return res.status(401).json({
    message: 'Erro de autenticação',
    code: 'AUTHENTICATION_ERROR',
    errors: [{ message: ' Credenciais inválidas ou token expirado' }]
  });
};

const handleAuthorizationError = (error, res) => {
  return res.status(403).json({
    message: 'Acesso negado',
    code: 'AUTHORIZATION_ERROR',
    errors: [{ message: ' Você não tem permissão para acessar este recurso' }]
  });
};

const handleNotFoundError = (error, res) => {
  return res.status(404).json({
    message: 'Recurso não encontrado',
    code: 'NOT_FOUND_ERROR',
    errors: [{ message: ' O recurso solicitado não existe' }]
  });
};

const handleValidationError = (error, res) => {
  return res.status(400).json({
    message: 'Dados inválidos',
    code: 'VALIDATION_ERROR',
    errors: [{ message: ` ${error.message}` }]
  });
};

/**
 * Middleware centralizado de erro
 * Deve ser colocado após todas as definições de rotas
 */
const errorHandler = (error, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log do erro (substituir por Winston / Pino em produção se necessário)
  console.error(`[ERROR] ${new Date().toISOString()} - ${error.message}`, error.stack);

  // Switch avaliativo para roteamento limpo dos manipuladores de erro
  switch (true) {
    case error.name === 'SequelizeValidationError':
      return handleSequelizeValidationError(error, res);

    case error.name === 'SequelizeUniqueConstraintError':
      return handleSequelizeUniqueConstraintError(error, res);

    case error.name === 'SequelizeForeignKeyConstraintError':
      return handleSequelizeForeignKeyConstraintError(error, res);

    case !!(error.name?.includes('Sequelize')):
      return handleSequelizeBaseError(error, res);

    case error.code === 'AUTHENTICATION_ERROR':
      return handleAuthenticationError(error, res);

    case error.code === 'AUTHORIZATION_ERROR':
      return handleAuthorizationError(error, res);

    case error.code === 'NOT_FOUND':
      return handleNotFoundError(error, res);

    case error.code === 'VALIDATION_ERROR':
      return handleValidationError(error, res);

    default:
      // Tratamento para Erro Genérico / Desconhecido
      return res.status(error.statusCode || 500).json({
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
        errors: [{ message: isDevelopment ? error.message : '❌ Algo deu errado' }]
      });
  }
};

module.exports = errorHandler;