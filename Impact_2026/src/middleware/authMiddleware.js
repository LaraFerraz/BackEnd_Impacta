const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

// Em produção, JWT_SECRET é obrigatório
if (isProduction && !JWT_SECRET) {
  throw new Error(
    'ERRO CRÍTICO: JWT_SECRET não está definida em variáveis de ambiente. ' +
    'Configure a variável JWT_SECRET no arquivo .env em produção.'
  );
}

// Em desenvolvimento, avisar se usar valor padrão
if (!JWT_SECRET && !isProduction) {
  console.warn(
    'AVISO: JWT_SECRET não definida. Usando valor padrão. ' +
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

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ACTUAL_SECRET);
    
    req.usuario = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    
    return res.status(401).json({ message: 'Token inválido' });
  }
};

const autorizarProprio = (req, res, next) => {
  const userId = req.usuario?.id;
  const paramId = req.params?.id;

  if (!userId || !paramId || String(userId) !== String(paramId)) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  return next();
};

module.exports = {
  autenticar,
  autorizarProprio
};
