#!/usr/bin/env node

require('dotenv').config();

const express = require('express');
const net = require('net');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const mysql = require('mysql2/promise');

const MYSQL_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const XAMPP_MYSQL_BIN = 'C:\\xampp\\mysql\\bin\\mysqld.exe';
const XAMPP_DATA_DIR = 'C:\\xampp\\mysql\\data';

/**
 * Verifica se o serviço do MySQL está rodando através de varredura de socket TCP
 * @returns {Promise<boolean>}
 */
const isMySQLRunning = () => {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      port: MYSQL_PORT,
      host: 'localhost',
      timeout: 1000
    });

    socket.on('connect', () => {
      socket.destroy();
      return resolve(true);
    });

    const failAndDestroy = () => {
      socket.destroy();
      return resolve(false);
    };

    socket.on('error', failAndDestroy);
    socket.on('timeout', failAndDestroy);
  });
};

/**
 * Inicia a instância do MySQL em background no ecossistema Windows (XAMPP)
 * @returns {boolean} Status do disparo do processo filha
 */
const startMySQL = () => {
  try {
    console.log('[Database Boot] Iniciando MySQL daemon (XAMPP)...');
    
    // Configura os argumentos de execução isolada em linha de comando Windows
    const args = [
      '/c', 
      'start', 
      '/B', 
      XAMPP_MYSQL_BIN, 
      `--datadir=${XAMPP_DATA_DIR}`, 
      `--port=${MYSQL_PORT}`
    ];

    const child = spawn('cmd.exe', args, {
      shell: true,
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    
    child.unref();
    
    console.log('[Database Boot] Processo de inicialização do MySQL invocado');
    return true;
  } catch (error) {
    console.error(`[Database Error] Falha ao invocar binário do MySQL: ${error.message}`);
    return false;
  }
};

/**
 * Bloqueia a thread principal aguardando a resposta estável do socket TCP do banco
 * @param {number} maxAttempts Máximo de tentativas (Padrão: 40 segundos)
 * @returns {Promise<boolean>}
 */
const waitForMySQL = async (maxAttempts = 40) => {
  for (let i = 0; i < maxAttempts; i++) {
    const running = await isMySQLRunning();
    if (running) {
      console.log('[Database Boot] Conexão TCP estabelecida com sucesso');
      return true;
    }
    
    console.log(`[Database Boot] Aguardando resposta do banco... (${i + 1}s/${maxAttempts}s)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.error('[Database Error] Timeout: O serviço MySQL não respondeu no tempo limite');
  return false;
};

/**
 * Cria o banco de dados e popula as tabelas estruturais executando o script SQL físico
 * @returns {Promise<boolean>}
 */
const createDatabaseFromSQL = async () => {
  let connection;
  try {
    console.log('[Database Provision] Provisionando estrutura através do script SQL original...');
    
    const sqlFile = path.join(__dirname, '../scripts/init-impact-db.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Arquivo SQL de inicialização não localizado em: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Estabelece conexão administrativa temporária direto na raiz do engine
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: MYSQL_PORT,
      multipleStatements: true
    });
    
    await connection.query(sql);
    console.log('[Database Provision] Banco de dados e tabelas populados com sucesso');
    return true;
  } catch (error) {
    console.error(`[Database Error] Falha na execução do script SQL: ${error.message}`);
    return false;
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Sincroniza e autentica o ORM Sequelize com a base de dados ativa
 * @returns {Promise<boolean>}
 */
const syncDatabase = async () => {
  try {
    console.log('[Database Sync] Verificando integridade das tabelas via ORM...');
    
    const { sequelize } = require('./middleware/models');
    
    await sequelize.authenticate();
    console.log('[Database Sync] Instância do Sequelize sincronizada e autenticada');
    return true;
  } catch (error) {
    // Intercepta falha de ausência de schema e invoca automação de criação
    if (error.message.includes('Unknown database')) {
      console.log('[Database Sync] Alerta: Catálogo padrão não localizado na instância.');
      const created = await createDatabaseFromSQL();
      
      if (!created) return false;
      
      try {
        const { sequelize: retrySequelize } = require('./middleware/models');
        await retrySequelize.authenticate();
        console.log('[Database Sync] Instância reavaliada e conectada após provisionamento');
        return true;
      } catch (retryError) {
        console.error(`[Database Error] Erro ao reconectar após provisionamento: ${retryError.message}`);
        return false;
      }
    }
    
    console.error(`[Database Error] Falha crítica na sincronização de metadados: ${error.message}`);
    return false;
  }
};

/**
 * Fluxo de execução principal (Bootstrap do Script)
 */
const main = async () => {
  try {
    console.log('[Orchestrator] Inicializando rotina de checagem do ambiente de persistência...\n');
    
    const isRunning = await isMySQLRunning();
    
    if (!isRunning) {
      console.log('[Orchestrator] MySQL inativo.');
      const processDispatched = startMySQL();
      
      if (!processDispatched) {
        console.error('\n[Orchestrator] Falha Crítica: Não foi possível disparar o binário do MySQL');
        console.error('[Manual Action] Abra o painel do XAMPP e ative o serviço MySQL manualmente');
        return process.exit(1);
      }
      
      const isAvailable = await waitForMySQL();
      if (!isAvailable) {
        console.error('\n[Orchestrator] Falha Crítica: O processo MySQL não estabilizou a porta de escuta');
        console.error('[Diagnostics] 1. Certifique-se de que o XAMPP está instalado em C:\\xampp\\');
        console.error(`[Diagnostics] 2. Certifique-se de que a porta ${MYSQL_PORT} não está em uso`);
        return process.exit(1);
      }
    } else {
      console.log('[Orchestrator] MySQL já operacional na porta designada\n');
    }
    
    const executionSynced = await syncDatabase();
    if (!executionSynced) {
      return process.exit(1);
    }
    
    console.log('\n[Orchestrator] Sucesso: Infraestrutura de dados pronta para uso operacional!\n');
    return process.exit(0);
  } catch (error) {
    console.error(`[Fatal Error] Erro inesperado na rotina do orquestrador: ${error.message}`);
    return process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { 
  isMySQLRunning, 
  startMySQL, 
  waitForMySQL, 
  syncDatabase, 
  createDatabaseFromSQL 
};