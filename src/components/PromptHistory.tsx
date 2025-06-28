import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { promptService, PromptWithVersions, Prompt } from '../lib/promptService'
import { ArrowLeft, Search, Loader2, Clock, Layers, Play, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

interface PromptHistoryProps {
  onBack: () => void
  onLoadPrompt: (prompt: PromptWithVersions) => void
}

export default function PromptHistory({ onBack, onLoadPrompt }: PromptHistoryProps) {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<PromptWithVersions[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set())
  const [promptVersions, setPromptVersions] = useState<Record<string, Prompt[]>>({})

  useEffect(() => {
    if (user) {
      loadPrompts()
    }
  }, [user])

  const loadPrompts = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      if (searchQuery.trim()) {
        const { data, error } = await promptService.searchPrompts(user, searchQuery.trim())
        if (error) throw error
        setPrompts(data || [])
      } else {
        const { data, error } = await promptService.getUserPrompts(user, 50)
        if (error) throw error
        setPrompts(data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadPrompts()
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt and all its versions?')) {
      return
    }

    try {
      const { error } = await promptService.deletePrompt(promptId)
      if (error) throw error
      
      // Remove from local state
      setPrompts(prev => prev.filter(p => p.id !== promptId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt')
    }
  }

  const toggleVersions = async (promptId: string) => {
    if (expandedPrompts.has(promptId)) {
      // Collapse
      setExpandedPrompts(prev => {
        const newSet = new Set(prev)
        newSet.delete(promptId)
        return newSet
      })
    } else {
      // Expand and load versions if not already loaded
      if (!promptVersions[promptId]) {
        try {
          const { data, error } = await promptService.getPromptVersions(promptId)
          if (error) throw error
          setPromptVersions(prev => ({ ...prev, [promptId]: data || [] }))
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load versions')
          return
        }
      }
      
      setExpandedPrompts(prev => new Set([...prev, promptId]))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getLazinessLabel = (level: string | null) => {
    switch (level) {
      case 'super_duper':
        return { label: 'Super Lazy', icon: '😴', color: 'bg-purple-100 text-purple-800' }
      case 'regular':
        return { label: 'Regular Lazy', icon: '🛋️', color: 'bg-blue-100 text-blue-800' }
      default:
        return { label: 'Unknown', icon: '❓', color: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Prompt Generator
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🦥 My Lazy Prompts
            </h1>
            <p className="text-gray-600">Your collection of effortlessly amazing prompts</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your prompts..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your lazy masterpieces...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && prompts.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🦥💤</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No prompts yet!</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No prompts found for "${searchQuery}"`
                : "Start creating some amazing prompts and they'll appear here"
              }
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition"
            >
              Create Your First Prompt
            </button>
          </div>
        )}

        {/* Prompts Grid */}
        {!loading && prompts.length > 0 && (
          <div className="grid gap-4 md:gap-6">
            {prompts.map((prompt) => {
              const laziness = getLazinessLabel(prompt.laziness_level)
              
              return (
                <div
                  key={prompt.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${laziness.color}`}>
                          {laziness.icon} {laziness.label}
                        </span>
                        {prompt.total_versions > 1 && (
                          <button
                            onClick={() => toggleVersions(prompt.id)}
                            className="flex items-center text-sm text-gray-500 hover:text-purple-600 transition-colors"
                          >
                            <Layers className="w-4 h-4 mr-1" />
                            {prompt.total_versions} versions
                            {expandedPrompts.has(prompt.id) ? (
                              <ChevronDown className="w-4 h-4 ml-1" />
                            ) : (
                              <ChevronRight className="w-4 h-4 ml-1" />
                            )}
                          </button>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {truncateText(prompt.original_input, 60)}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {truncateText(prompt.generated_prompt, 120)}
                      </p>
                    </div>
                  </div>

                  {/* Version History */}
                  {expandedPrompts.has(prompt.id) && promptVersions[prompt.id] && (
                    <div className="mb-4 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Version History:</h4>
                      <div className="space-y-3">
                        {promptVersions[prompt.id].map((version) => (
                          <div key={version.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-purple-700">
                                Version {version.version}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatDate(version.created_at)}
                                </span>
                                <button
                                  onClick={() => onLoadPrompt({
                                    ...version,
                                    total_versions: prompt.total_versions
                                  } as PromptWithVersions)}
                                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition"
                                >
                                  Load v{version.version}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Input:</span> {truncateText(version.original_input, 80)}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Generated:</span> {truncateText(version.generated_prompt, 100)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(prompt.created_at)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete prompt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onLoadPrompt(prompt)}
                        className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition group-hover:shadow-md"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Load Prompt
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Load More (placeholder for pagination) */}
        {!loading && prompts.length > 0 && prompts.length >= 10 && (
          <div className="text-center mt-8">
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Load more prompts...
            </button>
          </div>
        )}
      </div>
    </div>
  )
}