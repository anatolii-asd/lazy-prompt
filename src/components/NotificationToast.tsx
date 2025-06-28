import { useEffect } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'

interface NotificationToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function NotificationToast({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000
}: NotificationToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />
      case 'error':
        return <X className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return null
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center p-4 rounded-lg border shadow-lg ${getBackgroundColor()}`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className={`ml-3 text-sm font-medium ${getTextColor()}`}>
          {message}
        </div>
        <button
          onClick={onClose}
          className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-opacity-20 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getTextColor()}`}
        >
          <span className="sr-only">Dismiss</span>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}