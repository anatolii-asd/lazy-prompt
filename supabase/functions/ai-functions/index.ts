// Main AI Functions Handler
// Routes requests to analyze or improve based on the endpoint

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { analyzePrompt } from "./analyze.ts";
import { improvePrompt } from "./improve.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
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
    const url = new URL(req.url);
    const functionName = url.pathname.split('/').pop();
    
    if (functionName === 'analyze') {
      const { prompt } = await req.json();
      const result = await analyzePrompt(prompt);
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
      
    } else if (functionName === 'improve') {
      const { originalPrompt, improvementArea, answers } = await req.json();
      const result = await improvePrompt(originalPrompt, improvementArea, answers);
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
      
    } else {
      return new Response(JSON.stringify({
        error: 'Unknown function. Use /analyze or /improve'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
  } catch (error) {
    console.error('AI Function error:', error);
    
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
      error: 'AI function failed. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Usage examples:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/ai-functions/analyze' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
//   --header 'Content-Type: application/json' \
//   --data '{"prompt":"Write a story about a dragon"}'

// curl -i --location --request POST 'http://localhost:54321/functions/v1/ai-functions/improve' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
//   --header 'Content-Type: application/json' \
//   --data '{"originalPrompt":"Write a story","improvementArea":"comprehensive","answers":{}}'