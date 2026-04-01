#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const net = require('net');
const path = require('path');

const MYSQL_PORT = 3306;
const XAMPP_MYSQL_BIN = 'C:\\xampp\\mysql\\bin\\mysqld.exe';

/**
 * Verifica se MySQL está rodando testando a porta
 */
function isMySQLRunning() {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      port: MYSQL_PORT,
      host: 'localhost',
      timeout: 1000
    });

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * Inicia MySQL no Windows via XAMPP
 */
function startMySQL() {
  try {
    console.log('🔧 Iniciando MySQL (XAMPP)...');
    
    // No Windows, usa spawn com 'cmd.exe' para iniciar em background
    const child = spawn('cmd', ['/c', 'start /B', XAMPP_MYSQL_BIN, '--datadir=C:\\xampp\\mysql\\data', '--port=3306'], {
      shell: true,
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    
    child.unref();
    
    console.log('✅ Processo MySQL iniciado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao iniciar MySQL:', error.message);
    return false;
  }
}

/**
 * Aguarda MySQL estar disponível
 * @param {number} maxAttempts - Máximo de tentativas (padrão 40 = 40 segundos)
 */
async function waitForMySQL(maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    const running = await isMySQLRunning();
    if (running) {
      console.log('✅ MySQL está operacional');
      return true;
    }
    
    const elapsed = (i + 1);
    console.log(`⏳ Aguardando MySQL... (${elapsed}s/${maxAttempts}s)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.error('❌ Timeout: MySQL não respondeu após 40 segundos');
  return false;
}

/**
 * Sincroniza o banco de dados
 */
async function syncDatabase() {
  try {
    console.log('\n🔄 Verificando banco de dados...');
    require('dotenv').config();
    
    const { sequelize } = require('./models');
    
    // Validar conexão
    await sequelize.authenticate();
    console.log('✅ Banco de dados está operacional');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('🚀 Verificando/Iniciando banco de dados...\n');
    
    let running = await isMySQLRunning();
    
    if (!running) {
      console.log('MySQL não está rodando.');
      const started = startMySQL();
      
      if (!started) {
        console.error('\n❌ Não foi possível iniciar MySQL automaticamente');
        console.error('📋 Solução manual: Abra XAMPP Control Panel e clique em "Start" para MySQL');
        process.exit(1);
      }
      
      const available = await waitForMySQL();
      
      if (!available) {
        console.error('\n❌ MySQL não respondeu. Verifique:');
        console.error('   1. XAMPP está instalado em C:\\xampp\\');
        console.error('   2. MySQL está disponível no XAMPP');
        console.error('   3. A porta 3306 não está bloqueada');
        process.exit(1);
      }
    } else {
      console.log('✅ MySQL já está rodando\n');
    }
    
    // Sincronizar banco
    const synced = await syncDatabase();
    
    if (!synced) {
      process.exit(1);
    }
    
    console.log('\n✅ Banco de dados pronto!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar se for o arquivo principal
if (require.main === module) {
  main();
}

module.exports = { isMySQLRunning, startMySQL, waitForMySQL, syncDatabase };

