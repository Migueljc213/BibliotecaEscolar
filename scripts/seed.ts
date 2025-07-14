import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar livros
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        isbn: '978-85-7232-000-0',
        category: 'Literatura Brasileira',
        publisher: 'Editora Nova Aguilar',
        year: 1899,
        quantity: 3,
        available: 3,
        location: 'Prateleira A1',
        description: 'Romance clássico da literatura brasileira'
      }
    }),
    prisma.book.create({
      data: {
        title: 'O Cortiço',
        author: 'Aluísio Azevedo',
        isbn: '978-85-7232-001-0',
        category: 'Literatura Brasileira',
        publisher: 'Editora Ática',
        year: 1890,
        quantity: 2,
        available: 2,
        location: 'Prateleira A2',
        description: 'Romance naturalista brasileiro'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Grande Sertão: Veredas',
        author: 'João Guimarães Rosa',
        isbn: '978-85-7232-002-0',
        category: 'Literatura Brasileira',
        publisher: 'Editora Nova Fronteira',
        year: 1956,
        quantity: 2,
        available: 2,
        location: 'Prateleira A3',
        description: 'Obra-prima da literatura brasileira'
      }
    }),
    prisma.book.create({
      data: {
        title: 'O Pequeno Príncipe',
        author: 'Antoine de Saint-Exupéry',
        isbn: '978-85-7232-003-0',
        category: 'Literatura Infantil',
        publisher: 'Editora Geração',
        year: 1943,
        quantity: 4,
        available: 4,
        location: 'Prateleira B1',
        description: 'Clássico da literatura infantil mundial'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Harry Potter e a Pedra Filosofal',
        author: 'J.K. Rowling',
        isbn: '978-85-7232-004-0',
        category: 'Fantasia',
        publisher: 'Editora Rocco',
        year: 1997,
        quantity: 3,
        available: 3,
        location: 'Prateleira C1',
        description: 'Primeiro livro da série Harry Potter'
      }
    })
  ])

  console.log(`✅ ${books.length} livros criados`)

  // Criar alunos
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        matricula: '2024001',
        grade: '6º Ano',
        class: '6A',
        phone: '(11) 99999-1111',
        address: 'Rua das Flores, 123'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        matricula: '2024002',
        grade: '7º Ano',
        class: '7B',
        phone: '(11) 99999-2222',
        address: 'Av. Principal, 456'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        matricula: '2024003',
        grade: '8º Ano',
        class: '8A',
        phone: '(11) 99999-3333',
        address: 'Rua do Comércio, 789'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        matricula: '2024004',
        grade: '9º Ano',
        class: '9B',
        phone: '(11) 99999-4444',
        address: 'Rua das Palmeiras, 321'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Lucas Ferreira',
        email: 'lucas.ferreira@email.com',
        matricula: '2024005',
        grade: '6º Ano',
        class: '6B',
        phone: '(11) 99999-5555',
        address: 'Av. das Árvores, 654'
      }
    })
  ])

  console.log(`✅ ${students.length} alunos criados`)

  // Criar alguns empréstimos
  const loans = await Promise.all([
    prisma.loan.create({
      data: {
        bookId: books[0].id,
        studentId: students[0].id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        notes: 'Primeiro empréstimo do aluno'
      }
    }),
    prisma.loan.create({
      data: {
        bookId: books[1].id,
        studentId: students[1].id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        notes: 'Empréstimo para trabalho escolar'
      }
    }),
    prisma.loan.create({
      data: {
        bookId: books[2].id,
        studentId: students[2].id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrasado
        notes: 'Empréstimo em atraso'
      }
    })
  ])

  console.log(`✅ ${loans.length} empréstimos criados`)

  // Atualizar quantidade disponível dos livros emprestados
  await Promise.all([
    prisma.book.update({
      where: { id: books[0].id },
      data: { available: 2 }
    }),
    prisma.book.update({
      where: { id: books[1].id },
      data: { available: 1 }
    }),
    prisma.book.update({
      where: { id: books[2].id },
      data: { available: 1 }
    })
  ])

  console.log('✅ Quantidade de livros atualizada')

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 