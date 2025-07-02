// Supabase Edge Function for prompt improvement using Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { ai_call } from "../_shared/ai_config.ts";
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
    const { originalPrompt, improvementArea, answers } = await req.json();
    let improvePrompt;
    if (improvementArea === 'comprehensive') {
      // Handle comprehensive improvement with all answers
      const answersText = Object.entries(answers).map(([area, areaAnswers])=>{
        const answersList = Object.entries(areaAnswers).map(([question, answer])=>`  Q: ${question}\n  A: ${answer}`).join('\n');
        return `${area.toUpperCase()}:\n${answersList}`;
      }).join('\n\n');
      improvePrompt = `Given this original prompt: "${originalPrompt}"

And these comprehensive user answers organized by improvement areas:

${answersText}

Please create an improved version of the prompt that incorporates ALL of these answers to make it more specific, contextual, and effective. The improved prompt should be natural, clear, and significantly better than the original.

Return a JSON object with:
{
  "improved_prompt": string,
  "changes_made": [array of strings describing what was improved]
}`;
    } else {
      // Handle single area improvement (legacy support)
      improvePrompt = `Given this original prompt: "${originalPrompt}"

And these user answers for ${improvementArea}:
${JSON.stringify(answers, null, 2)}

Please provide an improved version of the prompt that incorporates these answers. Return a JSON object with:
{
  "improved_prompt": string,
  "changes_made": [array of strings describing what was improved]
}`;
    }
    // Make AI call using simplified function
    const systemPrompt = 'You are a prompt improvement specialist. Help users enhance their prompts based on their specific requirements. Focus on creating natural, well-structured prompts that incorporate the user\'s answers seamlessly.';
    const responseContent = await ai_call(improvePrompt, systemPrompt, 'improve');
    const improvement = JSON.parse(responseContent);
    return new Response(JSON.stringify(improvement), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error improving prompt:', error);
    
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
      error: 'Failed to improve prompt. Please try again.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}) // To invoke:
 // curl -i --location --request POST 'http://localhost:54321/functions/v1/improve' \
 //   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
 //   --header 'Content-Type: application/json' \
 //   --data '{"originalPrompt":"Write a story","improvementArea":"comprehensive","answers":{}}'
;
