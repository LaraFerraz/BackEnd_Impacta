const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      database: 'impacta'
    });

    console.log('=== VERIFICAÇÃO DE DADOS ===\n');

    // Verificar usuários
    const [usuarios] = await conn.execute('SELECT id, nome, email FROM Usuario');
    console.log(`✓ Usuários: ${usuarios.length}`);
    if (usuarios.length > 0) {
      console.log('  Exemplo:', usuarios[0]);
    } else {
      console.log('  ❌ NENHUM USUÁRIO ENCONTRADO!');
    }

    // Verificar categorias
    const [categorias] = await conn.execute('SELECT id, nome FROM Categoria');
    console.log(`\n✓ Categorias: ${categorias.length}`);
    if (categorias.length > 0) {
      console.log('  Exemplo:', categorias[0]);
    }

    // Verificar cidades
    const [cidades] = await conn.execute('SELECT id, nome FROM Cidade LIMIT 1');
    console.log(`\n✓ Cidades: verificando...`);
    const [totalCidades] = await conn.execute('SELECT COUNT(*) as total FROM Cidade');
    console.log(`  Total de cidades: ${totalCidades[0].total}`);
    if (cidades.length > 0) {
      console.log('  Exemplo:', cidades[0]);
    }

    // Verificar status campanha
    const [status] = await conn.execute('SELECT id, nome FROM Status_campanha');
    console.log(`\n✓ Status Campanha: ${status.length}`);
    console.log('  Detalhes:', status);

    // Verificar projetos existentes
    const [projetos] = await conn.execute('SELECT COUNT(*) as total FROM Projeto');
    console.log(`\n✓ Projetos criados: ${projetos[0].total}`);

    console.log('\n=== RESUMO ===');
    const canCreate = usuarios.length > 0 && categorias.length > 0 && 
                      totalCidades[0].total > 0 && status.length > 0;
    
    if (canCreate) {
      console.log('✅ Todos os dados necessários existem!');
      console.log('\nDados para testar POST /projetos:');
      console.log({
        titulo: 'Campanha de Teste',
        descricao: 'Uma campanha de teste',
        categoria_id: categorias[0].id,
        criador_id: usuarios[0].id,
        cidade_id: cidades[0]?.id || 1,
        data_inicio: '2026-06-01',
        data_fim: '2026-12-31',
        meta_participantes: 100,
        status_id: 1
      });
    } else {
      console.log('❌ Faltam dados necessários!');
      if (usuarios.length === 0) console.log('  - Nenhum usuário encontrado');
      if (categorias.length === 0) console.log('  - Nenhuma categoria encontrada');
      if (totalCidades[0].total === 0) console.log('  - Nenhuma cidade encontrada');
    }

    conn.end();
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  }
})();
