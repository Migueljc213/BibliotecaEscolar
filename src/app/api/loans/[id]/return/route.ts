import { NextRequest, NextResponse } from 'next/server'
import { LoanService } from '@/lib/services/loans'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = await LoanService.returnLoan(params.id)
    return NextResponse.json(loan)
  } catch (error) {
    console.error('Erro ao devolver empréstimo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 