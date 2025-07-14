import { prisma } from '../prisma'
import { Student } from '@prisma/client'

export interface CreateStudentData {
  name: string
  email?: string
  registration: string
  grade: string
  class?: string
  phone?: string
  address?: string
}

export interface UpdateStudentData extends Partial<CreateStudentData> {}

export class StudentService {
  // Buscar todos os alunos
  static async getAllStudents() {
    return await prisma.student.findMany({
      orderBy: { name: 'asc' }
    })
  }

  // Buscar aluno por ID
  static async getStudentById(id: string) {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        loans: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        }
      }
    })
  }

  // Buscar alunos por filtros
  static async getStudentsByFilters(filters: {
    search?: string
    grade?: string
    status?: string
  }) {
    const { search, grade, status } = filters
    
    return await prisma.student.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { registration: { contains: search } }
            ]
          } : {},
          grade ? { grade } : {}
        ]
      },
      include: {
        loans: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  }

  // Criar novo aluno
  static async createStudent(data: CreateStudentData) {
    return await prisma.student.create({
      data
    })
  }

  // Atualizar aluno
  static async updateStudent(id: string, data: UpdateStudentData) {
    return await prisma.student.update({
      where: { id },
      data
    })
  }

  // Deletar aluno
  static async deleteStudent(id: string) {
    return await prisma.student.delete({
      where: { id }
    })
  }

  // Buscar estatísticas de alunos
  static async getStudentStats() {
    const totalStudents = await prisma.student.count()
    
    const studentsByGrade = await prisma.student.groupBy({
      by: ['grade'],
      _count: { grade: true }
    })

    const activeStudents = await prisma.student.count({
      where: {
        loans: {
          some: {
            status: 'ACTIVE'
          }
        }
      }
    })

    const inactiveStudents = totalStudents - activeStudents

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      studentsByGrade: studentsByGrade.map(grade => ({
        grade: grade.grade,
        count: grade._count.grade
      }))
    }
  }

  // Buscar alunos mais ativos
  static async getTopStudents(limit: number = 5) {
    return await prisma.student.findMany({
      take: limit,
      include: {
        loans: {
          select: { id: true }
        }
      },
      orderBy: {
        loans: {
          _count: 'desc'
        }
      }
    })
  }

  // Buscar alunos com empréstimos ativos
  static async getStudentsWithActiveLoans() {
    return await prisma.student.findMany({
      where: {
        loans: {
          some: {
            status: 'ACTIVE'
          }
        }
      },
      include: {
        loans: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        }
      }
    })
  }
} 