const express = require('express');
const { Estado, Pais, Cidade } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

const ITEMS_POR_PAGINA = 10;
const ATRIBUTOS = ['id', 'nome', 'sigla', 'pais_id'];

// GET /api/estados/todos - Listar todos os estados sem paginação
router.get('/todos', async (req, res, next) => {
  try {
    const estados = await Estado.findAll({
      attributes: ATRIBUTOS,
      include: [
        { model: Pais, as: 'pais', attributes: ['id', 'nome'] },
        { model: Cidade, as: 'cidades', attributes: ['id', 'nome'] }
      ],
      order: [['nome', 'ASC']]
    });

    return res.json({
      data: estados,
      total: estados.length
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/estados - Listar estados com paginação
router.get('/', async (req, res, next) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (pagina - 1) * ITEMS_POR_PAGINA;

    const { count, rows } = await Estado.findAndCountAll({
      attributes: ATRIBUTOS,
      include: [
        { model: Pais, as: 'pais', attributes: ['id', 'nome'] },
        { model: Cidade, as: 'cidades', attributes: ['id', 'nome'] }
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

// GET /api/estados/:id - Buscar estado por ID
router.get('/:id', async (req, res, next) => {
  try {
    const estado = await Estado.findByPk(req.params.id, {
      attributes: ATRIBUTOS,
      include: [
        { model: Pais, as: 'pais', attributes: ['id', 'nome'] },
        { model: Cidade, as: 'cidades', attributes: ['id', 'nome'] }
      ]
    });

    if (!estado) {
      return res.status(404).json({
        message: 'Estado não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: estado });
  } catch (error) {
    return next(error);
  }
});

// POST /api/estados - Criar novo estado
router.post('/', autenticar, async (req, res, next) => {
  try {
    const { nome, sigla, pais_id } = req.body;

    const erros = [];
    if (!nome?.trim()) erros.push({ field: 'nome', message: 'Nome é obrigatório' });
    if (!sigla?.trim()) erros.push({ field: 'sigla', message: 'Sigla é obrigatória' });
    if (!pais_id) erros.push({ field: 'pais_id', message: 'País é obrigatório' });

    if (erros.length > 0) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: erros
      });
    }

    // Criamos o estado diretamente. Se o pais_id não existir ou o nome/país violar
    // um índice único composto no banco, o banco rejeitará e o seu Error Handler
    // enviará a resposta HTTP e o código REST correspondente de forma automatizada.
    const novoEstado = await Estado.create({
      nome: nome.trim(),
      sigla: sigla.trim().toUpperCase(),
      pais_id
    });

    return res.status(201).json({
      message: 'Estado criado com sucesso',
      data: novoEstado
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/estados/:id - Atualizar estado
router.put('/:id', autenticar, async (req, res, next) => {
  try {
    const { nome, sigla, pais_id } = req.body;

    const estado = await Estado.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({
        message: 'Estado não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    await estado.update({
      nome: nome !== undefined && nome.trim() ? nome.trim() : estado.nome,
      sigla: sigla !== undefined && sigla.trim() ? sigla.trim().toUpperCase() : estado.sigla,
      pais_id: pais_id || estado.pais_id
    });

    return res.json({
      message: 'Estado atualizado com sucesso',
      data: estado
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/estados/:id - Deletar estado
router.delete('/:id', autenticar, async (req, res, next) => {
  try {
    const estado = await Estado.findByPk(req.params.id);
    if (!estado) {
      return res.status(404).json({
        message: 'Estado não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Mantido o bloqueio lógico: impede deleção caso haja cidades associadas
    const cidadesCount = await Cidade.count({
      where: { estado_id: req.params.id }
    });

    if (cidadesCount > 0) {
      return res.status(409).json({
        message: 'Conflito de integridade',
        code: 'FOREIGN_KEY_CONSTRAINT_ERROR',
        errors: [{ message: 'Não é possível deletar um estado com cidades associadas' }]
      });
    }

    await estado.destroy();
    return res.json({ message: 'Estado deletado com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;