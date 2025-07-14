import { NextRequest, NextResponse } from 'next/server'
import { BookService } from '@/lib/services/books'
import { StudentService } from '@/lib/services/students'
import { LoanService } from '@/lib/services/loans'

export async function GET(request: NextRequest) {
  try {
    const [bookStats, studentStats, loanStats] = await Promise.all([
      BookService.getBookStats(),
      StudentService.getStudentStats(),
      LoanService.getLoanStats()
    ])

    const stats = {
      books: bookStats,
      students: studentStats,
      loans: loanStats,
      totalBooks: bookStats.totalBooks,
      availableBooks: bookStats.availableBooks,
      borrowedBooks: bookStats.borrowedBooks,
      totalStudents: studentStats.totalStudents,
      activeLoans: loanStats.activeLoans,
      overdueLoans: loanStats.overdueLoans
    }
    console.log(bookStats, studentStats, loanStats);
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 