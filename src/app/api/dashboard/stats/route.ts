import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Verificar se o banco está disponível
    await prisma.$connect()
    
    const [
      totalBooks,
      availableBooks,
      totalStudents,
      activeLoans,
      overdueLoans
    ] = await Promise.all([
      prisma.book.count(),
      prisma.book.aggregate({
        _sum: {
          currentQuantity: true
        }
      }),
      prisma.student.count(),
      prisma.loan.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.loan.count({
        where: {
          status: 'ACTIVE',
          dueDate: {
            lt: new Date()
          }
        }
      })
    ])

    const borrowedBooks = totalBooks - (availableBooks._sum.currentQuantity || 0)

    return NextResponse.json({
      totalBooks,
      availableBooks: availableBooks._sum.currentQuantity || 0,
      borrowedBooks,
      overdueBooks: overdueLoans,
      totalStudents,
      activeLoans
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    

    return NextResponse.json({
      totalBooks: 0,
      availableBooks: 0,
      borrowedBooks: 0,
      overdueBooks: 0,
      totalStudents: 0,
      activeLoans: 0
    })
  }
} 