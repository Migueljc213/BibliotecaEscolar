import { NextRequest, NextResponse } from 'next/server'
import { LoanService } from '@/lib/services/loans'
import { BookService } from '@/lib/services/books'
import { StudentService } from '@/lib/services/students'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'mes'

    // Buscar empréstimos por período
    const loans = await LoanService.getLoansByPeriod(period)
    
    // Calcular estatísticas
    const totalLoans = loans.length
    const activeLoans = loans.filter(loan => loan.status === 'ACTIVE').length
    const returnedLoans = loans.filter(loan => loan.status === 'RETURNED').length
    const overdueLoans = loans.filter(loan => 
      loan.status === 'ACTIVE' && new Date(loan.dueDate) < new Date()
    ).length

    // Agrupar por mês
    const monthlyLoans = loans.reduce((acc: any, loan) => {
      const month = new Date(loan.borrowedAt).toLocaleDateString('pt-BR', { month: 'short' })
      if (!acc[month]) {
        acc[month] = { loans: 0, returns: 0 }
      }
      acc[month].loans++
      if (loan.status === 'RETURNED') {
        acc[month].returns++
      }
      return acc
    }, {})

    // Agrupar por semana (últimas 4 semanas)
    const loanTrends = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekLoans = loans.filter(loan => {
        const loanDate = new Date(loan.borrowedAt)
        return loanDate >= weekStart && loanDate <= weekEnd
      })
      
      const weekReturns = weekLoans.filter(loan => loan.status === 'RETURNED').length
      
      loanTrends.push({
        period: `Semana ${4 - i}`,
        loans: weekLoans.length,
        returns: weekReturns
      })
    }

    // Livros mais emprestados
    const bookStats = loans.reduce((acc: any, loan) => {
      const bookTitle = loan.book.title
      const bookCode = loan.book.code
      if (!acc[bookTitle]) {
        acc[bookTitle] = { 
          title: bookTitle,
          code: bookCode,
          author: loan.book.author,
          loans: 0, 
          returns: 0 
        }
      }
      acc[bookTitle].loans++
      if (loan.status === 'RETURNED') {
        acc[bookTitle].returns++
      }
      return acc
    }, {})

    const topLoanedBooks = Object.values(bookStats)
      .sort((a: any, b: any) => b.loans - a.loans)
      .slice(0, 5)

    // Maiores usuários
    const borrowerStats = loans.reduce((acc: any, loan) => {
      const borrowerName = loan.student.name
      if (!acc[borrowerName]) {
        acc[borrowerName] = { 
          name: borrowerName,
          registration: loan.student.registration,
          grade: loan.student.grade,
          class: loan.student.class,
          loans: 0, 
          returns: 0 
        }
      }
      acc[borrowerName].loans++
      if (loan.status === 'RETURNED') {
        acc[borrowerName].returns++
      }
      return acc
    }, {})

    const topBorrowers = Object.values(borrowerStats)
      .sort((a: any, b: any) => b.loans - a.loans)
      .slice(0, 5)

    // Converter monthlyLoans para array
    const monthlyLoansArray = Object.entries(monthlyLoans)
      .map(([month, stats]: [string, any]) => ({
        month,
        loans: stats.loans,
        returns: stats.returns
      }))
      .sort((a, b) => {
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
        return months.indexOf(a.month.toLowerCase()) - months.indexOf(b.month.toLowerCase())
      })

    const reportData = {
      totalLoans,
      activeLoans,
      returnedLoans,
      overdueLoans,
      monthlyLoans: monthlyLoansArray,
      topLoanedBooks,
      topBorrowers,
      loanTrends
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Erro ao gerar relatório de empréstimos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 