/**
 * Script para popular dados básicos no banco de dados
 * Executa: node populate-db.js
 */

require('dotenv').config();
const { Usuario, Pais, Estado, Cidade, TipoUsuario } = require('./src/models');

async function populateDatabase() {
  try {
    console.log('🌱 Populando banco de dados com dados básicos...\n');

    // 1. Verificar e criar Tipos de Usuário
    console.log('➕ Criando tipos de usuário...');
    const tipos = await TipoUsuario.findAll();
    if (tipos.length === 0) {
      await TipoUsuario.create({ nome: 'Admin' });
      await TipoUsuario.create({ nome: 'Cliente' });
      await TipoUsuario.create({ nome: 'Funcionário' });
      console.log('   ✅ 3 tipos criados (Admin, Cliente, Funcionário)');
    } else {
      console.log(`   ✓ Tipos já existem (${tipos.length} registros)`);
    }

    // 2. Verificar e criar Pais
    console.log('➕ Criando país...');
    let brasil = await Pais.findOne({ where: { nome: 'Brasil' } });
    if (!brasil) {
      brasil = await Pais.create({ nome: 'Brasil' });
      console.log('   ✅ Brasil criado');
    } else {
      console.log('   ✓ Brasil já existe');
    }

    // 3. Verificar e criar Estado
    console.log('➕ Criando estado...');
    let saopaulo = await Estado.findOne({ where: { nome: 'São Paulo' } });
    if (!saopaulo) {
      saopaulo = await Estado.create({
        nome: 'São Paulo',
        sigla: 'SP',
        pais_id: brasil.id
      });
      console.log('   ✅ São Paulo criado');
    } else {
      console.log('   ✓ São Paulo já existe');
    }

    // 4. Verificar e criar Cidade
    console.log('➕ Criando cidade...');
    let cidade = await Cidade.findOne({ where: { nome: 'São Paulo' } });
    if (!cidade) {
      cidade = await Cidade.create({
        nome: 'São Paulo',
        estado_id: saopaulo.id
      });
      console.log('   ✅ São Paulo (cidade) criada');
    } else {
      console.log('   ✓ São Paulo (cidade) já existe');
    }

    console.log('\n✅ Banco de dados populado com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - Tipos de usuário: ${(await TipoUsuario.count())} registros`);
    console.log(`   - Países: ${(await Pais.count())} registros`);
    console.log(`   - Estados: ${(await Estado.count())} registros`);
    console.log(`   - Cidades: ${(await Cidade.count())} registros`);
    console.log(`   - Usuários: ${(await Usuario.count())} registros\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error.message);
    process.exit(1);
  }
}

populateDatabase();
