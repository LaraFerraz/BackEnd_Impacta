const express = require('express');
const { Avaliacoes, Usuario, Projeto } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { usuario_id, projeto_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (usuario_id) whereClause.usuario_id = usuario_id;
    if (projeto_id) whereClause.projeto_id = projeto_id;

    const { count, rows } = await Avaliacoes.findAndCountAll({
      where: whereClause,
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ],
      order: [['data_avaliacao', 'DESC']],
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
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar avaliações',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Buscar avaliação por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const avaliacao = await Avaliacoes.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Projeto, as: 'projeto' }
      ]
    });

    if (!avaliacao) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    res.json({
      success: true,
      data: avaliacao
    });
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avaliação',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// POST - Criar/atualizar avaliação
// ============================================
router.post('/', async (req, res) => {
  try {
    const { usuario_id, projeto_id, nota } = req.body;

    if (!usuario_id || !projeto_id || nota === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando: usuario_id, projeto_id, nota'
      });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({
        success: false,
        message: 'Nota deve estar entre 1 e 5'
      });
    }

    // Procura avaliação existente
    let avaliacao = await Avaliacoes.findOne({
      where: { usuario_id, projeto_id }
    });

    if (avaliacao) {
      avaliacao.nota = nota;
      await avaliacao.save();
    } else {
      avaliacao = await Avaliacoes.create({
        usuario_id,
        projeto_id,
        nota
      });
    }

    const avaliacaoCompleta = await Avaliacoes.findByPk(avaliacao.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Avaliação registrada com sucesso',
      data: avaliacaoCompleta
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar avaliação',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// PUT - Atualizar avaliação
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nota } = req.body;

    const avaliacao = await Avaliacoes.findByPk(id);

    if (!avaliacao) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    if (nota !== undefined) {
      if (nota < 1 || nota > 5) {
        return res.status(400).json({
          success: false,
          message: 'Nota deve estar entre 1 e 5'
        });
      }
      avaliacao.nota = nota;
    }

    await avaliacao.save();

    const avaliacaoAtualizada = await Avaliacoes.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    res.json({
      success: true,
      message: 'Avaliação atualizada com sucesso',
      data: avaliacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar avaliação',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Deletar avaliação
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const avaliacao = await Avaliacoes.findByPk(id);

    if (!avaliacao) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    await avaliacao.destroy();

    res.json({
      success: true,
      message: 'Avaliação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar avaliação',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
