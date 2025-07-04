import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, History, ChevronDown, Globe } from 'lucide-react'
import { translate } from '../lib/translations'

interface ProfileDropdownProps {
  promptCount: number
  onShowHistory: () => void
}

export default function ProfileDropdown({ promptCount, onShowHistory }: ProfileDropdownProps) {
  const { user, signOut, language, setLanguage } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
      >
        <span className="text-gray-700">{user.email}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-500">{translate(language, 'auth.signIn')}</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
          </div>

          <button
            onClick={() => {
              onShowHistory()
              setIsOpen(false)
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <History className="w-4 h-4 text-gray-500 group-hover:text-wizard-primary" />
              <span className="text-gray-700 group-hover:text-gray-900">{translate(language, 'profile.myPrompts')}</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {promptCount} {translate(language, 'profile.promptCount')}
            </span>
          </button>

          <button
            onClick={() => {
              setLanguage(language === 'en' ? 'uk' : 'en')
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-gray-500 group-hover:text-wizard-primary" />
              <span className="text-gray-700 group-hover:text-gray-900">{translate(language, 'profile.language')}</span>
            </div>
            <span className="text-xs text-gray-500 flex items-center space-x-1">
              <span>{language === 'en' ? '🇺🇸' : '🇺🇦'}</span>
              <span>{language === 'en' ? 'English' : 'Українська'}</span>
            </span>
          </button>

          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 group"
            >
              <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
              <span className="text-gray-700 group-hover:text-gray-900">{translate(language, 'auth.signOut')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}