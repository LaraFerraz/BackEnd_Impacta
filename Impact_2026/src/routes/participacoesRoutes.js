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

// Aplicando autenticação global para este arquivo de rotas (Garante segurança máxima)
router.use(autenticar);

// GET /api/participacoes - Listar participações com filtros (Geralmente restrito a Admins)
router.get('/', async (req, res, next) => {
  try {
    const { usuario_id, projeto_id, status_participacao_id, page = 1, limit = 10 } = req.query;
    
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

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

// GET /api/participacoes/:id - Buscar participação detalhada por ID
router.get('/:id', async (req, res, next) => {
  try {
    const participacao = await Participacoes.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo', 'descricao'] },
        { model: Servicos_disponiveis, as: 'servico', attributes: ['id', 'nome_servico'], required: false },
        { model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    if (!participacao) {
      return res.status(404).json({
        message: 'Participação não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede que um usuário comum veja os detalhes da inscrição de outro
    if (participacao.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para visualizar este recurso' }]
      });
    }

    return res.json({ data: participacao });
  } catch (error) {
    return next(error);
  }
});

// POST /api/participacoes - Criar nova participação (Inscrição)
router.post('/', async (req, res, next) => {
  try {
    const { usuario_id, projeto_id, servico_id, status_participacao_id } = req.body;

    if (!usuario_id || !projeto_id) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Campos obrigatórios faltando: usuario_id, projeto_id' }]
      });
    }

    // Segurança: impede que o usuário autenticado tente inscrever outra pessoa
    if (parseInt(usuario_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não pode realizar uma inscrição em nome de outra conta' }]
      });
    }

    // Default: Se status não for enviado, assume ID 1 (Ex: Pendente)
    const statusId = status_participacao_id || 1;

    // Criamos o registro diretamente. Se o par (usuario_id, projeto_id) violar o índice 
    // unique do banco de dados, o Error Handler capturará e enviará um UNIQUE_CONSTRAINT_VIOLATION.
    const participacao = await Participacoes.create({
      usuario_id,
      projeto_id,
      servico_id: servico_id || null,
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

    return res.status(201).json({
      message: 'Inscrição realizada com sucesso! Sua participação está pendente de confirmação.',
      data: participacaoCompleta
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/participacoes/:id - Atualizar dados da participação
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { servico_id, status_participacao_id } = req.body;

    const participacao = await Participacoes.findByPk(id);

    if (!participacao) {
      return res.status(404).json({
        message: 'Participação não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede que um usuário altere inscrições que pertencem a outra pessoa
    if (participacao.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para editar esta participação' }]
      });
    }

    // Atualiza apenas se os campos forem fornecidos e trata valores vazios
    if (servico_id !== undefined) participacao.servico_id = servico_id || null;
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

    return res.json({
      message: 'Participação atualizada com sucesso',
      data: participacaoAtualizada
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/participacoes/:id - Cancelar/Deletar participação
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const participacao = await Participacoes.findByPk(id);

    if (!participacao) {
      return res.status(404).json({
        message: 'Participação não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede a deleção de registros de outros usuários
    if (participacao.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para deletar esta participação' }]
      });
    }

    await participacao.destroy();
    return res.json({ message: 'Participação deletada com sucesso' });
  } catch (error) {
    return next(error);
  }
});

// GET /api/participacoes/usuario/:usuario_id/campanhas - Listar inscrições no perfil do usuário autenticado
router.get('/usuario/:usuario_id/campanhas', async (req, res, next) => {
  try {
    const { usuario_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Segurança: Garante que um usuário só puxe o histórico de si mesmo
    if (parseInt(usuario_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para visualizar o histórico deste usuário' }]
      });
    }

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await Participacoes.findAndCountAll({
      where: { usuario_id },
      include: [
        {
          model: Projeto,
          as: 'projeto',
          attributes: ['id', 'titulo', 'descricao', 'data_criacao', 'data_inicio', 'data_fim', 'meta_participantes'],
          include: [
            { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] },
            { model: Usuario, as: 'criador', attributes: ['id', 'nome'] },
            { model: StatusCampanha, as: 'status', attributes: ['id', 'nome'] }
          ]
        },
        { model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }
      ],
      order: [['data_inscricao', 'DESC']],
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

// GET /api/participacoes/usuario/:usuario_id/projeto/:projeto_id/existe - Verificar estado atual da inscrição
router.get('/usuario/:usuario_id/projeto/:projeto_id/existe', async (req, res, next) => {
  try {
    const { usuario_id, projeto_id } = req.params;

    if (parseInt(usuario_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não possui permissão para consultar os dados deste usuário' }]
      });
    }

    const participacao = await Participacoes.findOne({
      where: { usuario_id, projeto_id },
      include: [
        { model: StatusParticipacao, as: 'status', attributes: ['id', 'nome'] }
      ]
    });

    return res.json({
      data: {
        existe: !!participacao,
        detalhes: participacao || null
      }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
