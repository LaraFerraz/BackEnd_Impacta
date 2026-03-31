const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    const sqlFile = path.join(__dirname, 'scripts/reset-db.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executando script SQL para resetar banco de dados...');
    await connection.query(sql);
    console.log('✅ Banco de dados resetado com sucesso!');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error.message);
    process.exit(1);
  }
}

resetDatabase();
