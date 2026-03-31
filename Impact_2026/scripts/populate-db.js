#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const config = {
  host: '127.0.0.1',
  user: 'root',
  password: null,
  database: 'impacta',
  port: 3306
};

async function executarSQLFile(filePath) {
  let connection;
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao banco de dados');

    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Divide o arquivo SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`\n📋 Executando ${commands.length} comandos SQL...\n`);

    for (let i = 0; i < commands.length; i++) {
      try {
        const comando = commands[i];
        console.log(`[${i + 1}/${commands.length}] Executando comando...`);
        
        // Executa o comando
        await connection.query(comando);
        
        // Extrai o tipo de comando para log
        const tipoCmd = comando.match(/^(CREATE|INSERT|ALTER|DROP|UPDATE|DELETE)/i)?.[1] || 'SQL';
        console.log(`  ✅ ${tipoCmd} executado com sucesso`);
      } catch (error) {
        // Ignora erros sobre tabelas/restrições já existentes
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.code === 'ER_DUP_ENTRY' ||
            error.code === 'ER_FK_NO_REFERENCED_ROW' ||
            error.message.includes('already exists')) {
          console.log(`  ⚠️  Aviso: ${error.message.split('\n')[0]}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Todas as tabelas foram criadas com sucesso!');
    console.log('\n📊 Verificando tabelas criadas...');

    const [tabelas] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [config.database]
    );

    console.log(`\n📋 Tabelas no banco de dados (Total: ${tabelas.length}):`);
    tabelas.forEach(t => console.log(`  • ${t.TABLE_NAME}`));

  } catch (error) {
    console.error('\n❌ Erro ao executar scripts SQL:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

// Executa o script
const sqlFile = path.join(__dirname, 'create-tables.sql');

if (!fs.existsSync(sqlFile)) {
  console.error(`❌ Arquivo SQL não encontrado: ${sqlFile}`);
  process.exit(1);
}

console.log('================================');
console.log('🚀 Inicializando banco de dados');
console.log('================================\n');

executarSQLFile(sqlFile)
  .then(() => {
    console.log('\n✨ Banco de dados pronto para usar!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
