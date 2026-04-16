const express = require('express');
const { Favoritos, Usuario, Projeto } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Favoritos.findAndCountAll({
      where: { usuario_id },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'descricao', 'data_criacao'] }
      ],
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        pagina_atual: parseInt(page),
        limite: parseInt(limit),
        total_paginas: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar favoritos',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Buscar favorito específico
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const favorito = await Favoritos.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Projeto, as: 'projeto' }
      ]
    });

    if (!favorito) {
      return res.status(404).json({
        success: false,
        message: 'Favorito não encontrado'
      });
    }

    res.json({
      success: true,
      data: favorito
    });
  } catch (error) {
    console.error('Erro ao buscar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar favorito',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// POST - Adicionar projeto aos favoritos
// ============================================
router.post('/', async (req, res) => {
  try {
    const { usuario_id, projeto_id } = req.body;

    if (!usuario_id || !projeto_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando: usuario_id, projeto_id'
      });
    }

    // Verifica se já existe
    const existente = await Favoritos.findOne({
      where: { usuario_id, projeto_id }
    });

    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'Este projeto já está nos favoritos do usuário'
      });
    }

    const favorito = await Favoritos.create({
      usuario_id,
      projeto_id
    });

    const favoritoCompleto = await Favoritos.findByPk(favorito.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'descricao'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Projeto adicionado aos favoritos com sucesso',
      data: favoritoCompleto
    });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar favorito',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Remover projeto dos favoritos
// ============================================
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    const favorito = await Favoritos.findByPk(id);

    if (!favorito) {
      return res.status(404).json({
        success: false,
        message: 'Favorito não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário do favorito
    if (favorito.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para remover este favorito'
      });
    }

    await favorito.destroy();

    res.json({
      success: true,
      message: 'Projeto removido dos favoritos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover favorito',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Remover por usuario_id e projeto_id
// ============================================
router.delete('/usuario/:usuario_id/projeto/:projeto_id', autenticar, async (req, res) => {
  try {
    const { usuario_id, projeto_id } = req.params;

    const favorito = await Favoritos.findOne({
      where: { usuario_id, projeto_id }
    });

    if (!favorito) {
      return res.status(404).json({
        success: false,
        message: 'Favorito não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário do favorito
    if (parseInt(usuario_id) !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para remover este favorito'
      });
    }

    await favorito.destroy();

    res.json({
      success: true,
      message: 'Projeto removido dos favoritos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover favorito',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
