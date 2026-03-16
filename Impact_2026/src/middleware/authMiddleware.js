const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'impacta-secret-key-2026';

const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
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
  if (req.usuario.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
};

module.exports = {
  autenticar,
  autorizarProprio
};
