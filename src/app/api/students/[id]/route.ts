import { NextRequest, NextResponse } from 'next/server'
import { StudentService } from '@/lib/services/students'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await StudentService.getStudentById(params.id)
    
    if (!student) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Erro ao buscar aluno:', error)
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
    const student = await StudentService.updateStudent(params.id, body)
    return NextResponse.json(student)
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error)
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
    await StudentService.deleteStudent(params.id)
    return NextResponse.json({ message: 'Aluno deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar aluno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 