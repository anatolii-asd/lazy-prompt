import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string
          user_id: string
          parent_id: string | null
          version: number
          original_input: string
          generated_prompt: string
          laziness_level: 'super_duper' | 'regular' | null
          questions_data: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          parent_id?: string | null
          version?: number
          original_input: string
          generated_prompt: string
          laziness_level?: 'super_duper' | 'regular' | null
          questions_data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          parent_id?: string | null
          version?: number
          original_input?: string
          generated_prompt?: string
          laziness_level?: 'super_duper' | 'regular' | null
          questions_data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}