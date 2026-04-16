/**
 * Error Handler Middleware - Centraliza tratamento de erros no Backend
 * Evita duplicação de lógica em múltiplas rotas
 * 
 * Uso nas rotas:
 * router.post('/endpoint', validador, async (req, res, next) => {
 *   try {
 *     // sua lógica
 *   } catch (error) {
 *     next(error);  // passa para o error handler
 *   }
 * });
 */

const handleSequelizeValidationError = (error, res) => {
  const errors = error.errors.map(err => ({
    field: err.path,
    message: `❌ ${err.message}`,
    problema: err.message,
    type: err.type
  }));

  return res.status(400).json({
    message: 'Erro de validação do banco de dados',
    errors,
    code: 'SEQUELIZE_VALIDATION_ERROR'
  });
};

const handleSequelizeUniqueConstraintError = (error, res) => {
  const field = error.fields?.[0] || error.path;
  const message = `${field} já está registrado no sistema`;

  return res.status(409).json({
    message: 'Erro de unicidade',
    error: {
      field,
      message: `❌ ${message}`,
      code: 'UNIQUE_CONSTRAINT_VIOLATION'
    }
  });
};

const handleSequelizeForeignKeyConstraintError = (error, res) => {
  return res.status(400).json({
    message: 'Erro de referência no banco de dados',
    error: {
      message: '❌ Um ou mais registros relacionados não foram encontrados',
      code: 'FOREIGN_KEY_CONSTRAINT_ERROR'
    }
  });
};

const handleSequelizeBaseError = (error, res) => {
  return res.status(500).json({
    message: 'Erro no banco de dados',
    error: {
      message: `❌ ${error.message}`,
      code: 'DATABASE_ERROR'
    }
  });
};

const handleAuthenticationError = (error, res) => {
  return res.status(401).json({
    message: 'Erro de autenticação',
    error: {
      message: '❌ Credenciais inválidas ou token expirado',
      code: 'AUTHENTICATION_ERROR'
    }
  });
};

const handleAuthorizationError = (error, res) => {
  return res.status(403).json({
    message: 'Acesso negado',
    error: {
      message: '❌ Você não tem permissão para acessar este recurso',
      code: 'AUTHORIZATION_ERROR'
    }
  });
};

const handleNotFoundError = (error, res) => {
  return res.status(404).json({
    message: 'Recurso não encontrado',
    error: {
      message: '❌ O recurso solicitado não existe',
      code: 'NOT_FOUND_ERROR'
    }
  });
};

const handleValidationError = (error, res) => {
  return res.status(400).json({
    message: 'Dados inválidos',
    error: {
      message: `❌ ${error.message}`,
      code: 'VALIDATION_ERROR'
    }
  });
};

/**
 * Middleware centralizado de erro
 * Deve ser usado após todas as outras rotas
 * app.use(errorHandler);
 */
const errorHandler = (error, req, res, next) => {
  // Log do erro (em produção, usar logger apropriado)
  console.error(`[ERROR] ${new Date().toISOString()} - ${error.message}`, error.stack);

  // Erros do Sequelize
  if (error.name === 'SequelizeValidationError') {
    return handleSequelizeValidationError(error, res);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return handleSequelizeUniqueConstraintError(error, res);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return handleSequelizeForeignKeyConstraintError(error, res);
  }

  if (error.name && error.name.includes('Sequelize')) {
    return handleSequelizeBaseError(error, res);
  }

  // Erros customizados
  if (error.code === 'AUTHENTICATION_ERROR') {
    return handleAuthenticationError(error, res);
  }

  if (error.code === 'AUTHORIZATION_ERROR') {
    return handleAuthorizationError(error, res);
  }

  if (error.code === 'NOT_FOUND') {
    return handleNotFoundError(error, res);
  }

  if (error.code === 'VALIDATION_ERROR') {
    return handleValidationError(error, res);
  }

  // Erro genérico
  return res.status(error.statusCode || 500).json({
    message: 'Erro interno do servidor',
    error: {
      message: process.env.NODE_ENV === 'development' ? error.message : '❌ Algo deu errado',
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
};

module.exports = errorHandler;
