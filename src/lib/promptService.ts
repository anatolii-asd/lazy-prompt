import { supabase, Database } from './supabase'
import { User } from '@supabase/supabase-js'

export type Prompt = Database['public']['Tables']['prompts']['Row']
export type PromptInsert = Database['public']['Tables']['prompts']['Insert']
export type PromptTemplate = Database['public']['Tables']['prompt_templates']['Row']

export interface PromptData {
  originalInput: string
  generatedPrompt: string
  lazinessLevel: 'super_duper' | 'regular' | null
  questionsData?: Record<string, any> | null
  parentId?: string | null
  version?: number
}

export interface PromptWithVersions extends Prompt {
  total_versions: number
}

export interface EnhancePromptRequest {
  user_input: string
  mode: 'three_round'
  round?: number
  topic_answers?: Record<string, string>
  user_language?: string
  generate_preliminary?: boolean
}

export interface LazyTweak {
  name: string
  emoji: string
  description: string
}

export interface RoundQuestion {
  topic: string
  question: string
  options: Array<{
    text: string
    emoji: string
  }>
}

export interface EnhancedPromptResponse {
  enhanced_prompt?: string
  lazy_tweaks?: LazyTweak[]
  laziness_score: number
  prompt_quality: number
  template_used: string
  // Fields for three-round mode
  round_questions?: Array<{
    topic: string
    question: string
    options: Array<{
      text: string
      emoji: string
    }>
  }>
  current_round?: number
  total_rounds?: number
  detected_language?: string
  // Field for preliminary results
  preliminary_prompt?: string
}

// New interfaces for iterative improvement flow
export interface AnalyzePromptRequest {
  prompt: string
}

export interface AnalyzePromptResponse {
  score: number
  score_label: string
  score_explanation: string
  quick_analysis: {
    strengths: string[]
    weaknesses: string[]
  }
  improvement_areas: Array<{
    area: string
    priority: string
    icon: string
    title: string
    subtitle: string
    explanation: string
  }>
  suggested_questions: {
    goals: QuestionItem[]
    context: QuestionItem[]
    specificity: QuestionItem[]
    format: QuestionItem[]
  }
}

export interface QuestionItem {
  question: string
  type: 'text' | 'select' | 'textarea'
  options?: string[]
}

export interface ImprovePromptRequest {
  originalPrompt: string
  improvementArea?: string
  answers: Record<string, any>
  previousVersions?: string[]
  iterationCount?: number
}

export interface ImprovePromptResponse {
  improved_prompt: string
  changes_made: string[]
}

export const promptService = {
  // Save a new prompt
  async savePrompt(user: User, promptData: PromptData): Promise<{ data: Prompt | null; error: any }> {
    try {
      // If this is a refinement (has parentId), get the next version number
      let version = 1
      if (promptData.parentId) {
        const { data: versionData } = await supabase
          .rpc('get_next_version', { p_parent_id: promptData.parentId })
        version = versionData || 1
      }

      const insertData: PromptInsert = {
        user_id: user.id,
        original_input: promptData.originalInput,
        generated_prompt: promptData.generatedPrompt,
        laziness_level: promptData.lazinessLevel,
        questions_data: promptData.questionsData,
        parent_id: promptData.parentId,
        version
      }

      const { data, error } = await supabase
        .from('prompts')
        .insert(insertData)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get user's prompts (latest versions only)
  async getUserPrompts(user: User, limit = 10, offset = 0): Promise<{ data: PromptWithVersions[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('latest_prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get prompt count for user
  async getPromptCount(user: User): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from('latest_prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      return { count: count || 0, error }
    } catch (error) {
      return { count: 0, error }
    }
  },

  // Get all versions of a prompt family
  async getPromptVersions(parentId: string): Promise<{ data: Prompt[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .or(`id.eq.${parentId},parent_id.eq.${parentId}`)
        .order('version', { ascending: true })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get a specific prompt by ID
  async getPromptById(id: string): Promise<{ data: Prompt | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete a prompt (and all its versions if it's a parent)
  async deletePrompt(id: string): Promise<{ error: any }> {
    try {
      // First check if this is a parent prompt
      const { data: prompt } = await supabase
        .from('prompts')
        .select('id, parent_id')
        .eq('id', id)
        .single()

      if (!prompt) {
        return { error: 'Prompt not found' }
      }

      // If it's a parent (parent_id is null), delete all versions
      if (!prompt.parent_id) {
        const { error } = await supabase
          .from('prompts')
          .delete()
          .or(`id.eq.${id},parent_id.eq.${id}`)
        
        return { error }
      } else {
        // If it's a version, delete only this version
        const { error } = await supabase
          .from('prompts')
          .delete()
          .eq('id', id)
        
        return { error }
      }
    } catch (error) {
      return { error }
    }
  },

  // Search prompts by content
  async searchPrompts(user: User, query: string, limit = 10): Promise<{ data: PromptWithVersions[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('latest_prompts')
        .select('*')
        .eq('user_id', user.id)
        .or(`original_input.ilike.%${query}%,generated_prompt.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Enhanced prompt generation using Gemini API
  async enhancePrompt(request: EnhancePromptRequest): Promise<{ data: EnhancedPromptResponse | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: request
      })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // New iterative improvement flow - analyze prompt
  async analyzePrompt(request: AnalyzePromptRequest): Promise<{ data: AnalyzePromptResponse | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze', {
        body: request
      })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // New iterative improvement flow - improve prompt
  async improvePrompt(request: ImprovePromptRequest): Promise<{ data: ImprovePromptResponse | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('improve', {
        body: request
      })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get all templates
  async getAllTemplates(): Promise<{ data: PromptTemplate[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('category', { ascending: true })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<{ data: PromptTemplate[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc('get_templates_by_category', { cat: category })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Search templates
  async searchTemplates(searchTerm: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc('search_templates', { search_term: searchTerm })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}