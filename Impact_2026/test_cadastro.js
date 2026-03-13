const userData = {
  nome: "Teste Usuario",
  email: "teste@teste.com",
  password: "123456",
  telefone: "11999999999",
  cidade: "São Paulo",
  interesses: ["Limpeza Comunitária", "Educação"]
};

async function testRegister() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Cadastro realizado com sucesso!');
      console.log('Token:', data.token);
      console.log('Usuario:', data.user);
      console.log('Redirecionamento para home deve funcionar agora');
    } else {
      console.log('❌ Erro no cadastro:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testRegister();