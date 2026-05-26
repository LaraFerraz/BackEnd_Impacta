const express = require('express');
const bcrypt = require('bcryptjs');
const { Usuario, Cidade, TipoUsuario } = require('../middleware/models');
const { validarAtualizacao } = require('../validators/UserValidator');
const { autenticar, autorizarProprio } = require('../middleware/authMiddleware');

const router = express.Router();

const ITEMS_POR_PAGINA = 10;
const ATRIB_PUBLICOS = ['id', 'nome', 'email', 'telefone', 'data_criacao'];
const ATRIB_COMPLETOS = ['id', 'nome', 'email', 'cpf', 'telefone', 'data_criacao'];

const extrairPaginacao = (pagina) => {
  const parsedPage = Math.max(1, parseInt(pagina, 10) || 1);
  return { 
    limit: ITEMS_POR_PAGINA, 
    offset: (parsedPage - 1) * ITEMS_POR_PAGINA,
    page: parsedPage 
  };
};

// GET /api/usuarios - Listar usuários de forma resumida (Público)
router.get('/', async (req, res, next) => {
  try {
    const paginacao = extrairPaginacao(req.query.page);

    const { count, rows } = await Usuario.findAndCountAll({
      attributes: ATRIB_PUBLICOS,
      include: [
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: TipoUsuario, as: 'tipo', attributes: ['id', 'nome'] }
      ],
      order: [['data_criacao', 'DESC']],
      limit: paginacao.limit,
      offset: paginacao.offset
    });

    const totalPaginas = Math.ceil(count / ITEMS_POR_PAGINA);

    return res.json({
      data: rows,
      pagination: {
        pagina_atual: paginacao.page,
        total_paginas: totalPaginas,
        total: count
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/usuarios/:id - Buscar dados públicos de um usuário específico
router.get('/:id', async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ATRIB_PUBLICOS,
      include: [
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: TipoUsuario, as: 'tipo', attributes: ['id', 'nome'] }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: usuario });
  } catch (error) {
    return next(error);
  }
});

// GET /api/usuarios/:id/profile - Buscar dados privados e completos do perfil do próprio usuário
router.get('/:id/profile', autenticar, autorizarProprio, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ATRIB_COMPLETOS,
      include: [
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: TipoUsuario, as: 'tipo', attributes: ['id', 'nome'] }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: usuario });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/usuarios/:id - Atualizar dados cadastrais (Dono da conta)
router.put('/:id', autenticar, autorizarProprio, validarAtualizacao, async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Executa as mutações higienizadas no modelo
    await atualizarDadosUsuario(usuario, req.body);

    const usuarioAtualizado = await Usuario.findByPk(id, {
      attributes: ATRIB_COMPLETOS,
      include: [
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: TipoUsuario, as: 'tipo', attributes: ['id', 'nome'] }
      ]
    });

    return res.json({
      message: 'Perfil atualizado com sucesso',
      data: usuarioAtualizado
    });
  } catch (error) {
    return next(error); // Erros de validação e UniqueConstraint do Sequelize caem aqui e são interceptados pelo errorHandler global
  }
});

// DELETE /api/usuarios/:id - Excluir conta (Dono da conta)
router.delete('/:id', autenticar, autorizarProprio, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Executa a exclusão definitiva do registro
    await usuario.destroy();

    return res.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    return next(error);
  }
});

// ============================================
// Funções Auxiliares de Escopo Interno
// ============================================

const atualizarDadosUsuario = async (usuario, dados) => {
  const atualizacao = {};

  if (dados.nome) atualizacao.nome = dados.nome.trim();
  if (dados.telefone) atualizacao.telefone = dados.telefone.trim();
  if (dados.cpf) atualizacao.cpf = dados.cpf.replace(/\D/g, '');
  if (dados.cidade_id) atualizacao.cidade_id = parseInt(dados.cidade_id, 10);

  if (dados.password && dados.password.trim()) {
    atualizacao.senha = await bcrypt.hash(dados.password, 10);
  }

  await usuario.update(atualizacao);
};

module.exports = router;

