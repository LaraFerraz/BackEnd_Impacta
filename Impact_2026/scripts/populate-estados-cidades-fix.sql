-- ================================================================
-- LIMPEZA E POPULAÇÃO COMPLETA: Estados e Cidades Brasil
-- ================================================================

-- Primeiro, limpar todas as cidades
DELETE FROM Cidade WHERE estado_id > 0;

-- Depois, deletar todos os estados (exceto São Paulo se tiver)
DELETE FROM Estado WHERE pais_id = 1;

-- Resetar auto increment
ALTER TABLE Estado AUTO_INCREMENT = 1;
ALTER TABLE Cidade AUTO_INCREMENT = 1;

-- Inserir Brasil se não existir
INSERT IGNORE INTO Pais (id, nome) VALUES (1, 'Brasil');

-- ================================================================
-- INSERIR TODOS OS 27 ESTADOS
-- ================================================================
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(1, 'Acre', 'AC', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(2, 'Alagoas', 'AL', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(3, 'Amapá', 'AP', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(4, 'Amazonas', 'AM', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(5, 'Bahia', 'BA', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(6, 'Ceará', 'CE', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(7, 'Distrito Federal', 'DF', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(8, 'Espírito Santo', 'ES', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(9, 'Goiás', 'GO', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(10, 'Maranhão', 'MA', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(11, 'Mato Grosso', 'MT', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(12, 'Mato Grosso do Sul', 'MS', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(13, 'Minas Gerais', 'MG', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(14, 'Pará', 'PA', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(15, 'Paraíba', 'PB', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(16, 'Paraná', 'PR', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(17, 'Pernambuco', 'PE', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(18, 'Piauí', 'PI', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(19, 'Rio de Janeiro', 'RJ', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(20, 'Rio Grande do Norte', 'RN', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(21, 'Rio Grande do Sul', 'RS', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(22, 'Rondonia', 'RO', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(23, 'Roraima', 'RR', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(24, 'Santa Catarina', 'SC', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(25, 'Sao Paulo', 'SP', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(26, 'Sergipe', 'SE', 1);
INSERT INTO Estado (id, nome, sigla, pais_id) VALUES
(27, 'Tocantins', 'TO', 1);

-- ================================================================
-- INSERIR CIDADES (um INSERT com múltiplas linhas)
-- ================================================================
INSERT INTO Cidade (id, nome, estado_id) VALUES
(1, 'Rio Branco', 1),
(2, 'Cruzeiro do Sul', 1),
(3, 'Maceio', 2),
(4, 'Arapiraca', 2),
(5, 'Macapa', 3),
(6, 'Santana', 3),
(7, 'Manaus', 4),
(8, 'Parintins', 4),
(9, 'Salvador', 5),
(10, 'Feira de Santana', 5),
(11, 'Vitoria da Conquista', 5),
(12, 'Camacari', 5),
(13, 'Fortaleza', 6),
(14, 'Caucaia', 6),
(15, 'Juazeiro do Norte', 6),
(16, 'Brasilia', 7),
(17, 'Vitoria', 8),
(18, 'Vila Velha', 8),
(19, 'Serra', 8),
(20, 'Goiania', 9),
(21, 'Aparecida de Goiania', 9),
(22, 'Anapolis', 9),
(23, 'Sao Luis', 10),
(24, 'Imperatriz', 10),
(25, 'Cuiaba', 11),
(26, 'Varzea Grande', 11),
(27, 'Campo Grande', 12),
(28, 'Dourados', 12),
(29, 'Belo Horizonte', 13),
(30, 'Uberlandia', 13),
(31, 'Contagem', 13),
(32, 'Juiz de Fora', 13),
(33, 'Montes Claros', 13),
(34, 'Belem', 14),
(35, 'Ananindeua', 14),
(36, 'Joao Pessoa', 15),
(37, 'Campina Grande', 15),
(38, 'Curitiba', 16),
(39, 'Londrina', 16),
(40, 'Maringa', 16),
(41, 'Ponta Grossa', 16),
(42, 'Recife', 17),
(43, 'Jaboatao dos Guararapes', 17),
(44, 'Olinda', 17),
(45, 'Caruaru', 17),
(46, 'Teresina', 18),
(47, 'Paraiba', 18),
(48, 'Rio de Janeiro', 19),
(49, 'Niteroi', 19),
(50, 'Duque de Caxias', 19),
(51, 'Sao Goncalo', 19),
(52, 'Natal', 20),
(53, 'Mossoro', 20),
(54, 'Porto Alegre', 21),
(55, 'Caxias do Sul', 21),
(56, 'Pelotas', 21),
(57, 'Santa Maria', 21),
(58, 'Porto Velho', 22),
(59, 'Boa Vista', 23),
(60, 'Florianopolis', 24),
(61, 'Joinville', 24),
(62, 'Blumenau', 24),
(63, 'Sao Paulo', 25),
(64, 'Guarulhos', 25),
(65, 'Campinas', 25),
(66, 'Sao Bernardo do Campo', 25),
(67, 'Santo Andre', 25),
(68, 'Osasco', 25),
(69, 'Sorocaba', 25),
(70, 'Ribeirao Preto', 25),
(71, 'Aracaju', 26),
(72, 'Palmas', 27);



hIAGO