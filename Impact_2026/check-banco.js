#!/usr/bin/env node

require('dotenv').config();

const mysql = require('mysql2/promise');

const main = async () => {
  let connection;

  try {
    // Carrega credenciais dinamicamente com fallback seguro
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'impacta',
      port: parseInt(process.env.DB_PORT, 10) || 3306
    });

    console.log('[Data Verification] === INICIANDO AUDITORIA DE DEPENDÊNCIAS DE CADASTRO ===\n');

    // 1. Validar e Auditar Tabela de Usuários
    const [usuarios] = await connection.execute('SELECT id, nome, email FROM Usuario LIMIT 1');
    console.log(`[Data Verification] Registro de usuários carregado. Amostra disponível: ${usuarios.length}`);
    if (usuarios.length > 0) {
      console.log('  Exemplo de payload de usuário ativo:', usuarios[0]);
    } else {
      console.log('  Alerta Crítico: NENHUM USUÁRIO ENCONTRADO NO CATÁLOGO ATUAL!');
    }

    // 2. Validar e Auditar Tabela de Categorias
    const [categorias] = await connection.execute('SELECT id, nome FROM Categoria LIMIT 1');
    console.log(`[Data Verification] Registro de categorias carregado. Amostra disponível: ${categorias.length}`);
    if (categorias.length > 0) {
      console.log('  Exemplo de categoria mapeada:', categorias[0]);
    }

    // 3. Validar e Auditar Tabela de Cidades
    console.log('[Data Verification] Mapeando tabela de dados demográficos (Cidades)...');
    const [cidades] = await connection.execute('SELECT id, nome FROM Cidade LIMIT 1');
    const [totalCidadesResult] = await connection.execute('SELECT COUNT(*) as total FROM Cidade');
    const totalCidades = totalCidadesResult[0]?.total || 0;
    
    console.log(`  Total de municípios indexados no banco: ${totalCidades}`);
    if (cidades.length > 0) {
      console.log('  Exemplo de município padrão:', cidades[0]);
    }

    // 4. Validar e Auditar Tabela de Status de Campanha
    const [statusCampanha] = await connection.execute('SELECT id, nome FROM Status_campanha');
    console.log(`[Data Verification] Status de campanhas cadastrados no banco: ${statusCampanha.length}`);
    if (statusCampanha.length > 0) {
      console.log('  Estados operacionais mapeados:', statusCampanha);
    }

    // 5. Auditar Projetos Existentes (Volumetria)
    const [projetosResult] = await connection.execute('SELECT COUNT(*) as total FROM Projeto');
    console.log(`[Data Verification] Total de projetos já criados e registrados: ${projetosResult[0].total}`);

    // =========================================================================
    // Avaliação de Prontidão de Banco de Dados (Pre-flight Check)
    // =========================================================================
    console.log('\n[Data Verification] === ANÁLISE DE MATRIZ DE DEPENDÊNCIA ===');
    
    const possuiUsuarios = usuarios.length > 0;
    const possuiCategorias = categorias.length > 0;
    const possuiCidades = totalCidades > 0;
    const possuiStatus = statusCampanha.length > 0;

    const prontidaoDoSistema = possuiUsuarios && possuiCategorias && possuiCidades && possuiStatus;
    
    if (prontidaoDoSistema) {
      console.log('[Data Verification] Sucesso: Todos os dados necessários para injeção existem na base!');
      console.log('\n[Data Payload Blueprint] Modelo de Payload válido para testar "POST /api/projetos":');
      console.log(JSON.stringify({
        titulo: 'Campanha de Teste Otimizada',
        descricao: 'Uma campanha de teste estruturada para validação de esteira de integração.',
        categoria_id: categorias[0].id,
        criador_id: usuarios[0].id,
        cidade_id: cidades[0]?.id || 1,
        data_inicio: '2026-06-01',
        data_fim: '2026-12-31',
        meta_participantes: 100,
        status_id: statusCampanha[0].id
      }, null, 2));
    } else {
      console.error('[Data Verification] Falha Crítica: Estado de banco de dados inconsistente para novos projetos!');
      if (!possuiUsuarios) console.log('  - Inconsistência: Tabela "Usuario" precisa possuir ao menos um registro.');
      if (!possuiCategorias) console.log('  - Inconsistência: Tabela "Categoria" precisa estar populada.');
      if (!possuiCidades) console.log('  - Inconsistência: Tabela "Cidade" precisa possuir registros demográficos.');
      if (!possuiStatus) console.log('  - Inconsistência: Tabela "Status_campanha" precisa possuir os estados configurados.');
    }

  } catch (error) {
    console.error(`[Fatal Error] Ocorreu uma exceção na rotina de auditoria: ${error.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n[Data Verification] Conexão com o banco de dados encerrada com segurança.');
    }
  }
};

if (require.main === module) {
  main();
}

module.exports = { main };
