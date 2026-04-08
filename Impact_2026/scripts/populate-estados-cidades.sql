-- ================================================================
-- SCRIPT: Popular Estados e Cidades do Brasil
-- ================================================================

-- Verificar se Pais Brasil já existe
INSERT IGNORE INTO Pais (id, nome) VALUES (1, 'Brasil');

-- Inserir todos os 27 estados brasileiros
INSERT IGNORE INTO Estado (id, nome, sigla, pais_id) VALUES
(1, 'Acre', 'AC', 1),
(2, 'Alagoas', 'AL', 1),
(3, 'Amapá', 'AP', 1),
(4, 'Amazonas', 'AM', 1),
(5, 'Bahia', 'BA', 1),
(6, 'Ceará', 'CE', 1),
(7, 'Distrito Federal', 'DF', 1),
(8, 'Espírito Santo', 'ES', 1),
(9, 'Goiás', 'GO', 1),
(10, 'Maranhão', 'MA', 1),
(11, 'Mato Grosso', 'MT', 1),
(12, 'Mato Grosso do Sul', 'MS', 1),
(13, 'Minas Gerais', 'MG', 1),
(14, 'Pará', 'PA', 1),
(15, 'Paraíba', 'PB', 1),
(16, 'Paraná', 'PR', 1),
(17, 'Pernambuco', 'PE', 1),
(18, 'Piauí', 'PI', 1),
(19, 'Rio de Janeiro', 'RJ', 1),
(20, 'Rio Grande do Norte', 'RN', 1),
(21, 'Rio Grande do Sul', 'RS', 1),
(22, 'Rondônia', 'RO', 1),
(23, 'Roraima', 'RR', 1),
(24, 'Santa Catarina', 'SC', 1),
(25, 'São Paulo', 'SP', 1),
(26, 'Sergipe', 'SE', 1),
(27, 'Tocantins', 'TO', 1);

-- ================================================================
-- CIDADES POR ESTADO (Principais cidades de cada estado)
-- ================================================================

-- Acre (AC)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(1, 'Rio Branco', 1),
(2, 'Cruzeiro do Sul', 1);

-- Alagoas (AL)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(3, 'Maceió', 2),
(4, 'Arapiraca', 2);

-- Amapá (AP)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(5, 'Macapá', 3),
(6, 'Santana', 3);

-- Amazonas (AM)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(7, 'Manaus', 4),
(8, 'Parintins', 4);

-- Bahia (BA)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(9, 'Salvador', 5),
(10, 'Feira de Santana', 5),
(11, 'Vitória da Conquista', 5),
(12, 'Camaçari', 5);

-- Ceará (CE)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(13, 'Fortaleza', 6),
(14, 'Caucaia', 6),
(15, 'Juazeiro do Norte', 6);

-- Distrito Federal (DF)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(16, 'Brasília', 7);

-- Espírito Santo (ES)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(17, 'Vitória', 8),
(18, 'Vila Velha', 8),
(19, 'Serra', 8);

-- Goiás (GO)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(20, 'Goiânia', 9),
(21, 'Aparecida de Goiânia', 9),
(22, 'Anápolis', 9);

-- Maranhão (MA)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(23, 'São Luís', 10),
(24, 'Imperatriz', 10);

-- Mato Grosso (MT)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(25, 'Cuiabá', 11),
(26, 'Várzea Grande', 11);

-- Mato Grosso do Sul (MS)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(27, 'Campo Grande', 12),
(28, 'Dourados', 12);

-- Minas Gerais (MG)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(29, 'Belo Horizonte', 13),
(30, 'Uberlândia', 13),
(31, 'Contagem', 13),
(32, 'Juiz de Fora', 13),
(33, 'Montes Claros', 13);

-- Pará (PA)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(34, 'Belém', 14),
(35, 'Ananindeua', 14);

-- Paraíba (PB)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(36, 'João Pessoa', 15),
(37, 'Campina Grande', 15);

-- Paraná (PR)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(38, 'Curitiba', 16),
(39, 'Londrina', 16),
(40, 'Maringá', 16),
(41, 'Ponta Grossa', 16);

-- Pernambuco (PE)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(42, 'Recife', 17),
(43, 'Jaboatão dos Guararapes', 17),
(44, 'Olinda', 17),
(45, 'Caruaru', 17);

-- Piauí (PI)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(46, 'Teresina', 18),
(47, 'Parnaíba', 18);

-- Rio de Janeiro (RJ)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(48, 'Rio de Janeiro', 19),
(49, 'Niterói', 19),
(50, 'Duque de Caxias', 19),
(51, 'São Gonçalo', 19);

-- Rio Grande do Norte (RN)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(52, 'Natal', 20),
(53, 'Mossoró', 20);

-- Rio Grande do Sul (RS)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(54, 'Porto Alegre', 21),
(55, 'Caxias do Sul', 21),
(56, 'Pelotas', 21),
(57, 'Santa Maria', 21);

-- Rondônia (RO)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(58, 'Porto Velho', 22);

-- Roraima (RR)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(59, 'Boa Vista', 23);

-- Santa Catarina (SC)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(60, 'Florianópolis', 24),
(61, 'Joinville', 24),
(62, 'Blumenau', 24);

-- São Paulo (SP)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(63, 'São Paulo', 25),
(64, 'Guarulhos', 25),
(65, 'Campinas', 25),
(66, 'São Bernardo do Campo', 25),
(67, 'Santo André', 25),
(68, 'Osasco', 25),
(69, 'Sorocaba', 25),
(70, 'Ribeirão Preto', 25);

-- Sergipe (SE)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(71, 'Aracaju', 26);

-- Tocantins (TO)
INSERT IGNORE INTO Cidade (id, nome, estado_id) VALUES
(72, 'Palmas', 27);


Hiago