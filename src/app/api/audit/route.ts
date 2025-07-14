import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '100')
    const bookId = searchParams.get('bookId')

    let whereClause: any = {}
    
    if (action) {
      whereClause.action = action
    }
    
    if (bookId) {
      whereClause.bookId = bookId
    }

    const auditLogs = await (prisma as any).bookAuditLog.findMany({
      where: whereClause,
      include: {
        book: {
          select: {
            code: true,
            title: true,
            author: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      distinct: ['id'] // Garantir que não há duplicatas
    })

    // Remover duplicatas por ID para garantir unicidade
    const uniqueLogs = auditLogs.filter((log: any, index: number, self: any[]) => 
      index === self.findIndex((l: any) => l.id === log.id)
    )

    return NextResponse.json(uniqueLogs)
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 