// AI Functions - Gemini 2.0 Flash Only
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// System prompt for prompt analysis (English)
const ANALYZE_SYSTEM_PROMPT_EN = `You are an expert prompt engineering assistant. Your job is to analyze user prompts and provide structured feedback for improvement. 

CRITICAL: You must respond with ONLY valid JSON. Do not use markdown formatting, do not wrap in code blocks, do not add any text before or after the JSON. Start your response directly with { and end with }.

Respond with this exact JSON structure:

{
  "score": number (0-100),
  "score_label": string ("Excellent", "Good", "Needs Work", "Poor"),
  "suggested_questions": {
    "goals": [array of question objects],
    "context": [array of question objects],
    "specificity": [array of question objects],
    "format": [array of question objects]
  }
}

Each question object should have: {"question": string, "type": "select|textarea", "options": [array] (only for select type)}

Analyze the prompt for: clarity, specificity, context, defined goals, output format, role definition, examples, and constraints. Focus on generating helpful questions that will improve the prompt.`;

// System prompt for prompt analysis (Ukrainian)
const ANALYZE_SYSTEM_PROMPT_UK = `Ви - експерт з розробки промтів. Ваша задача - аналізувати промти користувачів і надавати структурований зворотній зв'язок для покращення.

КРИТИЧНО ВАЖЛИВО: Ви повинні відповісти ЛИШЕ валідним JSON. Не використовуйте markdown форматування, не обгортайте у блоки коду, не додавайте жодного тексту до чи після JSON. Починайте свою відповідь безпосередньо з { і закінчуйте }.

Відповідайте в цій точній JSON структурі:

{
  "score": number (0-100),
  "score_label": string ("Відмінно", "Добре", "Потребує покращення", "Погано"),
  "suggested_questions": {
    "goals": [масив об'єктів питань],
    "context": [масив об'єктів питань],
    "specificity": [масив об'єктів питань],
    "format": [масив об'єктів питань]
  }
}

Кожен об'єкт питання повинен мати: {"question": string, "type": "select|textarea", "options": [масив] (лише для типу select)}

Аналізуйте промт на: чіткість, специфічність, контекст, визначені цілі, формат виводу, визначення ролі, приклади та обмеження. Зосередьтесь на генерації корисних питань, які покращать промт.`;

// System prompt for prompt improvement (English)
const IMPROVE_SYSTEM_PROMPT_EN = `You are a prompt improvement specialist. I will provide you with an original prompt and Q&A pairs that contain additional context and requirements. Your task is to create an enhanced version of the prompt that naturally incorporates all the information from the Q&A pairs.

CRITICAL: You must respond with ONLY valid JSON. Do not use markdown formatting, do not wrap in code blocks, do not add any text before or after the JSON. Start your response directly with { and end with }.

Return only:
{
  "improved_prompt": string
}`;

// System prompt for prompt improvement (Ukrainian)
const IMPROVE_SYSTEM_PROMPT_UK = `Ви - спеціаліст з покращення промтів. Я надам вам оригінальний промт та пари питань-відповідей, які містять додатковий контекст і вимоги. Ваша задача - створити покращену версію промта, яка природно включає всю інформацію з пар питань-відповідей.

КРИТИЧНО ВАЖЛИВО: Ви повинні відповісти ЛИШЕ валідним JSON. Не використовуйте markdown форматування, не обгортайте у блоки коду, не додавайте жодного тексту до чи після JSON. Починайте свою відповідь безпосередньо з { і закінчуйте }.

Поверніть лише:
{
  "improved_prompt": string
}`;

/**
 * AI call function using Gemini 2.0 Flash
 */
async function ai_call(userPrompt: string, systemPrompt: string, functionType: 'analyze' | 'improve'): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  // Fixed configuration for Gemini 2.0 Flash
  const model = 'gemini-2.0-flash';
  const temperature = 0.3;
  const maxTokens = 4000;
  
  console.log(`🚀 Using Gemini ${model}, max tokens: ${maxTokens}, function: ${functionType}`);
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  // Combine system prompt and user prompt for Gemini
  const combinedPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: combinedPrompt }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Gemini API error:', errorData);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const responseData = await response.json();
  
  // Extract content from Gemini response
  if (responseData.candidates && responseData.candidates.length > 0) {
    const candidate = responseData.candidates[0];
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      const content = candidate.content.parts[0].text;
      console.log(`✅ Gemini response: ${content.length} chars`);
      return content;
    }
  }
  
  throw new Error('Invalid response format from Gemini API');
}

/**
 * Analyze a prompt and return structured feedback
 */
async function analyzePrompt(prompt: string, language?: string): Promise<any> {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt is required');
  }
  
  // Choose system prompt based on language
  const systemPrompt = (language === 'uk' || language === 'ua') ? ANALYZE_SYSTEM_PROMPT_UK : ANALYZE_SYSTEM_PROMPT_EN;
  
  const userPrompt = `Please analyze this prompt: "${prompt}"`;
  const responseContent = await ai_call(userPrompt, systemPrompt, 'analyze');
  
  // Extract JSON from response (handle markdown code blocks)
  const jsonStart = responseContent.indexOf('{');
  const jsonEnd = responseContent.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No JSON found in response');
  }
  
  const cleanedContent = responseContent.slice(jsonStart, jsonEnd + 1);
  
  try {
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('JSON parsing failed:', error.message);
    throw new Error('Invalid JSON in response');
  }
}

/**
 * Improve a prompt based on user answers
 */
async function improvePrompt(promptToImprove: string, questionsAndAnswers: Array<{question: string, answer: string}>, language?: string): Promise<any> {
  // Choose system prompt based on language
  const systemPrompt = (language === 'uk' || language === 'ua') ? IMPROVE_SYSTEM_PROMPT_UK : IMPROVE_SYSTEM_PROMPT_EN;
  
  const improvePrompt = `Original prompt: "${promptToImprove}"

Q&A pairs with additional context:
${JSON.stringify(questionsAndAnswers, null, 2)}`;
  
  const responseContent = await ai_call(improvePrompt, systemPrompt, 'improve');
  
  // Extract JSON from response (handle markdown code blocks)
  const jsonStart = responseContent.indexOf('{');
  const jsonEnd = responseContent.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No JSON found in response');
  }
  
  const cleanedContent = responseContent.slice(jsonStart, jsonEnd + 1);
  
  try {
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('JSON parsing failed:', error.message);
    throw new Error('Invalid JSON in response');
  }
}

// Main handler
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
    const pathParts = url.pathname.split('/');
    const urlOperation = pathParts[pathParts.length - 1]; // Get last part of URL
    
    const requestBody = await req.json();
    const { operation } = requestBody;
    
    // Determine operation from URL or request body
    const finalOperation = (urlOperation === 'analyze' || urlOperation === 'improve') ? urlOperation : operation;
    
    if (finalOperation === 'analyze') {
      const { prompt, language } = requestBody;
      const result = await analyzePrompt(prompt, language);
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
      
    } else if (finalOperation === 'improve') {
      const { prompt_to_improve, questions_and_answers, language } = requestBody;
      const result = await improvePrompt(prompt_to_improve, questions_and_answers, language);
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
      
    } else {
      return new Response(JSON.stringify({
        error: 'Missing or invalid operation. Use operation: "analyze" or "improve" in body, or call /ai-functions/analyze or /ai-functions/improve'
      }), {
        status: 400,
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
        error: 'Gemini API key configuration error. Please check GEMINI_API_KEY.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Handle API errors
    if (error.message?.includes('401')) {
      return new Response(JSON.stringify({
        error: 'Invalid Gemini API key'
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
