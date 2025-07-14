'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FiSearch, FiFilter, FiDownload, FiEye } from 'react-icons/fi'

interface BookHistory {
  id: string
  bookId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
  fieldName?: string
  oldValue?: string
  newValue?: string
  description: string
  createdAt: string
  book: {
    code: string
    title: string
    author: string
  }
}

export default function BookHistoryPage() {
  const [history, setHistory] = useState<BookHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('todos')
  const [filterPeriod, setFilterPeriod] = useState('30dias')

  useEffect(() => {
    setLoading(true)
    fetch('/api/audit?limit=200')
      .then(res => res.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : [])
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  // Remover duplicatas por ID antes de filtrar
  const uniqueHistory = history.filter((item, index, self) => 
    index === self.findIndex(h => h.id === item.id)
  )

  const filteredHistory = uniqueHistory.filter(item => {
    const matchesSearch = item.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.book?.code?.includes(searchTerm) ||
                         item.book?.author?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = filterAction === 'todos' || item.action === filterAction
    return matchesSearch && matchesAction
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'RESTORE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return '➕'
      case 'UPDATE': return '✏️'
      case 'DELETE': return '🗑️'
      case 'RESTORE': return '🔄'
      default: return '📝'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportHistory = () => {
    const csvContent = [
      'Código,Título,Autor,Ação,Campo,Valor Anterior,Novo Valor,Descrição,Data',
      ...filteredHistory.map(item => [
        item.book.code,
        item.book.title,
        item.book.author,
        item.action,
        item.fieldName || '',
        item.oldValue || '',
        item.newValue || '',
        item.description,
        formatDate(item.createdAt)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historico_livros_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur shadow rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Buscar por título, código ou autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="todos">Todas as ações</option>
                <option value="CREATE">Criação</option>
                <option value="UPDATE">Atualização</option>
                <option value="DELETE">Exclusão</option>
                <option value="RESTORE">Restauração</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
              >
                <option value="30dias">Últimos 30 dias</option>
                <option value="7dias">Últimos 7 dias</option>
                <option value="90dias">Últimos 90 dias</option>
                <option value="todos">Todos os períodos</option>
              </select>
            </div>
            <Button onClick={exportHistory} className="bg-green-600 hover:bg-green-700">
              <FiDownload className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white/80 backdrop-blur shadow rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Carregando...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhum registro encontrado</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alteração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getActionIcon(item.action)}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(item.action)}`}>
                            {item.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.book.title}</div>
                          <div className="text-sm text-gray-500">{item.book.code} • {item.book.author}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.fieldName ? (
                            <div>
                              <div className="font-medium">Campo: {item.fieldName}</div>
                              {item.oldValue && (
                                <div className="text-red-600">Antes: {item.oldValue}</div>
                              )}
                              {item.newValue && (
                                <div className="text-green-600">Depois: {item.newValue}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-600">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outline" size="sm">
                          <FiEye className="mr-1 h-3 w-3" />
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredHistory.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico encontrado</h3>
            <p className="text-gray-500">Não há registros de alterações para os filtros selecionados.</p>
          </div>
        )}
      </main>
    </div>
  )
} 