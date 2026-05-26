/** * Configuração Estrutural do Framework de Testes Jest
 * @type {import('jest').Config}
 */
module.exports = {
  // Define o ambiente de runtime isolado (Back-end Node.js)
  testEnvironment: 'node',

  // Padrões de busca globais para localização automática de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.js', 
    '**/?(*.)+(spec|test).js'
  ],

  // Escopo de captura para geração de relatórios estatísticos de cobertura (Code Coverage)
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',              // Ponto de entrada / Bootstrap do servidor
    '!src/middleware/models/**',   // Modelos brutos e definições do Sequelize ORM
    '!src/config/**',             // Arquivos estáticos de credenciais e parâmetros
    '!**/node_modules/**',        // Dependências de terceiros (Garantia redundante)
  ],

  // Diretórios e caminhos explicitamente ignorados na esteira de volumetria de cobertura
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/scripts/',                  // Scripts de automação dev/ops (Ex: init-db.js, verify-data.js)
    '/coverage/'                  // Evita que o Jest analise o próprio relatório gerado anteriormente
  ],

  // Tempo limite rigoroso para execução de cada bloco de teste (Prevenção de Deadlocks / Timeouts em CI/CD)
  testTimeout: 10000,

  // Força a exibição detalhada individual de cada caso de teste durante o log de terminal
  verbose: true,

  // Limpa automaticamente o histórico de chamadas de Mocks e Spies entre cada execução de teste
  clearMocks: true,

  // Restaura o estado original de todas as propriedades modificadas por mocks entre os testes
  restoreMocks: true
};
