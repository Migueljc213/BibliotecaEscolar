const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🚀 Criando usuário de teste...')
    
    // Verificar se o usuário já existe
    const userExists = await prisma.user.findUnique({
      where: { email: 'teste@escola.com' }
    })

    if (userExists) {
      console.log('ℹ️ Usuário de teste já existe')
      console.log('📧 Email: teste@escola.com')
      console.log('🔑 Senha: teste123')
      return
    }

    // Criar senha hash
    const hashedPassword = await bcrypt.hash('teste123', 10)
    
    // Criar usuário de teste
    await prisma.user.create({
      data: {
        email: 'teste@escola.com',
        name: 'Usuário Teste - Escola',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Usuário de teste criado com sucesso!')
    console.log('📧 Email: teste@escola.com')
    console.log('🔑 Senha: teste123')
    console.log('👤 Nome: Usuário Teste - Escola')
    console.log('🔐 Tipo: Administrador')
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser() 