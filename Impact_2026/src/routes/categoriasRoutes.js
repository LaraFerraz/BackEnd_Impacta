const express = require('express');
const { Categoria, Projeto } = require('../middleware/models');

const router = express.Router();

// GET /api/categorias - Listar todas as categorias
router.get('/', async (req, res, next) => {
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

    return res.json({
      data: categorias,
      total: categorias.length
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/categorias/:id - Buscar categoria por ID
router.get('/:id', async (req, res, next) => {
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
        message: 'Categoria não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: categoria });
  } catch (error) {
    return next(error);
  }
});

// POST /api/categorias - Criar nova categoria
router.post('/', async (req, res, next) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Nome da categoria é obrigatório' }]
      });
    }

    const categoria = await Categoria.create({ nome: nome.trim() });

    return res.status(201).json({
      message: 'Categoria criada com sucesso',
      data: categoria
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/categorias/:id - Atualizar categoria
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        message: 'Categoria não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    if (nome) {
      if (!nome.trim()) {
        return res.status(400).json({
          message: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          errors: [{ message: 'Nome da categoria não pode ser vazio' }]
        });
      }
      categoria.nome = nome.trim();
      await categoria.save();
    }

    return res.json({
      message: 'Categoria updated com sucesso',
      data: categoria
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/categorias/:id - Deletar categoria
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        message: 'Categoria não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    await categoria.destroy();

    return res.json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
