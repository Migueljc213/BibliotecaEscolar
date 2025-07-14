import { NextRequest, NextResponse } from 'next/server'
import { LoanService } from '@/lib/services/loans'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = await LoanService.getLoanById(params.id)
    
    if (!loan) {
      return NextResponse.json(
        { error: 'Empréstimo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Erro ao buscar empréstimo:', error)
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
    await LoanService.deleteLoan(params.id)
    return NextResponse.json({ message: 'Empréstimo deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar empréstimo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 