// Simplified AI Provider System
// Single function to handle AI calls for analyze, improve, and config

/**
 * Single AI call function that handles provider switching internally
 * @param userPrompt - The user's prompt text
 * @param systemPrompt - System prompt for the AI
 * @param functionType - Type of function: 'analyze' or 'improve'
 * @returns Promise<string> - AI response content
 */
export async function ai_call(
  userPrompt: string, 
  systemPrompt: string, 
  functionType: 'analyze' | 'improve' = 'analyze'
): Promise<string> {
  // Get provider from environment (default to deepseek)
  const provider = Deno.env.get('MAIN_SYSTEM') || 'deepseek';
  
  // Validate provider
  if (!['deepseek', 'gemini'].includes(provider)) {
    throw new Error(`Invalid AI provider: ${provider}. Must be 'deepseek' or 'gemini'`);
  }
  
  if (provider === 'deepseek') {
    return await callDeepSeek(userPrompt, systemPrompt, functionType);
  } else {
    return await callGemini(userPrompt, systemPrompt, functionType);
  }
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek(userPrompt: string, systemPrompt: string, functionType: 'analyze' | 'improve'): Promise<string> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is required');
  }
  
  // Get configuration with defaults
  const model = Deno.env.get('DEEPSEEK_MODEL') || 'deepseek-chat';
  const temperature = parseFloat(Deno.env.get('DEEPSEEK_TEMPERATURE') || '0.3');
  const maxTokens = functionType === 'analyze' ? 
    parseInt(Deno.env.get('DEEPSEEK_MAX_TOKENS') || '2000') :
    parseInt(Deno.env.get('DEEPSEEK_MAX_TOKENS') || '1500');
  
  // Log system startup info
  console.log(`🚀 AI System started using DeepSeek, model: ${model}, max tokens: ${maxTokens}, temperature: ${temperature}, function: ${functionType}`);
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('DeepSeek API error:', errorData);
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
  }

  const responseData = await response.json();
  const content = responseData.choices[0].message.content;
  
  console.log(`✅ DeepSeek API call successful, response length: ${content.length} characters`);
  return content;
}

/**
 * Call Gemini API
 */
async function callGemini(userPrompt: string, systemPrompt: string, functionType: 'analyze' | 'improve'): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  // Get configuration with defaults
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-pro';
  const temperature = parseFloat(Deno.env.get('GEMINI_TEMPERATURE') || '0.3');
  const maxTokens = functionType === 'analyze' ? 
    parseInt(Deno.env.get('GEMINI_MAX_TOKENS') || '2000') :
    parseInt(Deno.env.get('GEMINI_MAX_TOKENS') || '1500');
  
  // Log system startup info
  console.log(`🚀 AI System started using Gemini, model: ${model}, max tokens: ${maxTokens}, temperature: ${temperature}, function: ${functionType}`);
  
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
  console.log('🔍 DEBUG: Gemini response structure:', JSON.stringify(responseData, null, 2));
  
  if (responseData.candidates && responseData.candidates.length > 0) {
    const candidate = responseData.candidates[0];
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      const content = candidate.content.parts[0].text;
      console.log(`✅ Gemini API call successful, response length: ${content.length} characters`);
      console.log('🔍 DEBUG: Raw Gemini content preview:', JSON.stringify(content.substring(0, 100)));
      return content;
    }
  }
  
  throw new Error('Invalid response format from Gemini API');
}