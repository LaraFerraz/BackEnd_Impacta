const express = require('express');
const bcrypt = require('bcryptjs');
const { Usuario, Cidade, Tipo_usuario } = require('../models');
const { validarAtualizacao } = require('../validators/UserValidator');
const { autenticar, autorizarProprio } = require('../middleware/authMiddleware');

const router = express.Router();

const ITEMS_POR_PAGINA = 10;
const ATRIB_PUBLICOS = ['id', 'nome', 'email', 'telefone', 'data_cadastro'];
const ATRIB_COMPLETOS = ['id', 'nome', 'email', 'cpf', 'telefone', 'interesses', 'data_cadastro'];

const extrairPaginacao = (pagina) => {
  const pp = Math.max(1, parseInt(pagina) || 1);
  return { limit: ITEMS_POR_PAGINA, offset: (pp - 1) * ITEMS_POR_PAGINA };
};

router.get('/', async (req, res) => {
  try {
    const paginacao = extrairPaginacao(req.query.page);

    const { count, rows } = await Usuario.findAndCountAll({
      where: { ativo: true },
      attributes: ATRIB_PUBLICOS,
      include: [
        { model: Cidade, as: 'cidade', attributes: ['nome'] },
        { model: Tipo_usuario, as: 'tipo', attributes: ['nome'] }
      ],
      order: [['data_cadastro', 'DESC']],
      ...paginacao
    });

    const totalPaginas = Math.ceil(count / ITEMS_POR_PAGINA);
    const paginaAtual = Math.floor(paginacao.offset / ITEMS_POR_PAGINA) + 1;

    res.json({
      dados: rows,
      paginacao: { paginaAtual, totalPaginas, total: count }
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      message: 'Erro ao listar usuários',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ATRIB_PUBLICOS,
      include: [
        { model: Cidade, as: 'cidade', attributes: ['nome'] },
        { model: Tipo_usuario, as: 'tipo', attributes: ['nome'] }
      ]
    });

    if (!usuario || !usuario.ativo) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(usuario);

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      message: 'Erro ao buscar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.get('/:id/profile', autenticar, autorizarProprio, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ATRIB_COMPLETOS,
      include: [
        { model: Cidade, as: 'cidade', attributes: ['nome'] },
        { model: Tipo_usuario, as: 'tipo', attributes: ['nome'] }
      ]
    });

    if (!usuario || !usuario.ativo) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(usuario);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      message: 'Erro ao buscar perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.put('/:id', autenticar, autorizarProprio, validarAtualizacao, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario || !usuario.ativo) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    await atualizarDadosUsuario(usuario, req.body);
    const usuarioAtualizado = await Usuario.findByPk(req.params.id, {
      attributes: ATRIB_COMPLETOS,
      include: [
        { model: Cidade, as: 'cidade' },
        { model: Tipo_usuario, as: 'tipo' }
      ]
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: usuarioAtualizado
    });

  } catch (error) {
    tratarErroAtualizacao(error, res);
  }
});

router.delete('/:id', autenticar, autorizarProprio, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    await usuario.update({ ativo: false });

    res.json({ message: 'Conta desativada com sucesso' });

  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      message: 'Erro ao desativar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

const atualizarDadosUsuario = async (usuario, dados) => {
  const atualizacao = {};

  if (dados.nome) atualizacao.nome = dados.nome.trim();
  if (dados.telefone) atualizacao.telefone = dados.telefone.trim();
  if (dados.cpf) atualizacao.cpf = dados.cpf.replace(/\D/g, '');
  if (dados.interesses) atualizacao.interesses = Array.isArray(dados.interesses) ? dados.interesses : [];

  if (dados.cidade && dados.cidade.trim()) {
    const cidade = await Cidade.findOne({ where: { nome: dados.cidade.trim() } });
    atualizacao.cidade_id = cidade ? cidade.id : usuario.cidade_id;
  }

  if (dados.password && dados.password.trim()) {
    atualizacao.senha = await bcrypt.hash(dados.password, 10);
  }

  await usuario.update(atualizacao);
};

const tratarErroAtualizacao = (error, res) => {
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
    const field = error.errors?.[0]?.path || 'campo';
    return res.status(409).json({
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} já está em uso`,
      field
    });
  }

  res.status(500).json({
    message: 'Erro ao atualizar usuário',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
};

module.exports = router;