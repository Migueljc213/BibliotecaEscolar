'use client'

import { useState, useEffect } from 'react'
import { FiAlertTriangle, FiClock, FiBook, FiUser, FiX } from 'react-icons/fi'

interface Alert {
  id: string
  type: 'overdue' | 'low_stock' | 'system'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
  data?: any
}

function wasAlertSeen(id: string): boolean {
  if (typeof window === 'undefined') return false
  const seen = sessionStorage.getItem('seen_alerts')
  if (!seen) return false
  try {
    const arr = JSON.parse(seen)
    return arr.includes(id)
  } catch {
    return false
  }
}

function markAlertSeen(id: string) {
  if (typeof window === 'undefined') return
  const seen = sessionStorage.getItem('seen_alerts')
  let arr: string[] = []
  try {
    arr = seen ? JSON.parse(seen) : []
  } catch {
    arr = []
  }
  if (!arr.includes(id)) {
    arr.push(id)
    sessionStorage.setItem('seen_alerts', JSON.stringify(arr))
  }
}

export function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadAlerts = async () => {
    try {
      const newAlerts: Alert[] = []

      // Buscar empréstimos em atraso
      try {
        const loansResponse = await fetch('/api/loans')
        if (loansResponse.ok) {
          const loans = await loansResponse.json()
          const overdueLoans = loans.filter((loan: any) => loan.status === 'ACTIVE' && new Date(loan.dueDate) < new Date())
          overdueLoans.forEach((loan: any) => {
            const alertId = `overdue-${loan.id}`
            if (!wasAlertSeen(alertId)) {
              newAlerts.push({
                id: alertId,
                type: 'overdue',
                title: 'Empréstimo em Atraso',
                message: `O livro "${loan.book?.title || 'Livro'}" está em atraso desde ${new Date(loan.dueDate).toLocaleDateString('pt-BR')}`,
                severity: 'high',
                timestamp: loan.dueDate,
                data: loan
              })
            }
          })
        }
      } catch (error) { /* ignore */ }

      // Buscar livros com estoque baixo
      try {
        const booksResponse = await fetch('/api/books')
        if (booksResponse.ok) {
          const books = await booksResponse.json()
          const lowStockBooks = books.filter((book: any) => book.quantity <= 2)
          lowStockBooks.forEach((book: any) => {
            const alertId = `low-stock-${book.id}`
            if (!wasAlertSeen(alertId)) {
              newAlerts.push({
                id: alertId,
                type: 'low_stock',
                title: 'Estoque Baixo',
                message: `O livro "${book.title}" tem apenas ${book.quantity} exemplar(es) disponível(is)`,
                severity: book.quantity === 0 ? 'high' : 'medium',
                timestamp: new Date().toISOString(),
                data: book
              })
            }
          })
        }
      } catch (error) { /* ignore */ }

      setAlerts(newAlerts)
    } catch (error) {
      setAlerts([])
    }
  }

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <FiAlertTriangle className="h-5 w-5 text-red-600" />
      case 'medium':
        return <FiClock className="h-5 w-5 text-yellow-600" />
      default:
        return <FiBook className="h-5 w-5 text-blue-600" />
    }
  }

  const highPriorityAlerts = alerts.filter(alert => alert.severity === 'high')
  const mediumPriorityAlerts = alerts.filter(alert => alert.severity === 'medium')

  const handleCloseAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
    markAlertSeen(id)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FiAlertTriangle className="h-6 w-6" />
        {highPriorityAlerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {highPriorityAlerts.length > 9 ? '9+' : highPriorityAlerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Alertas do Sistema</h3>
            <p className="text-sm text-gray-500">
              {highPriorityAlerts.length} críticos, {mediumPriorityAlerts.length} médios
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhum alerta ativo
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border-b flex items-start justify-between ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs mt-1">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(alert.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCloseAlert(alert.id)}
                    className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
                    title="Fechar alerta"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para mostrar alertas críticos no dashboard
export function CriticalAlerts() {
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const loadCriticalAlerts = async () => {
      try {
        // Buscar apenas alertas críticos
        const loansResponse = await fetch('/api/loans')
        if (loansResponse.ok) {
          const loans = await loansResponse.json()
          const overdueLoans = loans.filter((loan: any) => loan.status === 'ACTIVE' && new Date(loan.dueDate) < new Date())

          const alerts: Alert[] = overdueLoans.slice(0, 3).map((loan: any) => ({
            id: `overdue-${loan.id}`,
            type: 'overdue',
            title: 'Empréstimo em Atraso',
            message: `"${loan.book.title}" - ${loan.student.name}`,
            severity: 'high',
            timestamp: loan.dueDate,
            data: loan
          })).filter(alert => !wasAlertSeen(alert.id))

          setCriticalAlerts(alerts)
        }
      } catch (error) {
        setCriticalAlerts([])
      }
    }

    loadCriticalAlerts()
    const interval = setInterval(loadCriticalAlerts, 2 * 60 * 1000) // 2 minutos
    return () => clearInterval(interval)
  }, [])

  const handleCloseAlert = (id: string) => {
    setCriticalAlerts(prev => prev.filter(a => a.id !== id))
    markAlertSeen(id)
  }

  if (criticalAlerts.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <FiAlertTriangle className="h-5 w-5 text-red-600 mr-2" />
        <h3 className="text-lg font-semibold text-red-800">Alertas Críticos</h3>
      </div>
      <div className="space-y-2">
        {criticalAlerts.map(alert => (
          <div key={alert.id} className="flex items-center text-sm text-red-700 justify-between">
            <div className="flex items-center">
              <FiClock className="h-4 w-4 mr-2" />
              <span>{alert.message}</span>
            </div>
            <button
              onClick={() => handleCloseAlert(alert.id)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
              title="Fechar alerta"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {criticalAlerts.length > 3 && (
        <p className="text-xs text-red-600 mt-2">
          +{criticalAlerts.length - 3} mais alertas críticos
        </p>
      )}
    </div>
  )
} 