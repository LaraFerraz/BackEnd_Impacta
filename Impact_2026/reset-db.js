#!/usr/bin/env node

require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const resetDatabase = async () => {
  let connection;
  
  // Caminho do arquivo SQL centralizado na raiz de scripts do projeto
  const sqlFilePath = path.join(__dirname, 'scripts', 'reset-db.sql');

  try {
    console.log('[Database Governor] === INICIANDO PROCEDIMENTO DE RESET E PURGA DA BASE ===\n');

    // Validação preventiva: impede falha de execução se o arquivo SQL não existir
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Arquivo SQL de inicialização não localizado no caminho: ${sqlFilePath}`);
    }

    // Carregamento dinâmico de infraestrutura via variáveis de ambiente com fallback seguro
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      multipleStatements: true // Mantido para suportar scripts SQL multi-comando de migração/purga
    });

    console.log(`[Database Governor] Lendo e parseando script estrutural: ${path.basename(sqlFilePath)}`);
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('[Database Governor] Executando comandos SQL estruturais em lote (DFA)...');
    
    // Executa a purga e recriação das tabelas
    await connection.query(sqlScript);
    
    console.log('[Database Governor] Sucesso: Operação de reset concluída e tabelas limpas.');
    process.exit(0);

  } catch (error) {
    console.error(`[Fatal Error] Ocorreu uma exceção crítica na rotina de reset do banco: ${error.message}`);
    process.exit(1);
  } finally {
    // Blindagem de vazamento de sockets (Connection Leaks)
    if (connection) {
      await connection.end();
      console.log('[Database Governor] Conexão com o driver MySQL encerrada com segurança.');
    }
  }
};

// Dispara o executor apenas se invocado diretamente via linha de comando (CLI)
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };
