const express = require('express');
const { Preferencias, Usuario, Categoria } = require('../middleware/models');

const router = express.Router();

// ============================================
// GET - Listar preferências do usuário
// ============================================
router.get('/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const preferencias = await Preferencias.findAll({
      where: { usuario_id },
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] }
      ]
    });

    res.json({
      success: true,
      data: preferencias,
      total: preferencias.length
    });
  } catch (error) {
    console.error('Erro ao listar preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar preferências',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Buscar preferência por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const preferencia = await Preferencias.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] }
      ]
    });

    if (!preferencia) {
      return res.status(404).json({
        success: false,
        message: 'Preferência não encontrada'
      });
    }

    res.json({
      success: true,
      data: preferencia
    });
  } catch (error) {
    console.error('Erro ao buscar preferência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar preferência',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// POST - Adicionar preferência
// ============================================
router.post('/', async (req, res) => {
  try {
    const { usuario_id, categoria_id } = req.body;

    if (!usuario_id || !categoria_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando: usuario_id, categoria_id'
      });
    }

    // Verifica se já existe
    const existente = await Preferencias.findOne({
      where: { usuario_id, categoria_id }
    });

    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'Esta preferência já existe para este usuário'
      });
    }

    const preferencia = await Preferencias.create({
      usuario_id,
      categoria_id
    });

    const preferenciaCompleta = await Preferencias.findByPk(preferencia.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Preferência adicionada com sucesso',
      data: preferenciaCompleta
    });
  } catch (error) {
    console.error('Erro ao adicionar preferência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar preferência',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Remover preferência
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const preferencia = await Preferencias.findByPk(id);

    if (!preferencia) {
      return res.status(404).json({
        success: false,
        message: 'Preferência não encontrada'
      });
    }

    await preferencia.destroy();

    res.json({
      success: true,
      message: 'Preferência removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover preferência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover preferência',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
