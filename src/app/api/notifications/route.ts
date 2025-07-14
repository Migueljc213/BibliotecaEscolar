import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')


    const notifications: any[] = []


    try {
      const recentLoans = await prisma.loan.findMany({
        take: Math.floor(limit / 2),
        include: {
          book: {
            select: {
              title: true,
              code: true
            }
          },
          student: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      recentLoans.forEach((loan: any) => {
        const isReturned = loan.status === 'RETURNED'
        notifications.push({
          id: `loan-${loan.id}`,
          message: isReturned 
            ? `Livro "${loan.book?.title || 'Livro'}" devolvido por ${loan.student?.name || 'Aluno'}`
            : `Novo empréstimo: "${loan.book?.title || 'Livro'}" para ${loan.student?.name || 'Aluno'}`,
          type: isReturned ? 'info' : 'success',
          icon: isReturned ? '📖' : '📚',
          timestamp: loan.updatedAt || loan.createdAt,
          action: isReturned ? 'RETURNED' : 'CREATED',
          bookCode: loan.book?.code,
          bookTitle: loan.book?.title
        })
      })
    } catch (error) {
      console.log('Erro ao buscar empréstimos para notificações:', error)
    }

    // Buscar livros recentes
    try {
      const recentBooks = await prisma.book.findMany({
        take: Math.floor(limit / 2),
        orderBy: { updatedAt: 'desc' }
      })
      
      recentBooks.forEach((book: any) => {
        notifications.push({
          id: `book-${book.id}`,
          message: `Livro "${book.title}" foi atualizado`,
          type: 'info',
          icon: '📝',
          timestamp: book.updatedAt,
          action: 'UPDATED',
          bookCode: book.code,
          bookTitle: book.title
        })
      })
    } catch (error) {
      console.log('Erro ao buscar livros para notificações:', error)
    }

    // Ordenar por timestamp e limitar
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const limitedNotifications = notifications.slice(0, limit)

    return NextResponse.json({
      notifications: limitedNotifications,
      total: limitedNotifications.length,
      unread: limitedNotifications.length
    })
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json({
      notifications: [],
      total: 0,
      unread: 0
    })
  }
} 