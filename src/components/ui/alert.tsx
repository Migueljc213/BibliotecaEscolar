'use client'

import { useState, useEffect } from 'react'
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export function Alert({ 
  type, 
  title, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: <FiCheckCircle className="h-5 w-5 text-green-600" />,
          title: 'Sucesso'
        }
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: <FiAlertCircle className="h-5 w-5 text-red-600" />,
          title: 'Erro'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: <FiAlertTriangle className="h-5 w-5 text-yellow-600" />,
          title: 'Atenção'
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <FiInfo className="h-5 w-5 text-blue-600" />,
          title: 'Informação'
        }
    }
  }

  const styles = getTypeStyles()

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg shadow-lg transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${styles.container}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 flex-1">
            {(title || styles.title) && (
              <h3 className="text-sm font-medium">
                {title || styles.title}
              </h3>
            )}
            <p className="text-sm mt-1">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => onClose?.(), 300)
              }}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook para usar alertas
export function useAlert() {
  const [alerts, setAlerts] = useState<Array<AlertProps & { id: string }>>([])

  const showAlert = (alert: Omit<AlertProps, 'onClose'>) => {
    const id = Date.now().toString()
    const newAlert = {
      ...alert,
      id,
      onClose: () => {
        setAlerts(prev => prev.filter(a => a.id !== id))
      }
    }
    setAlerts(prev => [...prev, newAlert])
  }

  const showSuccess = (message: string, title?: string) => {
    showAlert({ type: 'success', message, title })
  }

  const showError = (message: string, title?: string) => {
    showAlert({ type: 'error', message, title })
  }

  const showWarning = (message: string, title?: string) => {
    showAlert({ type: 'warning', message, title })
  }

  const showInfo = (message: string, title?: string) => {
    showAlert({ type: 'info', message, title })
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  return {
    alerts,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAlerts
  }
}

// Componente para renderizar múltiplos alertas
export function AlertContainer() {
  const { alerts } = useAlert()

  return (
    <>
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={alert.onClose}
          autoClose={alert.autoClose}
          duration={alert.duration}
        />
      ))}
    </>
  )
} 