const express = require('express');
const { Info_campanha, Projeto } = require('../middleware/models');

const router = express.Router();

// GET /api/info-campanhas - Listar informações de campanhas com paginação e filtros
router.get('/', async (req, res, next) => {
  try {
    const { projeto_id, page = 1, limit = 10 } = req.query;
    
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

    const whereClause = {};
    if (projeto_id) whereClause.projeto_id = projeto_id;

    const { count, rows } = await Info_campanha.findAndCountAll({
      where: whereClause,
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ],
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

// GET /api/info-campanhas/:id - Buscar informações de campanha por ID
router.get('/:id', async (req, res, next) => {
  try {
    const infoCampanha = await Info_campanha.findByPk(req.params.id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    if (!infoCampanha) {
      return res.status(404).json({
        message: 'Informações de campanha não encontradas',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: infoCampanha });
  } catch (error) {
    return next(error);
  }
});

// POST /api/info-campanhas - Criar informações de campanha
router.post('/', async (req, res, next) => {
  try {
    const { projeto_id, objetivos, publico_alvo, impacto_esperado, regras, observacoes } = req.body;

    if (!projeto_id) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'O campo projeto_id é obrigatório' }]
      });
    }

    // Criamos o registro diretamente. Se o projeto_id não for uma chave estrangeira válida,
    // o banco rejeitará e o errorHandler responderá com FOREIGN_KEY_CONSTRAINT_ERROR.
    // Se houver validações adicionais (ex: um projeto ter apenas uma info), o erro 409/400 será automatizado.
    const infoCampanha = await Info_campanha.create({
      projeto_id,
      objetivos: objetivos?.trim() || null,
      publico_alvo: publico_alvo?.trim() || null,
      impacto_esperado: impacto_esperado?.trim() || null,
      regras: regras?.trim() || null,
      observacoes: observacoes?.trim() || null
    });

    const infoCampanhaCompleta = await Info_campanha.findByPk(infoCampanha.id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    return res.status(201).json({
      message: 'Informações de campanha criadas com sucesso',
      data: infoCampanhaCompleta
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/info-campanhas/:id - Atualizar informações de campanha
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { objetivos, publico_alvo, impacto_esperado, regras, observacoes } = req.body;

    const infoCampanha = await Info_campanha.findByPk(id);

    if (!infoCampanha) {
      return res.status(404).json({
        message: 'Informações de campanha não encontradas',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Atualização condicional e higienização das strings enviadas
    if (objetivos !== undefined) infoCampanha.objetivos = objetivos?.trim() || null;
    if (publico_alvo !== undefined) infoCampanha.publico_alvo = publico_alvo?.trim() || null;
    if (impacto_esperado !== undefined) infoCampanha.impacto_esperado = impacto_esperado?.trim() || null;
    if (regras !== undefined) infoCampanha.regras = regras?.trim() || null;
    if (observacoes !== undefined) infoCampanha.observacoes = observacoes?.trim() || null;

    await infoCampanha.save();

    const infoCampanhaAtualizada = await Info_campanha.findByPk(id, {
      include: [
        { model: Projeto, as: 'projeto', attributes: ['id', 'titulo'] }
      ]
    });

    return res.json({
      message: 'Informações de campanha atualizadas com sucesso',
      data: infoCampanhaAtualizada
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/info-campanhas/:id - Deletar informações de campanha
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const infoCampanha = await Info_campanha.findByPk(id);

    if (!infoCampanha) {
      return res.status(404).json({
        message: 'Informações de campanha não encontradas',
        code: 'NOT_FOUND_ERROR'
      });
    }

    await infoCampanha.destroy();

    return res.json({ message: 'Informações de campanha deletadas com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
