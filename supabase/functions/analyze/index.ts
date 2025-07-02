// Supabase Edge Function for prompt analysis using Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { getAIConfig, createAIProviderClient } from "../_shared/ai_config.ts";
// System prompt for AI providers
const SYSTEM_PROMPT = `You are an expert prompt engineering assistant. Your job is to analyze user prompts and provide structured feedback for improvement. You must respond in valid JSON format with the following structure:

{
  "score": number (0-100),
  "score_label": string ("Excellent", "Good", "Needs Work", "Poor"),
  "score_explanation": string,
  "quick_analysis": {
    "strengths": [array of strings],
    "weaknesses": [array of strings]
  },
  "improvement_areas": [
    {
      "area": string,
      "priority": string ("High", "Medium", "Low"),
      "icon": string (emoji),
      "title": string,
      "subtitle": string,
      "explanation": string
    }
  ],
  "suggested_questions": {
    "goals": [array of question objects],
    "context": [array of question objects],
    "specificity": [array of question objects],
    "format": [array of question objects]
  }
}

Each question object should have: {"question": string, "type": "text|select|textarea", "options": [array] (only for select type)}

Analyze the prompt for: clarity, specificity, context, defined goals, output format, role definition, examples, and constraints. Provide actionable improvement suggestions. Use these consistent icons: 🎯 Goals, 🏗️ Context, 🔍 Specificity, 📋 Format, 👤 Role, 🌐 Other.`;
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  try {
    const { prompt } = await req.json();
    if (!prompt || prompt.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'Prompt is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    // Initialize AI provider configuration
    const aiConfig = getAIConfig();
    const aiClient = createAIProviderClient(aiConfig);
    
    // Make request to AI provider
    const messages = [
      {
        role: 'user',
        content: `Please analyze this prompt: "${prompt}"`
      }
    ];
    
    const responseContent = await aiClient.makeRequest(messages, SYSTEM_PROMPT);
    const analysis = JSON.parse(responseContent);
    return new Response(JSON.stringify(analysis), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error analyzing prompt:', error);
    
    // Handle configuration errors specifically
    if (error.message?.includes('API key') || error.message?.includes('environment variable')) {
      return new Response(JSON.stringify({
        error: 'AI provider configuration error. Please check your API keys.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Handle provider-specific API errors
    if (error.message?.includes('401')) {
      return new Response(JSON.stringify({
        error: 'Invalid API key'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } else if (error.message?.includes('429')) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Failed to analyze prompt. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}) // To invoke:
 // curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze' \
 //   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
 //   --header 'Content-Type: application/json' \
 //   --data '{"prompt":"Write a story about a dragon"}'
;
