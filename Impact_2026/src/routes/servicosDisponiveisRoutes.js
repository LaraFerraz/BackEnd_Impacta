const express = require('express');
const { Servicos_disponiveis, Projeto, StatusServico } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/servicos - Listar serviços com filtros e paginação
router.get('/', async (req, res, next) => {
  try {
    const { projeto_id, status_servico_id, page = 1, limit = 10 } = req.query;
    
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

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

// GET /api/servicos/campanha/status/:campanha_ativa - Listar serviços por status de campanha
router.get('/campanha/status/:campanha_ativa', async (req, res, next) => {
  try {
    const { campanha_ativa } = req.params;
    const { projeto_id, page = 1, limit = 10 } = req.query;

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

    const isCampanhaAtiva = campanha_ativa === 'true' || campanha_ativa === '1';

    const whereClause = { campanha_ativa: isCampanhaAtiva };
    if (projeto_id) whereClause.projeto_id = projeto_id;

    const { count, rows } = await Servicos_disponiveis.findAndCountAll({
      where: whereClause,
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'status_id'] },
        { model: StatusServico, as: 'status', attributes: ['id', 'nome'] }
      ],
      order: [['id', 'DESC']],
      limit: parsedLimit,
      offset
    });

    return res.json({
      data: rows,
      filter: {
        campanha_ativa: isCampanhaAtiva,
        projeto_id: projeto_id ? parseInt(projeto_id, 10) : null
      },
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

// GET /api/servicos/:id - Buscar serviço por ID
router.get('/:id', async (req, res, next) => {
  try {
    const servico = await Servicos_disponiveis.findByPk(req.params.id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'criador_id', 'status_id'] },
        { model: StatusServico, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    if (!servico) {
      return res.status(404).json({
        message: 'Serviço não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: servico });
  } catch (error) {
    return next(error);
  }
});

// POST /api/servicos - Criar novo serviço
router.post('/', autenticar, async (req, res, next) => {
  try {
    const { projeto_id, nome_servico, descricao, quantidade_necessaria, status_servico_id } = req.body;

    if (!projeto_id || !nome_servico || !status_servico_id) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Campos obrigatórios faltando: projeto_id, nome_servico, status_servico_id' }]
      });
    }

    const projeto = await Projeto.findByPk(projeto_id);
    if (!projeto) {
      return res.status(404).json({
        message: 'Projeto não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede que usuários criem serviços em projetos de terceiros
    if (projeto.criador_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para gerenciar serviços deste projeto' }]
      });
    }

    const campanha_ativa = projeto.status_id === 1; // Status Ativa = 1

    const servico = await Servicos_disponiveis.create({
      projeto_id,
      nome_servico: nome_servico.trim(),
      descricao: descricao ? descricao.trim() : null,
      quantidade_necessaria: quantidade_necessaria || 1,
      status_servico_id,
      campanha_ativa
    });

    const servicoCompleto = await Servicos_disponiveis.findByPk(servico.id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'status_id'] },
        { model: StatusServico, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    return res.status(201).json({
      message: 'Serviço criado com sucesso',
      data: servicoCompleto
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/servicos/:id - Atualizar serviço
router.put('/:id', autenticar, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome_servico, descricao, quantidade_necessaria, status_servico_id, campanha_ativa } = req.body;

    const servico = await Servicos_disponiveis.findByPk(id, {
      include: [{ model: Projeto, as: 'projeto' }]
    });

    if (!servico) {
      return res.status(404).json({
        message: 'Serviço não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede que usuários alterem serviços de projetos alheios
    if (servico.projeto.criador_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para editar este serviço' }]
      });
    }

    if (nome_servico) servico.nome_servico = nome_servico.trim();
    if (descricao !== undefined) servico.descricao = descricao ? descricao.trim() : null;
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

    return res.json({
      message: 'Serviço atualizado com sucesso',
      data: servicoAtualizado
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/servicos/:id - Deletar serviço
router.delete('/:id', autenticar, async (req, res, next) => {
  try {
    const { id } = req.params;

    const servico = await Servicos_disponiveis.findByPk(id, {
      include: [{ model: Projeto, as: 'projeto' }]
    });

    if (!servico) {
      return res.status(404).json({
        message: 'Serviço não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede a deleção de registros por quem não é dono do projeto
    if (servico.projeto.criador_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para deletar este serviço' }]
      });
    }

    await servico.destroy();
    return res.json({ message: 'Serviço deletado com sucesso' });
  } catch (error) {
    return next(error);
  }
});

// POST /api/servicos/projeto/:projeto_id/sincronizar-status - Sincronizar status de campanha
router.post('/projeto/:projeto_id/sincronizar-status', autenticar, async (req, res, next) => {
  try {
    const { projeto_id } = req.params;

    const projeto = await Projeto.findByPk(projeto_id);
    if (!projeto) {
      return res.status(404).json({
        message: 'Projeto não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: garante que apenas o dono do projeto pode disparar a sincronização em massa
    if (projeto.criador_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para alterar os dados deste projeto' }]
      });
    }

    const campanha_ativa = projeto.status_id === 1;

    const [updated] = await Servicos_disponiveis.update(
      { campanha_ativa },
      { where: { projeto_id } }
    );

    return res.json({
      message: 'Status sincronizado com sucesso',
      data: {
        projeto_id: parseInt(projeto_id, 10),
        campanha_ativa,
        servicos_atualizados: updated,
        status_projeto: projeto.status_id === 1 ? 'Ativa' : 'Não Ativa'
      }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;