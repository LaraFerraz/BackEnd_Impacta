#!/usr/bin/env node

require('dotenv').config();

// Ajustado para o caminho centralizado real do Sequelize no projeto
const { Usuario, Pais, Estado, Cidade, TipoUsuario, sequelize } = require('./src/middleware/models');

const populateDatabase = async () => {
  try {
    console.log('[Database Seeder] === INICIANDO POPULAÇÃO DE DADOS BÁSICOS (PRE-FLIGHT) ===\n');

    // 1. Verificar e Criar Tipos de Usuário (Utilizando Inserção em Lote Otimizada)
    console.log('[Database Seeder] Semeando tabela de privilégios "TipoUsuario"...');
    const tiposExistentes = await TipoUsuario.findAll();
    
    if (tiposExistentes.length === 0) {
      await TipoUsuario.bulkCreate([
        { nome: 'Admin' },
        { nome: 'Cliente' },
        { nome: 'Funcionário' }
      ]);
      console.log('  Sucesso: 3 tipos estruturais criados (Admin, Cliente, Funcionário).');
    } else {
      console.log(`  Mapeamento ignorado: Registros já existentes (${tiposExistentes.length} tipos indexados).`);
    }

    // 2. Verificar e Criar Estrutura de Geofencing: País
    console.log('[Database Seeder] Semeando tabela geográfica "Pais"...');
    let paisBrasil = await Pais.findOne({ where: { nome: 'Brasil' } });
    
    if (!paisBrasil) {
      paisBrasil = await Pais.create({ nome: 'Brasil' });
      console.log('  Sucesso: Registro "Brasil" inserido no catálogo.');
    } else {
      console.log('  Mapeamento ignorado: Registro "Brasil" já indexado.');
    }

    // 3. Verificar e Criar Estrutura de Geofencing: Estado
    console.log('[Database Seeder] Semeando tabela geográfica "Estado"...');
    let estadoSaoPaulo = await Estado.findOne({ where: { nome: 'São Paulo' } });
    
    if (!estadoSaoPaulo) {
      estadoSaoPaulo = await Estado.create({
        nome: 'São Paulo',
        sigla: 'SP',
        pais_id: paisBrasil.id
      });
      console.log('  Sucesso: Unidade Federativa "São Paulo (SP)" vinculada com sucesso.');
    } else {
      console.log('  Mapeamento ignorado: Unidade Federativa "São Paulo" já indexada.');
    }

    // 4. Verificar e Criar Estrutura de Geofencing: Cidade
    console.log('[Database Seeder] Semeando tabela geográfica "Cidade"...');
    let cidadeSaoPaulo = await Cidade.findOne({ where: { nome: 'São Paulo' } });
    
    if (!cidadeSaoPaulo) {
      await Cidade.create({
        nome: 'São Paulo',
        estado_id: estadoSaoPaulo.id
      });
      console.log('  Sucesso: Município de "São Paulo" inserido e associado ao estado.');
    } else {
      console.log('  Mapeamento ignorado: Município de "São Paulo" já indexado.');
    }

    // =========================================================================
    // Emissão de Relatório Estatístico de Carga (Auditoria)
    // =========================================================================
    console.log('\n[Database Seeder] === SEEDING CONCLUÍDO COM SUCESSO ===');
    console.log('\n[Database Seeder] Resumo volumétrico consolidado da base:');
    
    const [qtdTipos, qtdPaises, qtdEstados, qtdCidades, qtdUsuarios] = await Promise.all([
      TipoUsuario.count(),
      Pais.count(),
      Estado.count(),
      Cidade.count(),
      Usuario.count()
    ]);

    console.log(`  - Tipos de usuário ativos: ${qtdTipos} registros.`);
    console.log(`  - Países catalogados:      ${qtdPaises} registros.`);
    console.log(`  - Estados mapeados:        ${qtdEstados} registros.`);
    console.log(`  - Cidades indexadas:       ${qtdCidades} registros.`);
    console.log(`  - Usuários cadastrados:    ${qtdUsuarios} registros.\n`);

    process.exit(0);
  } catch (error) {
    console.error(`[Fatal Error] Ocorreu uma exceção crítica ao semear dados: ${error.message}`);
    process.exit(1);
  } finally {
    // Garante que o pool de conexões do Sequelize seja liberado se ainda estiver aberto
    if (sequelize) {
      await sequelize.close();
      console.log('[Database Seeder] Pool de conexões do Sequelize encerrado com segurança.');
    }
  }
};

// Dispara o executor apenas se invocado diretamente via linha de comando (CLI)
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase };

