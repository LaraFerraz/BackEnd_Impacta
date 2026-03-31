const express = require('express');
const { Servicos_disponiveis, Projeto, StatusServico } = require('../models');

const router = express.Router();

// ============================================
// GET - Listar serviços com filtros
// ============================================
router.get('/', async (req, res) => {
  try {
    const { projeto_id, status_servico_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (projeto_id) whereClause.projeto_id = projeto_id;
    if (status_servico_id) whereClause.status_servico_id = status_servico_id;

    const { count, rows } = await Servicos_disponiveis.findAndCountAll({
      where: whereClause,
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] },
        { model: StatusServico, as: 'status', attributes: ['id', 'nome'] }
      ],
      order: [['id', 'DESC']],
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
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar serviços',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Buscar serviço por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const servico = await Servicos_disponiveis.findByPk(req.params.id, {
      include: [
        { model: Projeto, as: 'projeto' },
        { model: StatusServico, as: 'status' }
      ]
    });

    if (!servico) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    res.json({
      success: true,
      data: servico
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar serviço',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// POST - Criar novo serviço
// ============================================
router.post('/', async (req, res) => {
  try {
    const { projeto_id, nome_servico, descricao, quantidade_necessaria, status_servico_id } = req.body;

    if (!projeto_id || !nome_servico || !status_servico_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando: projeto_id, nome_servico, status_servico_id'
      });
    }

    const servico = await Servicos_disponiveis.create({
      projeto_id,
      nome_servico,
      descricao,
      quantidade_necessaria,
      status_servico_id
    });

    const servicoCompleto = await Servicos_disponiveis.findByPk(servico.id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] },
        { model: StatusServico, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Serviço criado com sucesso',
      data: servicoCompleto
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar serviço',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// PUT - Atualizar serviço
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_servico, descricao, quantidade_necessaria, status_servico_id } = req.body;

    const servico = await Servicos_disponiveis.findByPk(id);

    if (!servico) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    if (nome_servico) servico.nome_servico = nome_servico;
    if (descricao !== undefined) servico.descricao = descricao;
    if (quantidade_necessaria !== undefined) servico.quantidade_necessaria = quantidade_necessaria;
    if (status_servico_id) servico.status_servico_id = status_servico_id;

    await servico.save();

    const servicoAtualizado = await Servicos_disponiveis.findByPk(id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] },
        { model: StatusServico, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    res.json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      data: servicoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar serviço',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Deletar serviço
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const servico = await Servicos_disponiveis.findByPk(id);

    if (!servico) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    await servico.destroy();

    res.json({
      success: true,
      message: 'Serviço deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar serviço',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
