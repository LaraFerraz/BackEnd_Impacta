const express = require('express');
const { Avaliacoes, Usuario, Projeto } = require('../middleware/models');

const router = express.Router();

// GET /api/avaliacoes - Listar avaliações com paginação e filtros
router.get('/', async (req, res, next) => {
  try {
    const { usuario_id, projeto_id, page = 1, limit = 10 } = req.query;
    
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

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

// GET /api/avaliacoes/:id - Buscar avaliação por ID
router.get('/:id', async (req, res, next) => {
  try {
    const avaliacao = await Avaliacoes.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    if (!avaliacao) {
      return res.status(404).json({
        message: 'Avaliação não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: avaliacao });
  } catch (error) {
    return next(error);
  }
});

// POST /api/avaliacoes - Criar ou atualizar (Upsert) avaliação
router.post('/', async (req, res, next) => {
  try {
    const { usuario_id, projeto_id, nota } = req.body;

    if (!usuario_id || !projeto_id || nota === undefined) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Campos obrigatórios faltando: usuario_id, projeto_id, nota' }]
      });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Nota deve estar entre 1 e 5' }]
      });
    }

    // Upsert lógico utilizando findOne + save/create
    let avaliacao = await Avaliacoes.findOne({
      where: { usuario_id, projeto_id }
    });

    if (avaliacao) {
      avaliacao.nota = nota;
      await avaliacao.save();
    } else {
      avaliacao = await Avaliacoes.create({ usuario_id, projeto_id, nota });
    }

    const avaliacaoCompleta = await Avaliacoes.findByPk(avaliacao.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    return res.status(201).json({
      message: 'Avaliação registrada com sucesso',
      data: avaliacaoCompleta
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/avaliacoes/:id - Atualizar nota de uma avaliação
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nota } = req.body;

    const avaliacao = await Avaliacoes.findByPk(id);

    if (!avaliacao) {
      return res.status(404).json({
        message: 'Avaliação não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    if (nota !== undefined) {
      if (nota < 1 || nota > 5) {
        return res.status(400).json({
          message: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          errors: [{ message: 'Nota deve estar entre 1 e 5' }]
        });
      }
      avaliacao.nota = nota;
      await avaliacao.save();
    }

    const avaliacaoAtualizada = await Avaliacoes.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    return res.json({
      message: 'Avaliação atualizada com sucesso',
      data: avaliacaoAtualizada
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/avaliacoes/:id - Deletar uma avaliação
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const avaliacao = await Avaliacoes.findByPk(id);

    if (!avaliacao) {
      return res.status(404).json({
        message: 'Avaliação não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    await avaliacao.destroy();

    return res.json({ message: 'Avaliação deletada com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
