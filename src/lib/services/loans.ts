import { prisma } from '../prisma'
import { Loan, LoanStatus } from '@prisma/client'
import { BookService } from './books'

export interface CreateLoanData {
  bookId: string
  studentId: string
  dueDate: Date
  notes?: string
}



export class LoanService {
  // Buscar todos os empréstimos
  static async getAllLoans() {
    return await prisma.loan.findMany({
      include: {
        book: true,
        student: true
      },
      orderBy: { borrowedAt: 'desc' }
    })
  }

  // Buscar empréstimo por ID
  static async getLoanById(id: string) {
    return await prisma.loan.findUnique({
      where: { id },
      include: {
        book: true,
        student: true
      }
    })
  }

  // Buscar empréstimos por filtros
  static async getLoansByFilters(filters: {
    search?: string
    status?: LoanStatus
    period?: string
  }) {
    const { search, status, period } = filters
    
    let dateFilter = {}
    if (period === 'mes') {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      dateFilter = { borrowedAt: { gte: oneMonthAgo } }
    } else if (period === 'trimestre') {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      dateFilter = { borrowedAt: { gte: threeMonthsAgo } }
    } else if (period === 'ano') {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      dateFilter = { borrowedAt: { gte: oneYearAgo } }
    }
    
    return await prisma.loan.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { book: { title: { contains: search } } },
              { book: { code: { contains: search } } },
              { student: { name: { contains: search } } }
            ]
          } : {},
          status ? { status } : {},
          dateFilter
        ]
      },
      include: {
        book: true,
        student: true
      },
      orderBy: { borrowedAt: 'desc' }
    })
  }

  // Criar novo empréstimo
  static async createLoan(data: CreateLoanData) {
    // Verificar se o livro existe e tem exemplares disponíveis
    const book = await prisma.book.findUnique({
      where: { id: data.bookId }
    })

    if (!book) {
      throw new Error('Livro não encontrado')
    }

    if (book.currentQuantity <= 0) {
      throw new Error('Não há exemplares disponíveis deste livro')
    }

    // Verificar se o aluno já tem um empréstimo ativo deste livro
    const existingLoan = await prisma.loan.findFirst({
      where: {
        bookId: data.bookId,
        studentId: data.studentId,
        status: 'ACTIVE'
      }
    })

    if (existingLoan) {
      throw new Error('O aluno já possui um empréstimo ativo deste livro')
    }

    // Criar o empréstimo
    const loan = await prisma.loan.create({
      data,
      include: {
        book: true,
        student: true
      }
    })

    // Atualizar quantidade disponível e contador de empréstimos do livro
    await BookService.incrementLoansCount(data.bookId)

    return loan
  }



  // Devolver empréstimo
  static async returnLoan(id: string) {
    const loan = await prisma.loan.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnedAt: new Date()
      },
      include: {
        book: true,
        student: true
      }
    })

    // Atualizar quantidade disponível do livro
    await BookService.decrementLoansCount(loan.bookId)

    return loan
  }

  // Deletar empréstimo
  static async deleteLoan(id: string) {
    const loan = await prisma.loan.findUnique({
      where: { id },
      select: { bookId: true, status: true }
    })

    if (loan && loan.status === 'ACTIVE') {
      // Se o empréstimo está ativo, devolver o livro ao acervo
      await BookService.decrementLoansCount(loan.bookId)
    }

    return await prisma.loan.delete({
      where: { id }
    })
  }

  // Buscar estatísticas de empréstimos
  static async getLoanStats() {
    const totalLoans = await prisma.loan.count()
    const activeLoans = await prisma.loan.count({
      where: { status: 'ACTIVE' }
    })
    const returnedLoans = await prisma.loan.count({
      where: { status: 'RETURNED' }
    })
    const overdueLoans = await prisma.loan.count({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() }
      }
    })

    return {
      totalLoans,
      activeLoans,
      returnedLoans,
      overdueLoans
    }
  }

  // Buscar empréstimos em atraso
  static async getOverdueLoans() {
    return await prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() }
      },
      include: {
        book: true,
        student: true
      },
      orderBy: { dueDate: 'asc' }
    })
  }

  // Buscar empréstimos por período
  static async getLoansByPeriod(period: string) {
    let startDate = new Date()
    
    switch (period) {
      case 'mes':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'trimestre':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case 'ano':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate = new Date(0) // Desde o início
    }

    return await prisma.loan.findMany({
      where: {
        borrowedAt: { gte: startDate }
      },
      include: {
        book: true,
        student: true
      },
      orderBy: { borrowedAt: 'desc' }
    })
  }

  // Buscar livros disponíveis para empréstimo
  static async getAvailableBooks() {
    return await prisma.book.findMany({
      where: {
        currentQuantity: { gt: 0 },
        deletedAt: null
      },
      orderBy: { title: 'asc' }
    })
  }

  // Verificar se aluno pode emprestar um livro específico
  static async canStudentBorrowBook(studentId: string, bookId: string) {
    const existingLoan = await prisma.loan.findFirst({
      where: {
        bookId,
        studentId,
        status: 'ACTIVE'
      }
    })

    return !existingLoan
  }
} 