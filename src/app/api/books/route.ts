import { NextRequest, NextResponse } from 'next/server'
import { BookService } from '@/lib/services/books'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const genre = searchParams.get('genre') || undefined

    const books = await BookService.getBooksByFilters({
      search,
      status,
      genre
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Erro ao buscar livros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || undefined
    const book = await BookService.createBook(body, userId)
    return NextResponse.json(book, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar livro:', error)
    
    // Se é um erro conhecido com mensagem específica
    if (error.message && error.message !== 'Erro interno do servidor') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 