import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error

      setEmailSent(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-forest-gradient flex items-center justify-center p-4 relative forest-sparkles">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-magical-glow border-2 border-wizard-forest-mist relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-emerald-magic bg-clip-text text-transparent mb-2">
              Prompt Wizard III
            </h1>
            <p className="text-gray-600">🧙‍♂️ Where magic meets your creative prompts 🌲</p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wizard-primary focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-emerald-magic text-white py-3 px-6 rounded-lg font-medium hover:bg-wizard-primary-dark transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    🧙‍♂️ Casting magic link...
                  </>
                ) : (
                  '🌟 Get Magic Link'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-wizard-forest-mist rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-wizard-primary"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-wizard-enchanted-shadow">🌟 Check your email!</h2>
              <p className="text-gray-600">
                We sent a magic link to <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in the email to log in. The link will expire in 1 hour.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                }}
                className="text-wizard-primary hover:text-wizard-primary-dark font-medium"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            By signing in, you agree to use this tool for magical prompt generation only. 🧙‍♂️🌲
          </p>
        </div>
      </div>
    </div>
  )
}