-- ============================================
-- Script de Migração: Adicionar coluna campanha_ativa
-- ============================================
-- Este script adiciona o campo campanha_ativa à tabela Servicos_disponiveis
-- e sincroniza o status com base no status do projeto relacionado

-- 1. Adicionar coluna (se não existir)
ALTER TABLE Servicos_disponiveis 
ADD COLUMN IF NOT EXISTS campanha_ativa BOOLEAN DEFAULT TRUE 
COMMENT 'Indica se a campanha do projeto ainda está ativa';

-- 2. Sincronizar valores baseado no status do projeto
-- (Status Ativa = 1, Concluída = 2, Pausada = 3)
UPDATE Servicos_disponiveis sd
JOIN Projeto p ON sd.projeto_id = p.id
SET sd.campanha_ativa = (p.status_id = 1);

-- 3. Criar índice para melhor performance em filtros
CREATE INDEX IF NOT EXISTS idx_servicos_campanha_ativa 
  ON Servicos_disponiveis(campanha_ativa);

CREATE INDEX IF NOT EXISTS idx_servicos_projeto_campanha 
  ON Servicos_disponiveis(projeto_id, campanha_ativa);

-- 4. Verificar resultado da migração
SELECT 
    COUNT(*) as total_servicos,
    SUM(CASE WHEN campanha_ativa = 1 THEN 1 ELSE 0 END) as servicos_campanhas_ativas,
    SUM(CASE WHEN campanha_ativa = 0 THEN 1 ELSE 0 END) as servicos_campanhas_inativas
FROM Servicos_disponiveis;

-- 5. Visualizar exemplo de serviços com status de campanha
SELECT 
    sd.id,
    sd.nome_servico,
    p.titulo as campanha,
    sc.nome as status_campanha,
    sd.campanha_ativa,
    ss.nome as status_servico
FROM Servicos_disponiveis sd
JOIN Projeto p ON sd.projeto_id = p.id
JOIN Status_campanha sc ON p.status_id = sc.id
JOIN Status_servico ss ON sd.status_servico_id = ss.id
LIMIT 10;
