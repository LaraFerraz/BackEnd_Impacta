const jwt = require('jsonwebtoken');

// Validação segura do JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

// Em produção, JWT_SECRET é obrigatório
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error(
    'ERRO CRÍTICO: JWT_SECRET não está definida em variáveis de ambiente. ' +
    'Configure a variável JWT_SECRET no arquivo .env em produção.'
  );
}

// Em desenvolvimento, avisar se usar valor padrão
if (!JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn(
    ' AVISO: JWT_SECRET não definida. Usando valor padrão' +
    'Configure a variável JWT_SECRET no arquivo .env.'
  );
}

const DEFAULT_JWT_SECRET = 'impacta-secret-key-2026-dev-only';
const ACTUAL_SECRET = JWT_SECRET || DEFAULT_JWT_SECRET;

const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, ACTUAL_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    res.status(401).json({ message: 'Token inválido' });
  }
};

const autorizarProprio = (req, res, next) => {
  const userId = req.usuario && req.usuario.id;
  const paramId = req.params && req.params.id;

  if (!userId || !paramId || userId != paramId) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  return next();
};

module.exports = {
  autenticar,
  autorizarProprio
};
