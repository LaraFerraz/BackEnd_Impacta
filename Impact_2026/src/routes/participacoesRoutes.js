const express = require('express');
const {
  Participacoes,
  Usuario,
  Projeto,
  Servicos_disponiveis,
  StatusParticipacao,
  Categoria,
  StatusCampanha
} = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================
// GET - Listar participações com filtros
// ============================================
router.get('/', async (req, res) => {
  try {
    const { usuario_id, projeto_id, status_participacao_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (usuario_id) whereClause.usuario_id = usuario_id;
    if (projeto_id) whereClause.projeto_id = projeto_id;
    if (status_participacao_id) whereClause.status_participacao_id = status_participacao_id;

    const { count, rows } = await Participacoes.findAndCountAll({
      where: whereClause,
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] },
        { model: Servicos_disponiveis, as: 'servico', attributes: ['id', 'nome_servico'], required: false },
        { model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }
      ],
      order: [['data_inscricao', 'DESC']],
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
    console.error('Erro ao listar participações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar participações',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Buscar participação por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const participacao = await Participacoes.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Projeto, as: 'projeto' },
        { model: Servicos_disponiveis, as: 'servico', required: false },
        { model: StatusParticipacao, as: 'status' }
      ]
    });

    if (!participacao) {
      return res.status(404).json({
        success: false,
        message: 'Participação não encontrada'
      });
    }

    res.json({
      success: true,
      data: participacao
    });
  } catch (error) {
    console.error('Erro ao buscar participação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar participação',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// POST - Criar nova participação
// ============================================
router.post('/', async (req, res) => {
  try {
    const { usuario_id, projeto_id, servico_id, status_participacao_id } = req.body;

    if (!usuario_id || !projeto_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando: usuario_id, projeto_id'
      });
    }

    // Verificar se o usuário já está inscrito neste projeto
    const jaInscritos = await Participacoes.findOne({
      where: {
        usuario_id,
        projeto_id
      }
    });

    if (jaInscritos) {
      return res.status(409).json({
        success: false,
        message: 'Você já está inscrito nesta campanha'
      });
    }

    // Se status_participacao_id não for fornecido, usar "Pendente" (id 1)
    const statusId = status_participacao_id || 1;

    const participacao = await Participacoes.create({
      usuario_id,
      projeto_id,
      servico_id,
      status_participacao_id: statusId
    });

    const participacaoCompleta = await Participacoes.findByPk(participacao.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] },
        { model: Servicos_disponiveis, as: 'servico', attributes: ['id', 'nome_servico'], required: false },
        { model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Inscrição realizada com sucesso! Sua participação está pendente de confirmação.',
      data: participacaoCompleta
    });
  } catch (error) {
    console.error('Erro ao criar participação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar inscrição',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// PUT - Atualizar participação
// ============================================
router.put('/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { servico_id, status_participacao_id } = req.body;

    const participacao = await Participacoes.findByPk(id);

    if (!participacao) {
      return res.status(404).json({
        success: false,
        message: 'Participação não encontrada'
      });
    }

    // Verificar se o usuário é o proprietário da participação
    if (participacao.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar esta participação'
      });
    }

    if (servico_id !== undefined) participacao.servico_id = servico_id;
    if (status_participacao_id) participacao.status_participacao_id = status_participacao_id;

    await participacao.save();

    const participacaoAtualizada = await Participacoes.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] },
        { model: Servicos_disponiveis, as: 'servico', attributes: ['id', 'nome_servico'], required: false },
        { model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    res.json({
      success: true,
      message: 'Participação atualizada com sucesso',
      data: participacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar participação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar participação',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// DELETE - Deletar participação
// ============================================
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    const participacao = await Participacoes.findByPk(id);

    if (!participacao) {
      return res.status(404).json({
        success: false,
        message: 'Participação não encontrada'
      });
    }

    // Verificar se o usuário é o proprietário da participação
    if (participacao.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar esta participação'
      });
    }

    await participacao.destroy();

    res.json({
      success: true,
      message: 'Participação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar participação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar participação',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Listar campanhas que um usuário se inscreveu (para perfil)
// ============================================
router.get('/usuario/:usuario_id/campanhas', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Participacoes.findAndCountAll({
      where: { usuario_id },
      include: [
        {
          model: Projeto,
          as: 'projeto',
          attributes: [
            'id',
            'titulo',
            'descricao',
            'data_criacao',
            'data_inicio',
            'data_fim',
            'meta_participantes'
          ],
          include: [
            { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] },
            { model: Usuario, as: 'criador', attributes: ['id', 'nome'] },
            { model: StatusCampanha, as: 'status', attributes: ['id', 'nome'] }
          ]
        },
        { model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }
      ],
      order: [['data_inscricao', 'DESC']],
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
    console.error('Erro ao listar campanhas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar campanhas',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Verificar se usuário já se inscreveu em uma campanha
// ============================================
router.get('/usuario/:usuario_id/projeto/:projeto_id/existe', async (req, res) => {
  try {
    const { usuario_id, projeto_id } = req.params;

    const participacao = await Participacoes.findOne({
      where: { usuario_id, projeto_id },
      include: [
        { model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    res.json({
      success: true,
      existe: !!participacao,
      data: participacao || null
    });
  } catch (error) {
    console.error('Erro ao verificar participação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar participação',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
