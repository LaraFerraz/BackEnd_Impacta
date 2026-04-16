-- ================================================================
-- POPULAR BANCO COM DADOS DE TESTE
-- ================================================================

-- Limpar dados existentes
DELETE FROM Tipo_usuario WHERE id > 2;
DELETE FROM Usuario WHERE id > 0;
DELETE FROM Pais WHERE id > 1;

-- Resetar auto increment
ALTER TABLE Usuario AUTO_INCREMENT = 1;
ALTER TABLE Pais AUTO_INCREMENT = 1;

-- Inserir Brasil
INSERT IGNORE INTO Pais (id, nome) VALUES (1, 'Brasil');

-- ================================================================
-- INSERIR TIPOS DE USUÁRIO
-- ================================================================
DELETE FROM Tipo_usuario;
INSERT INTO Tipo_usuario (id, nome) VALUES
(1, 'Admin'),
(2, 'Usuário Regular');

-- ================================================================
-- INSERIR USUÁRIOS DE TESTE
-- ================================================================
INSERT INTO Usuario (id, nome, email, senha, telefone, cpf, cidade_id, tipo_usuario_id, data_criacao) VALUES
(1, 'Admin Impacta', 'admin@impacta.com', '$2b$10$YourHashedPasswordHere', '11999999999', '12345678901234', 63, 1, NOW()),
(2, 'João Silva', 'joao@test.com', '$2b$10$YourHashedPasswordHere', '11988888888', '12345678901235', 63, 2, NOW()),
(3, 'Maria Santos', 'maria@test.com', '$2b$10$YourHashedPasswordHere', '21987654321', '12345678901236', 48, 2, NOW()),
(4, 'Pedro Oliveira', 'pedro@test.com', '$2b$10$YourHashedPasswordHere', '85986543210', '12345678901237', 13, 2, NOW()),
(5, 'Ana Costa', 'ana@test.com', '$2b$10$YourHashedPasswordHere', '31998765432', '12345678901238', 29, 2, NOW()),
(6, 'Carlos Mendes', 'carlos@test.com', '$2b$10$YourHashedPasswordHere', '47984321098', '12345678901239', 60, 2, NOW()),
(7, 'Lucia Ferreira', 'lucia@test.com', '$2b$10$YourHashedPasswordHere', '48987654321', '12345678901240', 62, 2, NOW()),
(8, 'Roberto Alves', 'roberto@test.com', '$2b$10$YourHashedPasswordHere', '51988776655', '12345678901241', 54, 2, NOW()),
(9, 'Fernanda Gomes', 'fernanda@test.com', '$2b$10$YourHashedPasswordHere', '61987654321', '12345678901242', 16, 2, NOW()),
(10, 'Giovanni Santos', 'giovanni@test.com', '$2b$10$YourHashedPasswordHere', '85988776655', '12345678901243', 71, 2, NOW());

-- ================================================================
-- INSERIR CAMPANHAS DE TESTE
-- ================================================================
INSERT INTO Projeto (id, titulo, descricao, categoria_id, criador_id, cidade_id, data_inicio, data_fim, meta_participantes, status_id, data_criacao) VALUES
(1, 'Limpeza da Praia de Copacabana', 
 'Campanha de limpeza e conscientização ambiental na praia de Copacabana. Vamos juntos cuidar do nosso litoral!',
 3, 3, 48, '2026-06-01', '2026-06-30', 150, 2, NOW()),

(2, 'Educação Digital para Idosos',
 'Oferecemos aulas gratuitas de informática e internet para idosos. Ajude a reduzir a exclusão digital!',
 1, 2, 63, '2026-05-15', '2026-08-15', 200, 2, NOW()),

(3, 'Horta Comunitária Sustentável',
 'Criação de uma horta comunitária no bairro para promover alimentação saudável e educação ambiental.',
 3, 5, 29, '2026-07-01', '2026-12-31', 100, 1, NOW()),

(4, 'Campanha de Vacinação Infantil',
 'Mobilização para aumentar as taxas de vacinação em crianças menores de 5 anos.',
 2, 4, 13, '2026-06-10', '2026-07-10', 500, 2, NOW()),

(5, 'Reforma da Escola Municipal',
 'Voluntários ajudando na reforma e pintura da escola municipal da comunidade.',
 1, 7, 62, '2026-05-20', '2026-07-20', 80, 1, NOW()),

(6, 'Coleta e Reciclagem de Eletrônicos',
 'Campanha de coleta de lixo eletrônico para reciclagem responsável e educação sobre sustentabilidade.',
 3, 6, 60, '2026-06-15', '2026-08-15', 120, 2, NOW()),

(7, 'Distribuição de Alimentos',
 'Arrecadação e distribuição de alimentos para famílias em situação de vulnerabilidade.',
 8, 9, 16, '2026-05-01', '2026-005-30', 200, 2, NOW()),

(8, 'Aulas de Reforço Escolar',
 'Oferecemos aulas gratuitas de reforço em Português, Matemática e Ciências para alunos do ensino fundamental.',
 1, 2, 70, '2026-04-15', '2026-12-31', 50, 2, NOW()),

(9, 'Programa de Saúde Preventiva',
 'Campanha de conscientização sobre saúde preventiva e distribuição de panfletos educativos.',
 2, 8, 54, '2026-06-20', '2026-07-20', 300, 1, NOW()),

(10, 'Iniciativa de Empoderamento Feminino',
 'Workshops e palestras sobre empoderamento feminino, direitos e autonomia financeira.',
 1, 3, 71, '2026-07-01', '2026-09-30', 150, 1, NOW());

-- ================================================================
-- INSERIR INFORMAÇÕES DE CAMPANHAS
-- ================================================================
INSERT INTO Info_campanha (projeto_id, objetivos, publico_alvo, impacto_esperado, regras, observacoes) VALUES
(1, 
 'Limpar 5km de praia e conscientizar sobre poluição marinha',
 'Adultos e jovens com idade mínima de 16 anos',
 'Remoção de 5 toneladas de resíduos e sensibilização de 500+ pessoas',
 'Trazer equipamento de proteção pessoal. Menores de 18 devem ser acompanhados por responsável.',
 'Contato: joao@impacta.com'),

(2,
 'Ensinar noções básicas de informática e navegação na internet',
 'Idosos com idade acima de 60 anos',
 'Capacitação de 100+ pessoas na área digital',
 'Sem pré-requisitos. Aulas em grupos de 10-15 pessoas',
 'Local: Centro Comunitário de São Paulo'),

(3,
 'Criar espaço verde e produzir alimentos organicamente',
 'Moradores do bairro, especialmente crianças e famílias',
 'Redução de gastos com alimentação e educação ambiental',
 'Participação semanal mínima de 4 horas',
 'Contato: ana@impacta.com'),

(4,
 'Aumentar cobertura vacinal de menores de 5 anos',
 'Pais e responsáveis de crianças menores de 5 anos',
 'Vacinação de 500+ crianças',
 'Voluntários devem ter experiência ou treinamento em saúde pública',
 'Apoio de profissionais de saúde local'),

(5,
 'Melhorar infraestrutura da escola municipal',
 'Alunos, pais e comunidade geral',
 'Escola com infraestrutura melhorada e maior atratividade',
 'Experiência em reforma e pintura é bem-vinda mas não obrigatória',
 'Horários podem ser ajustados conforme disponibilidade'),

(6,
 'Coletar e reciclar resíduos eletrônicos de forma responsável',
 'Moradores e empresas com equipamentos obsoletos',
 'Coleta de 2 toneladas de eletrônicos',
 'Equipamentos devem estar seguros para manipulação',
 'Parceria com empresas de reciclagem certificadas'),

(7,
 'Garantir segurança alimentar para famílias necessitadas',
 'Famílias de baixa renda inscritas no programa social',
 'Alimentação garantida para 200+ pessoas mensalmente',
 'Voluntários devem ajudar na seleção, embalagem e distribuição',
 'Contato: fernando@impacta.com'),

(8,
 'Melhorar desempenho acadêmico em disciplinas essenciais',
 'Alunos do ensino fundamental com dificuldades de aprendizado',
 'Melhora de 30% no desempenho acadêmico',
 'Máximo 15 alunos por turma. Frequência mínima de 80%',
 'Aulas 3x por semana, 1,5h cada'),

(9,
 'Promover hábitos de vida saudável na comunidade',
 'Moradores de todas as idades',
 'Conscientização de 500+ pessoas',
 'Voluntários devem ser sensibilizados sobre saúde preventiva',
 'Material educativo: panfletos e vídeos'),

(10,
 'Empoderar mulheres através de educação e capacitação',
 'Mulheres de 18 a 60 anos de todas as classes sociais',
 'Capacitação de 150+ mulheres e aumento de autonomia',
 'Espaço seguro para discussão e aprendizado. Palestras em português',
 'Oferecemos certificados de participação');

-- ================================================================
-- VALIDAÇÃO
-- ================================================================
SELECT 'USUÁRIOS INSERIDOS' as INFO;
SELECT COUNT(*) as total_usuarios FROM Usuario;

SELECT 'CAMPANHAS INSERIDAS' as INFO;
SELECT COUNT(*) as total_campanhas FROM Projeto;
SELECT COUNT(*) as total_infos FROM Info_campanha;

SELECT 'DETALHES DAS CAMPANHAS' as INFO;
SELECT p.id, p.titulo, u.nome as criador, c.nome as cidade, sc.nome as status
FROM Projeto p
JOIN Usuario u ON p.criador_id = u.id
JOIN Cidade c ON p.cidade_id = c.id
JOIN Status_campanha sc ON p.status_id = sc.id
ORDER BY p.id;
