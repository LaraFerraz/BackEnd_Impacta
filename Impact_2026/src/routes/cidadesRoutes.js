const express = require('express');
const { Cidade, Estado } = require('../middleware/models');

const router = express.Router();

// GET /api/cidades - Listar todas as cidades
router.get('/', async (req, res, next) => {
  try {
    const cidades = await Cidade.findAll({
      attributes: ['id', 'nome', 'estado_id'],
      include: [
        {
          model: Estado,
          as: 'estado',
          attributes: ['id', 'nome', 'sigla']
        }
      ],
      order: [['nome', 'ASC']]
    });

    return res.json({
      data: cidades,
      total: cidades.length
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/cidades/:id - Buscar cidade por ID
router.get('/:id', async (req, res, next) => {
  try {
    const cidade = await Cidade.findByPk(req.params.id, {
      attributes: ['id', 'nome', 'estado_id'],
      include: [
        {
          model: Estado,
          as: 'estado',
          attributes: ['id', 'nome', 'sigla']
        }
      ]
    });

    if (!cidade) {
      return res.status(404).json({
        message: 'Cidade não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: cidade });
  } catch (error) {
    return next(error);
  }
});

// GET /api/cidades/estado/:estadoId - Listar cidades por estado
router.get('/estado/:estadoId', async (req, res, next) => {
  try {
    const { estadoId } = req.params;

    const cidades = await Cidade.findAll({
      attributes: ['id', 'nome', 'estado_id'],
      where: { estado_id: estadoId },
      order: [['nome', 'ASC']]
    });

    return res.json({
      data: cidades,
      total: cidades.length
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/cidades - Criar nova cidade
router.post('/', async (req, res, next) => {
  try {
    const { nome, estado_id } = req.body;

    if (!nome?.trim() || !estado_id) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Nome e estado_id são obrigatórios' }]
      });
    }

    // Criamos o registro diretamente. Se o estado_id não existir, o banco de dados
    // rejeitará e o Error Handler enviará um FOREIGN_KEY_CONSTRAINT_ERROR automático.
    const cidade = await Cidade.create({
      nome: nome.trim(),
      estado_id
    });

    return res.status(201).json({
      message: 'Cidade criada com sucesso',
      data: cidade
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/cidades/:id - Atualizar cidade
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, estado_id } = req.body;

    const cidade = await Cidade.findByPk(id);
    if (!cidade) {
      return res.status(404).json({
        message: 'Cidade não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Atualiza apenas os campos enviados, limpando espaços se o nome foi fornecido
    await cidade.update({
      nome: nome !== undefined ? nome.trim() : cidade.nome,
      estado_id: estado_id || cidade.estado_id
    });

    return res.json({
      message: 'Cidade atualizada com sucesso',
      data: cidade
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/cidades/:id - Deletar cidade
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const cidade = await Cidade.findByPk(id);
    if (!cidade) {
      return res.status(404).json({
        message: 'Cidade não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    await cidade.destroy();

    return res.json({ message: 'Cidade deletada com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
