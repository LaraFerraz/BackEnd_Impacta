const express = require('express');
const { Info_campanha, Projeto } = require('../models');

const router = express.Router();

// ============================================
// GET - Listar informações de campanhas
// ============================================
router.get('/', async (req, res) => {
  try {
    const { projeto_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (projeto_id) whereClause.projeto_id = projeto_id;

    const { count, rows } = await Info_campanha.findAndCountAll({
      where: whereClause,
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ],
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
    console.error('Erro ao listar informações de campanhas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar informações de campanhas',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Buscar infos da campanha por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const infoCampanha = await Info_campanha.findByPk(req.params.id, {
      include: [
        { model: Projeto, as: 'projeto' }
      ]
    });

    if (!infoCampanha) {
      return res.status(404).json({
        success: false,
        message: 'Informações de campanha não encontradas'
      });
    }

    res.json({
      success: true,
      data: infoCampanha
    });
  } catch (error) {
    console.error('Erro ao buscar informações de campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar informações de campanha',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// POST - Criar informações de campanha
// ============================================
router.post('/', async (req, res) => {
  try {
    const { projeto_id, objetivos, publico_alvo, impacto_esperado, regras, observacoes } = req.body;

    if (!projeto_id) {
      return res.status(400).json({
        success: false,
        message: 'projeto_id é obrigatório'
      });
    }

    // Verificar se o projeto existe
    const projeto = await Projeto.findByPk(projeto_id);
    if (!projeto) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const infoCampanha = await Info_campanha.create({
      projeto_id,
      objetivos: objetivos || null,
      publico_alvo: publico_alvo || null,
      impacto_esperado: impacto_esperado || null,
      regras: regras || null,
      observacoes: observacoes || null
    });

    const infoCampanhaCompleta = await Info_campanha.findByPk(infoCampanha.id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Informações de campanha criadas com sucesso',
      data: infoCampanhaCompleta
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    console.error('Erro ao criar informações de campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar informações de campanha',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// PUT - Atualizar informações de campanha
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { objetivos, publico_alvo, impacto_esperado, regras, observacoes } = req.body;

    const infoCampanha = await Info_campanha.findByPk(id);

    if (!infoCampanha) {
      return res.status(404).json({
        success: false,
        message: 'Informações de campanha não encontradas'
      });
    }

    if (objetivos !== undefined) infoCampanha.objetivos = objetivos;
    if (publico_alvo !== undefined) infoCampanha.publico_alvo = publico_alvo;
    if (impacto_esperado !== undefined) infoCampanha.impacto_esperado = impacto_esperado;
    if (regras !== undefined) infoCampanha.regras = regras;
    if (observacoes !== undefined) infoCampanha.observacoes = observacoes;

    await infoCampanha.save();

    const infoCampanhaAtualizada = await Info_campanha.findByPk(id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    res.json({
      success: true,
      message: 'Informações de campanha atualizadas com sucesso',
      data: infoCampanhaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar informações de campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar informações de campanha',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Deletar informações de campanha
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const infoCampanha = await Info_campanha.findByPk(id);

    if (!infoCampanha) {
      return res.status(404).json({
        success: false,
        message: 'Informações de campanha não encontradas'
      });
    }

    await infoCampanha.destroy();

    res.json({
      success: true,
      message: 'Informações de campanha deletadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar informações de campanha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar informações de campanha',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
