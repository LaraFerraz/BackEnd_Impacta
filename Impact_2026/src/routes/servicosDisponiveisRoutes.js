const express = require('express');
const { Servicos_disponiveis, Projeto, StatusServico } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

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

    // Verificar se o projeto existe e obter seu status
    const projeto = await Projeto.findByPk(projeto_id);
    if (!projeto) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Definir campanha_ativa baseado no status do projeto (Ativa = 1)
    const campanha_ativa = projeto.status_id === 1;

    const servico = await Servicos_disponiveis.create({
      projeto_id,
      nome_servico,
      descricao,
      quantidade_necessaria,
      status_servico_id,
      campanha_ativa
    });

    const servicoCompleto = await Servicos_disponiveis.findByPk(servico.id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'status_id'] },
        { model: StatusServico, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Serviço criado com sucesso',
      data: servicoCompleto,
      info: {
        campanha_ativa: campanha_ativa ? 'Campanha está ativa' : 'Campanha não está ativa'
      }
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
router.put('/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_servico, descricao, quantidade_necessaria, status_servico_id, campanha_ativa } = req.body;

    const servico = await Servicos_disponiveis.findByPk(id, {
      include: [{ model: Projeto, as: 'projeto' }]
    });

    if (!servico) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    // Verificar se o usuário é o criador do projeto
    if (servico.projeto.criador_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este serviço'
      });
    }

    if (nome_servico) servico.nome_servico = nome_servico;
    if (descricao !== undefined) servico.descricao = descricao;
    if (quantidade_necessaria !== undefined) servico.quantidade_necessaria = quantidade_necessaria;
    if (status_servico_id) servico.status_servico_id = status_servico_id;
    if (campanha_ativa !== undefined) servico.campanha_ativa = campanha_ativa;

    await servico.save();

    const servicoAtualizado = await Servicos_disponiveis.findByPk(id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'status_id'] },
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
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    const servico = await Servicos_disponiveis.findByPk(id, {
      include: [{ model: Projeto, as: 'projeto' }]
    });

    if (!servico) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    // Verificar se o usuário é o criador do projeto
    if (servico.projeto.criador_id !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este serviço'
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

// ============================================
// POST - Sincronizar status de campanha para todos os serviços de um projeto
// ============================================
router.post('/projeto/:projeto_id/sincronizar-status', async (req, res) => {
  try {
    const { projeto_id } = req.params;

    // Verificar se o projeto existe
    const projeto = await Projeto.findByPk(projeto_id);
    if (!projeto) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Definir campanha_ativa baseado no status do projeto (Ativa = 1)
    const campanha_ativa = projeto.status_id === 1;

    // Atualizar todos os serviços do projeto
    const [updated] = await Servicos_disponiveis.update(
      { campanha_ativa },
      { where: { projeto_id } }
    );

    res.json({
      success: true,
      message: `Status sincronizado com sucesso para ${updated} serviço(s)`,
      data: {
        projeto_id,
        campanha_ativa,
        servicos_atualizados: updated,
        status_projeto: projeto.status_id === 1 ? 'Ativa' : 'Não Ativa'
      }
    });
  } catch (error) {
    console.error('Erro ao sincronizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao sincronizar status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ============================================
// GET - Listar serviços por status de campanha
// ============================================
router.get('/campanha/status/:campanha_ativa', async (req, res) => {
  try {
    const { campanha_ativa } = req.params;
    const { projeto_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      campanha_ativa: campanha_ativa === 'true' || campanha_ativa === '1'
    };
    if (projeto_id) whereClause.projeto_id = projeto_id;

    const { count, rows } = await Servicos_disponiveis.findAndCountAll({
      where: whereClause,
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'status_id'] },
        { model: StatusServico, as: 'status', attributes: ['id', 'nome'] }
      ],
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      filtro: {
        campanha_ativa: campanha_ativa === 'true' || campanha_ativa === '1',
        projeto_id: projeto_id || null
      },
      pagination: {
        total: count,
        pagina_atual: parseInt(page),
        limite: parseInt(limit),
        total_paginas: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar serviços por status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar serviços',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
