const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Cidade, TipoUsuario } = require('../middleware/models');
const { validarCadastro, validarLogin } = require('../validators/UserValidator');

const router = express.Router();

// Configuração JWT com validação segura
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const DEFAULT_JWT_SECRET = 'impacta-secret-key-2026-dev-only';
const ACTUAL_JWT_SECRET = JWT_SECRET || DEFAULT_JWT_SECRET;

// Avisar se usar valor padrão em desenvolvimento
if (!JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn(
    '⚠️  AVISO: JWT_SECRET não definida em authRoutes. Usando valor padrão (seguro apenas para desenvolvimento).'
  );
}

const gerarToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      nome: user.nome,
      tipo: user.tipo_usuario_id 
    },
    ACTUAL_JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const formatarUsuario = (user) => {
  const { senha, ...userData } = user.toJSON();
  return userData;
};

const buscarCidadeId = async (nomeCidade) => {
  if (!nomeCidade || !nomeCidade.trim()) {
    return null; // Sem cidade padrão
  }

  const cidade = await Cidade.findOne({
    where: { nome: nomeCidade.trim() }
  });

  return cidade ? cidade.id : null;
};

const tratarErroRegistro = (error, res) => {
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors?.[0]?.path || 'email';
    return res.status(409).json({
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} já está em uso`,
      field
    });
  }

  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
};

// POST /api/auth/register
router.post('/register', validarCadastro, async (req, res) => {
  try {
    const { nome, email, password, telefone, cidade, cpf } = req.body;

    // Verificar se email já existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ 
        message: 'Email já cadastrado',
        field: 'email'
      });
    }

    // Verificar se CPF já existe
    const cpfExistente = await Usuario.findOne({ where: { cpf } });
    if (cpfExistente) {
      return res.status(409).json({
        message: 'CPF já cadastrado',
        field: 'cpf'
      });
    }

    const cpfFinal = cpf && cpf.trim() ? cpf.trim() : null;

    const senhaHash = await bcrypt.hash(password, 10);
    const cidade_id = await buscarCidadeId(cidade);

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senhaHash,
      telefone: telefone.trim(),
      cidade_id,
      tipo_usuario_id: 2,
      cpf: cpfFinal
    });

    // Buscar usuário completo com relacionamentos
    const usuarioCompleto = await Usuario.findByPk(novoUsuario.id, {
      include: [
        { model: Cidade, as: 'cidade' },
        { model: TipoUsuario, as: 'tipo' }
      ]
    });

    const token = gerarToken(usuarioCompleto);

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      token,
      user: formatarUsuario(usuarioCompleto)
    });

  } catch (error) {
    tratarErroRegistro(error, res);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const usuario = await Usuario.findOne({ 
      where: { 
        email: email.toLowerCase().trim()
      },
      include: [
        { model: Cidade, as: 'cidade' },
        { model: TipoUsuario, as: 'tipo' }
      ]
    });

    if (!usuario) {
      return res.status(401).json({ 
        message: 'Email ou senha inválidos',
        field: 'email'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ 
        message: 'Email ou senha inválidos',
        field: 'password'
      });
    }

    // Gerar token
    const token = gerarToken(usuario);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: formatarUsuario(usuario)
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

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

    res.json({
      valid: true,
      user: formatarUsuario(usuario)
    });

  } catch (error) {
    res.status(401).json({ 
      valid: false,
      message: 'Token inválido' 
    });
  }
});

module.exports = router;