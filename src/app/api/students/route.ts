import { NextRequest, NextResponse } from 'next/server'
import { StudentService } from '@/lib/services/students'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const grade = searchParams.get('grade') || undefined
    const status = searchParams.get('status') || undefined

    const students = await StudentService.getStudentsByFilters({
      search,
      grade,
      status
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Erro ao buscar alunos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const student = await StudentService.createStudent(body)
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar aluno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 