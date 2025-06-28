import { supabase, Database } from './supabase'
import { User } from '@supabase/supabase-js'

export type Prompt = Database['public']['Tables']['prompts']['Row']
export type PromptInsert = Database['public']['Tables']['prompts']['Insert']

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
  }
}