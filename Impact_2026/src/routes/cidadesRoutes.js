const express = require('express');
const { Cidade, Estado } = require('../middleware/models');

const router = express.Router();

router.get('/', async (req, res) => {
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

    res.json({
      success: true,
      data: cidades,
      total: cidades.length
    });
  } catch (error) {
    console.error('Erro ao listar cidades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar cidades',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

/**
 * ============================================
 * GET - Buscar cidade por ID
 * ============================================
 */
router.get('/:id', async (req, res) => {
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
        success: false,
        message: 'Cidade não encontrada'
      });
    }

    res.json({
      success: true,
      data: cidade
    });
  } catch (error) {
    console.error('Erro ao buscar cidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cidade',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

/**
 * ============================================
 * GET - Listar cidades por estado
 * ============================================
 */
router.get('/estado/:estadoId', async (req, res) => {
  try {
    const { estadoId } = req.params;

    const cidades = await Cidade.findAll({
      attributes: ['id', 'nome', 'estado_id'],
      where: { estado_id: estadoId },
      order: [['nome', 'ASC']]
    });

    res.json({
      success: true,
      data: cidades,
      total: cidades.length
    });
  } catch (error) {
    console.error('Erro ao listar cidades por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar cidades por estado',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

/**
 * ============================================
 * POST - Criar nova cidade
 * ============================================
 */
router.post('/', async (req, res) => {
  try {
    const { nome, estado_id } = req.body;

    if (!nome || !estado_id) {
      return res.status(400).json({
        success: false,
        message: 'Nome e estado_id são obrigatórios'
      });
    }

    // Verificar se estado existe
    const estado = await Estado.findByPk(estado_id);
    if (!estado) {
      return res.status(404).json({
        success: false,
        message: 'Estado não encontrado'
      });
    }

    const cidade = await Cidade.create({
      nome,
      estado_id
    });

    res.status(201).json({
      success: true,
      message: 'Cidade criada com sucesso',
      data: cidade
    });
  } catch (error) {
    console.error('Erro ao criar cidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cidade',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

/**
 * ============================================
 * PUT - Atualizar cidade
 * ============================================
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, estado_id } = req.body;

    const cidade = await Cidade.findByPk(id);
    if (!cidade) {
      return res.status(404).json({
        success: false,
        message: 'Cidade não encontrada'
      });
    }

    // Se estado_id foi fornecido, validar
    if (estado_id) {
      const estado = await Estado.findByPk(estado_id);
      if (!estado) {
        return res.status(404).json({
          success: false,
          message: 'Estado não encontrado'
        });
      }
    }

    await cidade.update({
      nome: nome || cidade.nome,
      estado_id: estado_id || cidade.estado_id
    });

    res.json({
      success: true,
      message: 'Cidade atualizada com sucesso',
      data: cidade
    });
  } catch (error) {
    console.error('Erro ao atualizar cidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cidade',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

/**
 * ============================================
 * DELETE - Deletar cidade
 * ============================================
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cidade = await Cidade.findByPk(id);
    if (!cidade) {
      return res.status(404).json({
        success: false,
        message: 'Cidade não encontrada'
      });
    }

    await cidade.destroy();

    res.json({
      success: true,
      message: 'Cidade deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar cidade',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
