const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados...')
    
    // Criar usuário admin padrão
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@biblioteca.com' }
    })

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await prisma.user.create({
        data: {
          email: 'admin@biblioteca.com',
          name: 'Administrador',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
      
      console.log('✅ Usuário admin criado com sucesso!')
      console.log('📧 Email: admin@biblioteca.com')
      console.log('🔑 Senha: admin123')
    } else {
      console.log('ℹ️ Usuário admin já existe')
    }

    // Criar alguns livros de exemplo
    const booksCount = await prisma.book.count()
    if (booksCount === 0) {
      const sampleBooks = [
        {
          code: '0001/25-ROM',
          title: 'Dom Casmurro',
          author: 'Machado de Assis',
          publisher: 'Nova Aguilar',
          genre: 'Romance',
          entryDate: new Date('2025-01-15'),
          quantity: 3,
          currentQuantity: 3,
          loansCount: 0,
          isbn: '9788535902778',
          year: 1899,
          location: 'Prateleira A1',
          description: 'Romance clássico da literatura brasileira'
        },
        {
          code: '0002/25-INF',
          title: 'O Pequeno Príncipe',
          author: 'Antoine de Saint-Exupéry',
          publisher: 'Geração Editorial',
          genre: 'Infantil',
          entryDate: new Date('2025-01-20'),
          quantity: 2,
          currentQuantity: 2,
          loansCount: 0,
          isbn: '9788546501234',
          year: 1943,
          location: 'Prateleira B2',
          description: 'Clássico da literatura mundial'
        },
        {
          code: '0003/25-FAN',
          title: 'Harry Potter e a Pedra Filosofal',
          author: 'J.K. Rowling',
          publisher: 'Rocco',
          genre: 'Fantasia',
          entryDate: new Date('2025-02-01'),
          quantity: 4,
          currentQuantity: 4,
          loansCount: 0,
          isbn: '9788533613379',
          year: 1997,
          location: 'Prateleira C3',
          description: 'Primeiro livro da série Harry Potter'
        }
      ]

      for (const book of sampleBooks) {
        await prisma.book.create({ data: book })
      }
      
      console.log('✅ Livros de exemplo criados com sucesso!')
    } else {
      console.log('ℹ️ Livros já existem no banco')
    }

    // Criar alguns alunos de exemplo
    const studentsCount = await prisma.student.count()
    if (studentsCount === 0) {
      const sampleStudents = [
        {
          name: 'João Silva',
          email: 'joao.silva@escola.com',
          registration: '2024001',
          grade: '9º Ano',
          class: 'A',
          phone: '(11) 99999-1111',
          address: 'Rua das Flores, 123'
        },
        {
          name: 'Maria Santos',
          email: 'maria.santos@escola.com',
          registration: '2024002',
          grade: '8º Ano',
          class: 'B',
          phone: '(11) 99999-2222',
          address: 'Av. Principal, 456'
        },
        {
          name: 'Pedro Oliveira',
          email: 'pedro.oliveira@escola.com',
          registration: '2024003',
          grade: '7º Ano',
          class: 'C',
          phone: '(11) 99999-3333',
          address: 'Rua do Comércio, 789'
        }
      ]

      for (const student of sampleStudents) {
        await prisma.student.create({ data: student })
      }
      
      console.log('✅ Alunos de exemplo criados com sucesso!')
    } else {
      console.log('ℹ️ Alunos já existem no banco')
    }

    console.log('🎉 Banco de dados inicializado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase() 