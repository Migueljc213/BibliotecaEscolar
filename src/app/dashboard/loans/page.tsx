'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FiTrash2, FiEye, FiPlus, FiCheck, FiX } from 'react-icons/fi'
import { useApi } from '@/hooks/useApi'
import { useNotifications } from '@/components/ui/notifications'
import { useAlert } from '@/components/ui/alert'

export default function LoansPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [formData, setFormData] = useState({
    studentId: '',
    bookId: '',
    dueDate: '',
    notes: ''
  })

  const { addNotification } = useNotifications()
  const { showSuccess, showError } = useAlert()

  // Buscar dados reais
  const { data: loans, loading: loansLoading, error: loansError, refetch: refetchLoans } = useApi<any[]>({
    url: '/api/loans'
  })

  const { data: students, loading: studentsLoading } = useApi<any[]>({
    url: '/api/students'
  })

  const { data: books, loading: booksLoading } = useApi<any[]>({
    url: '/api/books'
  })

  // Buscar livros disponíveis para empréstimo
  const [availableBooks, setAvailableBooks] = useState<any[]>([])
  const [availableBooksLoading, setAvailableBooksLoading] = useState(false)

  const fetchAvailableBooks = async (studentId?: string) => {
    if (!studentId) {
      setAvailableBooks([])
      return
    }

    try {
      setAvailableBooksLoading(true)
      const response = await fetch(`/api/loans/available-books?studentId=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableBooks(data)
      }
    } catch (error) {
      console.error('Erro ao buscar livros disponíveis:', error)
    } finally {
      setAvailableBooksLoading(false)
    }
  }

  const filteredLoans = loans?.filter(loan => {
    const matchesSearch = loan.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.book.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.student.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Verificar se está atrasado
    const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === 'ACTIVE'
    const loanStatus = isOverdue ? 'atrasado' : loan.status.toLowerCase()
    const matchesStatus = filterStatus === 'todos' || loanStatus === filterStatus
    
    return matchesSearch && matchesStatus
  }) || []

  const getStatusColor = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'ACTIVE'
    
    if (isOverdue) return 'bg-red-100 text-red-800'
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'RETURNED': return 'bg-blue-100 text-blue-800'
      case 'OVERDUE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'ACTIVE'
    
    if (isOverdue) return 'Em Atraso'
    switch (status) {
      case 'ACTIVE': return 'Ativo'
      case 'RETURNED': return 'Devolvido'
      case 'OVERDUE': return 'Em Atraso'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const handleCreateLoan = async () => {
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const newLoan = await response.json()
        refetchLoans()
        setFormData({ studentId: '', bookId: '', dueDate: '', notes: '' })
        setIsCreateModalOpen(false)
        
        // Adicionar notificação
        addNotification({
          message: `Empréstimo criado com sucesso!`,
          type: 'success',
          icon: '📚'
        })
      } else {
        const error = await response.json()
        const errorMessage = error.error || 'Erro desconhecido'
        
        showError(`Erro ao criar empréstimo: ${errorMessage}`)
        
        // Adicionar notificação de erro
        addNotification({
          message: `Erro ao criar empréstimo: ${errorMessage}`,
          type: 'error',
          icon: '❌'
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      showError('Erro ao criar empréstimo. Tente novamente.')
    }
  }



  const handleDeleteLoan = async () => {
    if (selectedLoan) {
      try {
        const response = await fetch(`/api/loans/${selectedLoan.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          refetchLoans()
          setSelectedLoan(null)
          setIsDeleteModalOpen(false)
          
          // Adicionar notificação
          addNotification({
            message: `Empréstimo removido com sucesso!`,
            type: 'warning',
            icon: '🗑️'
          })
        } else {
          const error = await response.json()
          const errorMessage = error.error || 'Erro desconhecido'
          
          showError(`Erro ao excluir empréstimo: ${errorMessage}`)
          
          // Adicionar notificação de erro
          addNotification({
            message: `Erro ao excluir empréstimo: ${errorMessage}`,
            type: 'error',
            icon: '❌'
          })
        }
      } catch (error) {
        console.error('Erro:', error)
        showError('Erro ao excluir empréstimo. Tente novamente.')
      }
    }
  }

  const handleReturnLoan = async (loan: any) => {
    try {
      const response = await fetch(`/api/loans/${loan.id}/return`, {
        method: 'POST'
      })
      
      if (response.ok) {
        refetchLoans()
        
        // Adicionar notificação
        addNotification({
          message: `Empréstimo devolvido com sucesso!`,
          type: 'success',
          icon: '✅'
        })
      } else {
        const error = await response.json()
        const errorMessage = error.error || 'Erro desconhecido'
        
        showError(`Erro ao devolver empréstimo: ${errorMessage}`)
        
        // Adicionar notificação de erro
        addNotification({
          message: `Erro ao devolver empréstimo: ${errorMessage}`,
          type: 'error',
          icon: '❌'
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      showError('Erro ao devolver empréstimo. Tente novamente.')
    }
  }



  const openDeleteModal = (loan: any) => {
    setSelectedLoan(loan)
    setIsDeleteModalOpen(true)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 tracking-tight">
                Gerenciamento de Empréstimos
              </h1>
              <Link
                href="/dashboard"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm font-semibold"
              >
                Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white/70 backdrop-blur border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 py-4 overflow-x-auto">
              <Link href="/dashboard" className="text-gray-500 hover:text-indigo-600 whitespace-nowrap font-semibold transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/books" className="text-gray-500 hover:text-indigo-600 whitespace-nowrap font-semibold transition-colors">
                Livros
              </Link>
              <Link href="/dashboard/students" className="text-gray-500 hover:text-indigo-600 whitespace-nowrap font-semibold transition-colors">
                Alunos
              </Link>
              <Link href="/dashboard/loans" className="text-indigo-600 border-b-2 border-indigo-600 pb-2 whitespace-nowrap font-semibold">
                Empréstimos
              </Link>
              <Link href="/dashboard/reports" className="text-gray-500 hover:text-indigo-600 whitespace-nowrap font-semibold transition-colors">
                Relatórios
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {/* Actions Bar */}
          <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Buscar por livro, código ou aluno..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="devolvido">Devolvido</option>
                  <option value="atrasado">Em Atraso</option>
                </select>
              </div>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors">
                    <FiPlus className="mr-2 h-4 w-4" />
                    Novo Empréstimo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Empréstimo</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo empréstimo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="student" className="text-right">Aluno</Label>
                      <select
                        id="student"
                        value={formData.studentId}
                        onChange={(e) => {
                          setFormData({...formData, studentId: e.target.value, bookId: ''})
                          // Atualizar livros disponíveis quando aluno é selecionado
                          if (e.target.value) {
                            fetchAvailableBooks(e.target.value)
                          }
                        }}
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione um aluno</option>
                        {students?.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name} - {student.registration} ({student.grade})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="book" className="text-right">Livro</Label>
                      <select
                        id="book"
                        value={formData.bookId}
                        onChange={(e) => setFormData({...formData, bookId: e.target.value})}
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        disabled={!formData.studentId}
                      >
                        <option value="">
                          {!formData.studentId 
                            ? 'Selecione um aluno primeiro' 
                            : availableBooksLoading 
                              ? 'Carregando livros...' 
                              : 'Selecione um livro'
                          }
                        </option>
                        {availableBooks?.map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.code} - {book.title} ({book.currentQuantity} disponível)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dueDate" className="text-right">Data de Devolução</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">Observações</Label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="button" onClick={handleCreateLoan}>
                      Adicionar Empréstimo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Loans Table */}
          <div className="bg-white/80 backdrop-blur shadow rounded-2xl overflow-hidden">
            {loansLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando empréstimos...</p>
              </div>
            ) : loansError ? (
              <div className="p-8 text-center">
                <p className="text-red-600">Erro ao carregar empréstimos: {loansError}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devolução</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(loan.borrowedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.student.grade} {loan.student.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{loan.book.title}</div>
                            <div className="text-gray-500">{loan.book.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.book.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(loan.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status, loan.dueDate)}`}>
                            {getStatusText(loan.status, loan.dueDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {loan.status === 'ACTIVE' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReturnLoan(loan)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <FiCheck className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Devolver</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteModal(loan)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Excluir</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLoans.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum empréstimo encontrado.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>



        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este empréstimo? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteLoan}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
} 