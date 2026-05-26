const express = require('express');
const { Pais, Estado } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

const ITEMS_POR_PAGINA = 10;
const ATRIBUTOS = ['id', 'nome'];

// GET /api/paises - Listar países com paginação
router.get('/', async (req, res, next) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (pagina - 1) * ITEMS_POR_PAGINA;

    const { count, rows } = await Pais.findAndCountAll({
      attributes: ATRIBUTOS,
      include: [
        {
          model: Estado,
          as: 'estados',
          attributes: ['id', 'nome', 'sigla']
        }
      ],
      order: [['nome', 'ASC']],
      limit: ITEMS_POR_PAGINA,
      offset
    });

    return res.json({
      data: rows,
      pagination: {
        pagina_atual: pagina,
        total_paginas: Math.ceil(count / ITEMS_POR_PAGINA),
        total: count
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/paises/:id - Buscar país por ID
router.get('/:id', async (req, res, next) => {
  try {
    const pais = await Pais.findByPk(req.params.id, {
      attributes: ATRIBUTOS,
      include: [
        {
          model: Estado,
          as: 'estados',
          attributes: ['id', 'nome', 'sigla']
        }
      ]
    });

    if (!pais) {
      return res.status(404).json({
        message: 'País não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: pais });
  } catch (error) {
    return next(error);
  }
});

// POST /api/paises - Criar novo país
router.post('/', autenticar, async (req, res, next) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ field: 'nome', message: 'Nome do país é obrigatório' }]
      });
    }

    // Criação direta. Se o nome violar o índice UNIQUE no banco,
    // o errorHandler global responderá com status 409 e o código adequado.
    const novoPais = await Pais.create({
      nome: nome.trim()
    });

    return res.status(201).json({
      message: 'País criado com sucesso',
      data: novoPais
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/paises/:id - Atualizar país
router.put('/:id', autenticar, async (req, res, next) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ field: 'nome', message: 'Nome do país é obrigatório' }]
      });
    }

    const pais = await Pais.findByPk(req.params.id);

    if (!pais) {
      return res.status(404).json({
        message: 'País não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    await pais.update({ nome: nome.trim() });

    return res.json({
      message: 'País atualizado com sucesso',
      data: pais
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/paises/:id - Deletar país
router.delete('/:id', autenticar, async (req, res, next) => {
  try {
    const pais = await Pais.findByPk(req.params.id);

    if (!pais) {
      return res.status(404).json({
        message: 'País não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Mantido o bloqueio preventivo antes da query de exclusão
    const estadosCount = await Estado.count({
      where: { pais_id: req.params.id }
    });

    if (estadosCount > 0) {
      return res.status(409).json({
        message: 'Conflito de integridade',
        code: 'FOREIGN_KEY_CONSTRAINT_ERROR',
        errors: [{ message: 'Não é possível deletar um país com estados associados' }]
      });
    }

    await pais.destroy();

    return res.json({ message: 'País deletado com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
