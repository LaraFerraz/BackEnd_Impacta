const express = require('express');
const { Favoritos, Usuario, Projeto } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/favoritos/usuario/:usuario_id - Listar favoritos de um usuário específico
router.get('/usuario/:usuario_id', autenticar, async (req, res, next) => {
  try {
    const { usuario_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Garantir que um usuário comum só veja os seus próprios favoritos
    if (parseInt(usuario_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para visualizar os favoritos deste usuário' }]
      });
    }

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await Favoritos.findAndCountAll({
      where: { usuario_id },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'descricao', 'data_criacao'] }
      ],
      order: [['id', 'DESC']],
      limit: parsedLimit,
      offset
    });

    return res.json({
      data: rows,
      pagination: {
        total: count,
        pagina_atual: parsedPage,
        limite: parsedLimit,
        total_paginas: Math.ceil(count / parsedLimit)
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/favoritos/:id - Buscar favorito específico por ID
router.get('/:id', autenticar, async (req, res, next) => {
  try {
    const favorito = await Favoritos.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'descricao'] }
      ]
    });

    if (!favorito) {
      return res.status(404).json({
        message: 'Favorito não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede que outros usuários bisbilhotem o favorito alheio
    if (favorito.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para acessar este recurso' }]
      });
    }

    return res.json({ data: favorito });
  } catch (error) {
    return next(error);
  }
});

// POST /api/favoritos - Adicionar projeto aos favoritos
router.post('/', autenticar, async (req, res, next) => {
  try {
    const { usuario_id, projeto_id } = req.body;

    if (!usuario_id || !projeto_id) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Campos obrigatórios faltando: usuario_id, projeto_id' }]
      });
    }

    // Garante que o usuário do token está criando o favorito para si mesmo
    if (parseInt(usuario_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não pode criar favoritos para outra conta' }]
      });
    }

    // Criamos o favorito diretamente. Se o par (usuario_id, projeto_id) violar o índice 
    // unique do banco de dados, o Error Handler cuidará de enviar a mensagem amigável.
    const favorito = await Favoritos.create({ usuario_id, projeto_id });

    const favoritoCompleto = await Favoritos.findByPk(favorito.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'descricao'] }
      ]
    });

    return res.status(201).json({
      message: 'Projeto adicionado aos favoritos com sucesso',
      data: favoritoCompleto
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/favoritos/:id - Remover projeto dos favoritos por ID da tabela
router.delete('/:id', autenticar, async (req, res, next) => {
  try {
    const { id } = req.params;
    const favorito = await Favoritos.findByPk(id);

    if (!favorito) {
      return res.status(404).json({
        message: 'Favorito não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    if (favorito.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para remover este favorito' }]
      });
    }

    await favorito.destroy();
    return res.json({ message: 'Projeto removido dos favoritos com sucesso' });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/favoritos/usuario/:usuario_id/projeto/:projeto_id - Remover usando os IDs compostos
router.delete('/usuario/:usuario_id/projeto/:projeto_id', autenticar, async (req, res, next) => {
  try {
    const { usuario_id, projeto_id } = req.params;

    if (parseInt(usuario_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para remover este favorito' }]
      });
    }

    const favorito = await Favoritos.findOne({
      where: { usuario_id, projeto_id }
    });

    if (!favorito) {
      return res.status(404).json({
        message: 'Favorito não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    await favorito.destroy();
    return res.json({ message: 'Projeto removido dos favoritos com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
