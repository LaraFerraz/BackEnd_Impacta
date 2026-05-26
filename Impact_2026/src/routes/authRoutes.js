const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Cidade, TipoUsuario } = require('../middleware/models');
const { validarCadastro, validarLogin } = require('../validators/UserValidator');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const DEFAULT_JWT_SECRET = 'impacta-secret-key-2026-dev-only';
const ACTUAL_JWT_SECRET = JWT_SECRET || DEFAULT_JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn(
    'AVISO: JWT_SECRET não definida em authRoutes. Usando valor padrão (seguro apenas para desenvolvimento).'
  );
}

// Helpers utilitários isolados
const gerarToken = (user) => jwt.sign(
  { 
    id: user.id, 
    email: user.email,
    nome: user.nome,
    tipo: user.tipo_usuario_id 
  },
  ACTUAL_JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);

const formatarUsuario = (user) => {
  const { senha, ...userData } = user.toJSON();
  return userData;
};

const buscarCidadeId = async (nomeCidade) => {
  if (!nomeCidade?.trim()) return null;

  const cidade = await Cidade.findOne({
    where: { nome: nomeCidade.trim() }
  });

  return cidade?.id || null;
};

// POST /api/auth/register
router.post('/register', validarCadastro, async (req, res, next) => {
  try {
    const { nome, email, password, telefone, cidade, cpf } = req.body;

    const senhaHash = await bcrypt.hash(password, 10);
    const cidade_id = await buscarCidadeId(cidade);
    const cpfFinal = cpf?.trim() || null;

    // Criamos diretamente. Se e-mail ou CPF existirem, o Sequelize dispara um
    // SequelizeUniqueConstraintError capturado perfeitamente pelo seu Error Handler.
    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senhaHash,
      telefone: telefone.trim(),
      cidade_id,
      tipo_usuario_id: 2, // Cliente por padrão
      cpf: cpfFinal
    });

    const usuarioCompleto = await Usuario.findByPk(novoUsuario.id, {
      include: [
        { model: Cidade, as: 'cidade' },
        { model: TipoUsuario, as: 'tipo' }
      ]
    });

    const token = gerarToken(usuarioCompleto);

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      token,
      user: formatarUsuario(usuarioCompleto)
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/auth/login
router.post('/login', validarLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ 
      where: { email: email.toLowerCase().trim() },
      include: [
        { model: Cidade, as: 'cidade' },
        { model: TipoUsuario, as: 'tipo' }
      ]
    });

    if (!usuario) {
      return res.status(401).json({ 
        message: 'Email ou senha inválidos',
        code: 'AUTHENTICATION_ERROR'
      });
    }

    const senhaValida = await bcrypt.compare(password, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ 
        message: 'Email ou senha inválidos',
        code: 'AUTHENTICATION_ERROR'
      });
    }

    const token = gerarToken(usuario);

    return res.json({
      message: 'Login realizado com sucesso',
      token,
      user: formatarUsuario(usuario)
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ACTUAL_JWT_SECRET);
    
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [
        { model: Cidade, as: 'cidade' },
        { model: TipoUsuario, as: 'tipo' }
      ]
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    return res.json({
      valid: true,
      user: formatarUsuario(usuario)
    });
  } catch (error) {
    // Erros de token expirado ou malformado disparados pelo jwt.verify
    // caem aqui e retornam um formato padrão seguro.
    return res.status(401).json({ 
      valid: false,
      message: 'Token inválido ou expirado' 
    });
  }
});

module.exports = router;
