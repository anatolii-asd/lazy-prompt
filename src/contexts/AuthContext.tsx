import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type Language = 'en' | 'uk'

interface AuthContextType {
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
  language: Language
  setLanguage: (lang: Language) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to get saved language from localStorage
function getSavedLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language')
    if (saved === 'en' || saved === 'uk') {
      return saved
    }
  }
  return 'en' // Default to English
}

// Helper function to save language to localStorage
function saveLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = getSavedLanguage()
    setLanguageState(savedLanguage)
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    saveLanguage(lang)
  }

  const value = {
    session,
    user: session?.user ?? null,
    signOut,
    language,
    setLanguage,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}