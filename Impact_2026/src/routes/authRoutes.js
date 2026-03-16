const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Cidade, Tipo_usuario } = require('../models');
const { validarCadastro, validarLogin } = require('../validators/UserValidator');

const router = express.Router();

// Configuração JWT
const JWT_SECRET = process.env.JWT_SECRET || 'impacta-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const gerarToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      nome: user.nome,
      tipo: user.tipo_usuario_id 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const formatarUsuario = (user) => {
  const { senha, ...userData } = user.toJSON();
  return userData;
};

const gerarCPFValido = () => {
  // Gera um CPF válido aleatório para quando o usuário não fornece
  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10).toString();
  }
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  digit1 = digit1 >= 10 ? 0 : digit1;
  
  // Calcula segundo dígito verificador
  cpf += digit1.toString();
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  digit2 = digit2 >= 10 ? 0 : digit2;
  
  return cpf + digit2.toString();
};

const buscarCidadeId = async (nomeCidade) => {
  if (!nomeCidade || !nomeCidade.trim()) {
    return 1; // São Paulo padrão
  }

  const cidade = await Cidade.findOne({
    where: { nome: nomeCidade.trim() }
  });

  return cidade ? cidade.id : 1;
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
router.post('/register', async (req, res) => {
  try {
    const { nome, email, password, telefone, cidade, interesses, cpf } = req.body;

    // Validar campos obrigatórios
    if (!nome || !email || !password || !telefone) {
      return res.status(400).json({
        message: 'Nome, email, senha e telefone são obrigatórios',
        field: 'form'
      });
    }

    // Verificar se email já existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ 
        message: 'Email já cadastrado',
        field: 'email'
      });
    }

    // Usar CPF fornecido ou gerar um novo
    const cpfFinal = cpf && cpf.trim() ? cpf.trim() : gerarCPFValido();

    const senhaHash = await bcrypt.hash(password, 10);
    const cidade_id = await buscarCidadeId(cidade);

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senhaHash,
      telefone: telefone.trim(),
      cidade_id,
      tipo_usuario_id: 2,
      cpf: cpfFinal,
      interesses: interesses ? JSON.stringify(interesses) : null,
      data_cadastro: new Date(),
      ativo: true
    });

    // Buscar usuário completo com relacionamentos
    const usuarioCompleto = await Usuario.findByPk(novoUsuario.id, {
      include: [
        { model: Cidade, as: 'cidade' },
        { model: Tipo_usuario, as: 'tipo' }
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
        { model: Tipo_usuario, as: 'tipo' }
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

    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [
        { model: Cidade, as: 'cidade' },
        { model: Tipo_usuario, as: 'tipo' }
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