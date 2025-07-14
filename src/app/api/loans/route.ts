import { NextRequest, NextResponse } from 'next/server'
import { LoanService } from '@/lib/services/loans'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const period = searchParams.get('period') || undefined

    const loans = await LoanService.getLoansByFilters({
      search,
      status: status as any,
      period
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Converter a data de vencimento para Date
    const loanData = {
      ...body,
      dueDate: new Date(body.dueDate)
    }
    
    const loan = await LoanService.createLoan(loanData)
    return NextResponse.json(loan, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar empréstimo:', error)
    
    // Se é um erro conhecido com mensagem específica
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 