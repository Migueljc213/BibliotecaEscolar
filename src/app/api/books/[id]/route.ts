import { NextRequest, NextResponse } from 'next/server'
import { BookService } from '@/lib/services/books'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await BookService.getBookById(params.id)
    
    if (!book) {
      return NextResponse.json(
        { error: 'Livro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Erro ao buscar livro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const book = await BookService.updateBook(params.id, body, undefined)
    return NextResponse.json(book)
  } catch (error) {
    console.error('Erro ao atualizar livro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Tentando deletar livro com ID:', params.id)
    
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID do livro é obrigatório' },
        { status: 400 }
      )
    }

    await BookService.softDeleteBook(params.id, undefined)
    return NextResponse.json({ message: 'Livro deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar livro:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Livro não encontrado') {
        return NextResponse.json(
          { error: 'Livro não encontrado' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 