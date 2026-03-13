// Teste para verificar se o frontend consegue se comunicar com o backend
const testFrontendBackend = async () => {
  console.log('🧪 Testando comunicação Frontend -> Backend...\n');

  const userData = {
    nome: "Teste Frontend",
    email: "frontend@teste.com", 
    password: "123456",
    telefone: "11888888888",
    cidade: "São Paulo",
    interesses: ["Meio Ambiente"],
    termos: true
  };

  try {
    // Simular chamada do frontend
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: userData.nome,
        email: userData.email,
        password: userData.password,
        telefone: userData.telefone,
        cidade: userData.cidade,
        interesses: userData.interesses
      })
    });

    const textResponse = await response.text();
    console.log('📥 Resposta raw:', textResponse);

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      console.error('❌ Resposta não é JSON válido');
      return;
    }
    
    if (response.ok) {
      console.log('✅ Cadastro via frontend simulado funcionou!');
      console.log('📝 Dados recebidos:', {
        token: data.token ? 'Token recebido ✓' : 'Sem token ✗',
        user: data.user ? 'User recebido ✓' : 'Sem user ✗',
        userName: data.user?.nome || 'N/A'
      });
      console.log('\n🎯 O redirecionamento para home deve funcionar!');
    } else {
      console.log('❌ Erro no cadastro:', data.message);
      console.log('📋 Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
};

testFrontendBackend();