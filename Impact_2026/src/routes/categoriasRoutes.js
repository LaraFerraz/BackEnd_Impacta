const express = require('express');
const { Categoria, Projeto, Preferencias } = require('../models');

const router = express.Router();

// ============================================
// GET - Listar todas as categorias
// ============================================
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      include: [
        {
          model: Projeto,
          as: 'projetos',
          attributes: ['id', 'titulo'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: categorias,
      total: categorias.length
    });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar categorias',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Buscar categoria por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id, {
      include: [
        {
          model: Projeto,
          as: 'projetos',
          attributes: ['id', 'titulo', 'descricao'],
          required: false
        }
      ]
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar categoria',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// POST - Criar nova categoria
// ============================================
router.post('/', async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria é obrigatório'
      });
    }

    const categoria = await Categoria.create({ nome });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: categoria
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Categoria com este nome já existe'
      });
    }

    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar categoria',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// PUT - Atualizar categoria
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    if (nome) {
      categoria.nome = nome;
    }

    await categoria.save();

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoria
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Categoria com este nome já existe'
      });
    }

    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar categoria',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Deletar categoria
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    await categoria.destroy();

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar categoria',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
