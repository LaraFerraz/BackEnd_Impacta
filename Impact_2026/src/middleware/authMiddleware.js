const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'impacta-secret-key-2026';

/**
 * Middleware: Verifica autenticação JWT
 * Extrai token do header Authorization: Bearer <token>
 * Valida assinatura e expiração
 */
const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.status(401).json({ message: 'Erro ao verificar autenticação' });
  }
};

/**
 * Middleware: Verifica se usuário está acessando seus próprios dados
 * Usa req.usuario.id preenchido por autenticar()
 */
const autorizarProprio = (req, res, next) => {
  const idSolicitado = parseInt(req.params.id);
  const idAutenticado = req.usuario.id;

  if (idSolicitado !== idAutenticado) {
    return res.status(403).json({
      message: 'Você não tem permissão para acessar esses dados'
    });
  }

  next();
};

module.exports = {
  autenticar,
  autorizarProprio
};
