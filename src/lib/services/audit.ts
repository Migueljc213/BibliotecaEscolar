import { prisma } from '../prisma'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'

export interface CreateAuditLogData {
  bookId: string
  action: AuditAction
  fieldName?: string
  oldValue?: string
  newValue?: string
  description: string
  userId?: string
}

export class AuditService {
  // Criar log de auditoria
  static async createAuditLog(data: CreateAuditLogData) {
    // Verificar se já existe um log similar recente (últimos 5 segundos) para evitar duplicatas
    const recentLog = await (prisma as any).bookAuditLog.findFirst({
      where: {
        bookId: data.bookId,
        action: data.action,
        description: data.description,
        createdAt: {
          gte: new Date(Date.now() - 5000) // Últimos 5 segundos
        }
      }
    })

    if (recentLog) {
      console.log('Log similar já existe, evitando duplicata:', data.description)
      return recentLog
    }

    return await (prisma as any).bookAuditLog.create({
      data,
      include: {
        book: {
          select: {
            code: true,
            title: true
          }
        }
      }
    })
  }

  // Buscar logs de auditoria por livro
  static async getAuditLogsByBook(bookId: string) {
    return await (prisma as any).bookAuditLog.findMany({
      where: { bookId },
      include: {
        book: {
          select: {
            code: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Buscar todos os logs de auditoria
  static async getAllAuditLogs(limit: number = 100) {
    return await (prisma as any).bookAuditLog.findMany({
      include: {
        book: {
          select: {
            code: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // Buscar logs por ação
  static async getAuditLogsByAction(action: AuditAction, limit: number = 50) {
    return await (prisma as any).bookAuditLog.findMany({
      where: { action },
      include: {
        book: {
          select: {
            code: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // Buscar logs por período
  static async getAuditLogsByPeriod(startDate: Date, endDate: Date) {
    return await (prisma as any).bookAuditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        book: {
          select: {
            code: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Buscar estatísticas de auditoria
  static async getAuditStats() {
    const totalLogs = await (prisma as any).bookAuditLog.count()
    
    const logsByAction = await (prisma as any).bookAuditLog.groupBy({
      by: ['action'],
      _count: { action: true }
    })

    const recentLogs = await (prisma as any).bookAuditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
        }
      }
    })

    return {
      totalLogs,
      recentLogs,
      logsByAction: logsByAction.map((log: any) => ({
        action: log.action,
        count: log._count.action
      }))
    }
  }

  // Log de criação de livro
  static async logBookCreation(bookId: string, bookData: any, userId?: string) {
    return await this.createAuditLog({
      bookId,
      action: 'CREATE',
      description: `Livro "${bookData.title}" (${bookData.code}) foi cadastrado no sistema`,
      userId
    })
  }

  // Log de atualização de livro
  static async logBookUpdate(bookId: string, fieldName: string, oldValue: any, newValue: any, userId?: string) {
    const book = await (prisma as any).book.findUnique({
      where: { id: bookId },
      select: { code: true, title: true }
    })

    return await this.createAuditLog({
      bookId,
      action: 'UPDATE',
      fieldName,
      oldValue: String(oldValue),
      newValue: String(newValue),
      description: `Campo "${fieldName}" do livro "${book?.title}" (${book?.code}) foi alterado`,
      userId
    })
  }

  // Log de exclusão de livro
  static async logBookDeletion(bookId: string, bookData: any, userId?: string) {
    return await this.createAuditLog({
      bookId,
      action: 'DELETE',
      description: `Livro "${bookData.title}" (${bookData.code}) foi removido do sistema`,
      userId
    })
  }

  // Log de restauração de livro
  static async logBookRestoration(bookId: string, bookData: any, userId?: string) {
    return await this.createAuditLog({
      bookId,
      action: 'RESTORE',
      description: `Livro "${bookData.title}" (${bookData.code}) foi restaurado no sistema`,
      userId
    })
  }
} 