import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar atividades recentes de diferentes fontes
    const activities: any[] = []

    try {
      // 1. Empréstimos recentes
      const recentLoans = await prisma.loan.findMany({
        take: Math.floor(limit / 3),
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
        activities.push({
          id: `loan-${loan.id}`,
          type: 'loan',
          action: isReturned ? 'returned' : 'created',
          message: isReturned 
            ? `Livro "${loan.book.title}" devolvido por ${loan.student.name}`
            : `Novo empréstimo: "${loan.book.title}" para ${loan.student.name}`,
          timestamp: loan.updatedAt || loan.createdAt,
          icon: isReturned ? '📖' : '📚',
          color: isReturned ? 'blue' : 'green',
          data: {
            bookTitle: loan.book.title,
            bookCode: loan.book.code,
            studentName: loan.student.name,
            status: loan.status
          }
        })
      })
    } catch (error) {
      console.log('Erro ao buscar empréstimos:', error)
    }

    try {
      // 2. Livros recentemente cadastrados/atualizados
      const recentBooks = await prisma.book.findMany({
        take: Math.floor(limit / 3),
        orderBy: { updatedAt: 'desc' }
      })

      recentBooks.forEach((book: any) => {
        activities.push({
          id: `book-${book.id}`,
          type: 'book',
          action: 'updated',
          message: `Livro "${book.title}" foi atualizado`,
          timestamp: book.updatedAt,
          icon: '📝',
          color: 'purple',
          data: {
            bookTitle: book.title,
            bookCode: book.code
          }
        })
      })
    } catch (error) {
      console.log('Erro ao buscar livros:', error)
    }

    try {
      // 3. Alunos recentemente cadastrados
      const recentStudents = await prisma.student.findMany({
        take: Math.floor(limit / 3),
        orderBy: { createdAt: 'desc' }
      })

      recentStudents.forEach((student: any) => {
        activities.push({
          id: `student-${student.id}`,
          type: 'student',
          action: 'created',
          message: `Novo aluno cadastrado: ${student.name}`,
          timestamp: student.createdAt,
          icon: '👤',
          color: 'indigo',
          data: {
            studentName: student.name,
            studentClass: student.class
          }
        })
      })
    } catch (error) {
      console.log('Erro ao buscar alunos:', error)
    }

    // Ordenar todas as atividades por timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Retornar apenas o limite solicitado
    return NextResponse.json({
      activities: activities.slice(0, limit),
      total: activities.length
    })
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json({
      activities: [],
      total: 0
    })
  }
} 