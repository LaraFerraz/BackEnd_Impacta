

CREATE TABLE IF NOT EXISTS Tipo_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Pais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Estado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(2) NOT NULL,
    pais_id INT NOT NULL,
    FOREIGN KEY (pais_id) REFERENCES Pais(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado_id INT NOT NULL,
    FOREIGN KEY (estado_id) REFERENCES Estado(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    cidade_id INT,
    tipo_usuario_id INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cidade_id) REFERENCES Cidade(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_usuario_id) REFERENCES Tipo_usuario(id) ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS Categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Preferencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES Categoria(id) ON DELETE CASCADE,
    UNIQUE (usuario_id, categoria_id)
);



CREATE TABLE IF NOT EXISTS Status_campanha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Projeto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    categoria_id INT NOT NULL,
    criador_id INT NOT NULL,
    cidade_id INT NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    meta_participantes INT,
    status_id INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES Categoria(id) ON DELETE RESTRICT,
    FOREIGN KEY (criador_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (cidade_id) REFERENCES Cidade(id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES Status_campanha(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Info_campanha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projeto_id INT NOT NULL,
    objetivos TEXT,
    publico_alvo TEXT,
    impacto_esperado TEXT,
    regras TEXT,
    observacoes TEXT,
    FOREIGN KEY (projeto_id) REFERENCES Projeto(id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS Status_servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Servicos_disponiveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projeto_id INT NOT NULL,
    nome_servico VARCHAR(150) NOT NULL,
    descricao TEXT,
    quantidade_necessaria INT,
    status_servico_id INT NOT NULL,
    FOREIGN KEY (projeto_id) REFERENCES Projeto(id) ON DELETE CASCADE,
    FOREIGN KEY (status_servico_id) REFERENCES Status_servico(id) ON DELETE RESTRICT
);



CREATE TABLE IF NOT EXISTS Status_participacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Participacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    projeto_id INT NOT NULL,
    servico_id INT NULL,
    data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_participacao_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES Projeto(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES Servicos_disponiveis(id) ON DELETE SET NULL,
    FOREIGN KEY (status_participacao_id) REFERENCES Status_participacao(id) ON DELETE RESTRICT
);



CREATE TABLE IF NOT EXISTS Avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    projeto_id INT NOT NULL,
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, projeto_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES Projeto(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    projeto_id INT NOT NULL,
    UNIQUE (usuario_id, projeto_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES Projeto(id) ON DELETE CASCADE
);



INSERT IGNORE INTO Tipo_usuario (id, nome) VALUES 
(1, 'Admin'),
(2, 'Usuário Regular');

INSERT IGNORE INTO Status_campanha (id, nome) VALUES 
(1, 'Planejamento'),
(2, 'Em Andamento'),
(3, 'Concluída'),
(4, 'Cancelada');

INSERT IGNORE INTO Status_servico (id, nome) VALUES 
(1, 'Disponível'),
(2, 'Preenchido'),
(3, 'Cancelado');

INSERT IGNORE INTO Status_participacao (id, nome) VALUES 
(1, 'Pendente'),
(2, 'Aprovada'),
(3, 'Rejeitada'),
(4, 'Cancelada');
