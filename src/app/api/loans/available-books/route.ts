import { NextRequest, NextResponse } from 'next/server'
import { LoanService } from '@/lib/services/loans'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    let books = await LoanService.getAvailableBooks()

    // Se um studentId foi fornecido, filtrar livros que o aluno já não tem emprestado
    if (studentId) {
      const availableBooks = []
      for (const book of books) {
        const canBorrow = await LoanService.canStudentBorrowBook(studentId, book.id)
        if (canBorrow) {
          availableBooks.push(book)
        }
      }
      books = availableBooks
    }

    return NextResponse.json(books)
  } catch (error) {
    console.error('Erro ao buscar livros disponíveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 