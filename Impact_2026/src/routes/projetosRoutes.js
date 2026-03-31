const express = require('express');
const {
  Projeto,
  Categoria,
  Usuario,
  Cidade,
  StatusCampanha,
  Info_campanha,
  Servicos_disponiveis,
  Participacoes,
  Avaliacoes,
  Favoritos
} = require('../models');

const router = express.Router();

// ============================================
// GET - Listar todos os projetos com filtros
// ============================================
router.get('/', async (req, res) => {
  try {
    const { categoria_id, status_id, criador_id, cidade_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (categoria_id) whereClause.categoria_id = categoria_id;
    if (status_id) whereClause.status_id = status_id;
    if (criador_id) whereClause.criador_id = criador_id;
    if (cidade_id) whereClause.cidade_id = cidade_id;

    const { count, rows } = await Projeto.findAndCountAll({
      where: whereClause,
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: StatusCampanha, as: 'status', attributes: ['id', 'nome'] }
      ],
      order: [['data_criacao', 'DESC']],
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
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar projetos',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Buscar projeto por ID com detalhes
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const projeto = await Projeto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email', 'telefone'] },
        { model: Cidade, as: 'cidade' },
        { model: StatusCampanha, as: 'status' },
        { model: Info_campanha, as: 'informacoes' },
        {
          model: Servicos_disponiveis,
          as: 'servicos',
          include: [{ model: require('../models').StatusServico, as: 'status' }]
        },
        {
          model: Participacoes,
          as: 'participacoes',
          attributes: ['id', 'usuario_id', 'data_inscricao'],
          include: [{ model: require('../models').StatusParticipacao, as: 'status' }],
          separate: true
        },
        {
          model: Avaliacoes,
          as: 'avaliacoes',
          attributes: ['id', 'usuario_id', 'nota'],
          separate: true
        }
      ]
    });

    if (!projeto) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      success: true,
      data: projeto
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar projeto',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// POST - Criar novo projeto
// ============================================
router.post('/', async (req, res) => {
  try {
    const { titulo, descricao, categoria_id, criador_id, cidade_id, data_inicio, data_fim, meta_participantes, status_id } = req.body;

    // Validações básicas
    if (!titulo || !descricao || !categoria_id || !criador_id || !cidade_id || !status_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando: titulo, descricao, categoria_id, criador_id, cidade_id, status_id'
      });
    }

    const projeto = await Projeto.create({
      titulo,
      descricao,
      categoria_id,
      criador_id,
      cidade_id,
      data_inicio,
      data_fim,
      meta_participantes,
      status_id
    });

    const projetoCompleto = await Projeto.findByPk(projeto.id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome'] },
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: StatusCampanha, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Projeto criado com sucesso',
      data: projetoCompleto
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar projeto',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// PUT - Atualizar projeto
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, categoria_id, cidade_id, data_inicio, data_fim, meta_participantes, status_id } = req.body;

    const projeto = await Projeto.findByPk(id);

    if (!projeto) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    if (titulo) projeto.titulo = titulo;
    if (descricao) projeto.descricao = descricao;
    if (categoria_id) projeto.categoria_id = categoria_id;
    if (cidade_id) projeto.cidade_id = cidade_id;
    if (data_inicio) projeto.data_inicio = data_inicio;
    if (data_fim) projeto.data_fim = data_fim;
    if (meta_participantes) projeto.meta_participantes = meta_participantes;
    if (status_id) projeto.status_id = status_id;

    await projeto.save();

    const projetoAtualizado = await Projeto.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome'] },
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: StatusCampanha, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    res.json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      data: projetoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar projeto',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Deletar projeto
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const projeto = await Projeto.findByPk(id);

    if (!projeto) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    await projeto.destroy();

    res.json({
      success: true,
      message: 'Projeto deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar projeto',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
