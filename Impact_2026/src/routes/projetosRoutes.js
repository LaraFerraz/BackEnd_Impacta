const express = require('express');
const {
  Projeto,
  Categoria,
  Usuario,
  Cidade,
  StatusCampanha,
  Info_campanha,
  Servicos_disponiveis,
  StatusServico,
  Participacoes,
  StatusParticipacao,
  Avaliacoes
} = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/projetos - Listar todos os projetos com filtros e paginação
router.get('/', async (req, res, next) => {
  try {
    const { categoria_id, status_id, criador_id, cidade_id, page = 1, limit = 10 } = req.query;
    
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

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

// GET /api/projetos/:id - Buscar projeto por ID com relacionamentos detalhados
router.get('/:id', async (req, res, next) => {
  try {
    const projeto = await Projeto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email', 'telefone'] },
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: StatusCampanha, as: 'status', attributes: ['id', 'nome'] },
        { model: Info_campanha, as: 'informacoes' },
        {
          model: Servicos_disponiveis,
          as: 'servicos',
          include: [{ model: StatusServico, as: 'status', attributes: ['id', 'nome'] }]
        },
        {
          model: Participacoes,
          as: 'participacoes',
          attributes: ['id', 'usuario_id', 'data_inscricao'],
          include: [{ model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }],
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
        message: 'Projeto não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: projeto });
  } catch (error) {
    return next(error);
  }
});

// POST /api/projetos - Criar novo projeto
router.post('/', autenticar, async (req, res, next) => {
  try {
    const { titulo, descricao, categoria_id, criador_id, cidade_id, data_inicio, data_fim, meta_participantes, status_id } = req.body;

    if (!titulo || !descricao || !categoria_id || !criador_id || !cidade_id || !status_id) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Campos obrigatórios faltando: titulo, descricao, categoria_id, criador_id, cidade_id, status_id' }]
      });
    }

    // Segurança: impede que o usuário tente criar o projeto se passando por outra conta
    if (parseInt(criador_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para criar um projeto para esta conta' }]
      });
    }

    const projeto = await Projeto.create({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
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

    return res.status(201).json({
      message: 'Projeto criado com sucesso',
      data: projetoCompleto
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/projetos/:id - Atualizar projeto (com sincronização de serviços)
router.put('/:id', autenticar, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, categoria_id, cidade_id, data_inicio, data_fim, meta_participantes, status_id } = req.body;

    const projeto = await Projeto.findByPk(id);

    if (!projeto) {
      return res.status(404).json({
        message: 'Projeto não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede que usuários editem projetos alheios
    if (projeto.criador_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para editar este projeto' }]
      });
    }

    const statusMudou = status_id && projeto.status_id !== status_id;
    const statusAnterior = projeto.status_id;

    if (titulo) projeto.titulo = titulo.trim();
    if (descricao) projeto.descricao = descricao.trim();
    if (categoria_id) projeto.categoria_id = categoria_id;
    if (cidade_id) projeto.cidade_id = cidade_id;
    if (data_inicio) projeto.data_inicio = data_inicio;
    if (data_fim) projeto.data_fim = data_fim;
    if (meta_participantes) projeto.meta_participantes = meta_participantes;
    if (status_id) projeto.status_id = status_id;

    await projeto.save();

    let servicosSincronizados = 0;
    if (statusMudou) {
      const campanha_ativa = status_id === 1; // Status Ativa = 1
      const [updated] = await Servicos_disponiveis.update(
        { campanha_ativa },
        { where: { projeto_id: id } }
      );
      servicosSincronizados = updated;
    }

    const projetoAtualizado = await Projeto.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome'] },
        { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
        { model: StatusCampanha, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    const response = {
      message: 'Projeto updated com sucesso',
      data: projetoAtualizado
    };

    if (statusMudou) {
      response.info = {
        status_alterado: true,
        status_anterior: statusAnterior,
        status_novo: status_id,
        servicos_sincronizados: servicosSincronizados,
        campanha_ativa_agora: status_id === 1
      };
    }

    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/projetos/:id - Deletar projeto
router.delete('/:id', autenticar, async (req, res, next) => {
  try {
    const { id } = req.params;
    const projeto = await Projeto.findByPk(id);

    if (!projeto) {
      return res.status(404).json({
        message: 'Projeto não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    if (projeto.criador_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para deletar este projeto' }]
      });
    }

    await projeto.destroy();
    return res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
