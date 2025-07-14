import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')
    const status = searchParams.get('status')

    // Buscar livros com filtros
    let whereClause: any = {}
    
    if (genre && genre !== 'todos') {
      whereClause.genre = genre
    }
    
    if (status === 'disponivel') {
      whereClause.currentQuantity = { gt: 0 }
    } else if (status === 'emprestado') {
      whereClause.currentQuantity = 0
    }

    const books = await prisma.book.findMany({
      where: whereClause,
      orderBy: { title: 'asc' }
    })

    // Estatísticas por gênero
    const booksByGenre = await prisma.book.groupBy({
      by: ['genre'],
      _count: { genre: true },
      _sum: { currentQuantity: true }
    })

    // Livros mais emprestados
    const topLoanedBooks = await prisma.book.findMany({
      orderBy: { loansCount: 'desc' },
      take: 10,
      select: {
        id: true,
        code: true,
        title: true,
        author: true,
        genre: true,
        loansCount: true,
        currentQuantity: true,
        quantity: true
      }
    })

    // Estatísticas gerais
    const totalBooks = await prisma.book.count()
    const availableBooks = await prisma.book.aggregate({
      _sum: { currentQuantity: true }
    })
    const totalQuantity = await prisma.book.aggregate({
      _sum: { quantity: true }
    })

    // Livros por localização
    const booksByLocation = await prisma.book.groupBy({
      by: ['location'],
      _count: { location: true },
      where: {
        location: { not: null }
      }
    })

    const reportData = {
      totalBooks,
      availableBooks: availableBooks._sum.currentQuantity || 0,
      totalQuantity: totalQuantity._sum.quantity || 0,
      borrowedBooks: (totalQuantity._sum.quantity || 0) - (availableBooks._sum.currentQuantity || 0),
      booksByGenre: booksByGenre.map(genre => ({
        genre: genre.genre,
        count: genre._count.genre,
        available: genre._sum.currentQuantity || 0
      })),
      topLoanedBooks,
      booksByLocation: booksByLocation.map(location => ({
        location: location.location,
        count: location._count.location
      })),
      allBooks: books
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Erro ao gerar relatório de livros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 