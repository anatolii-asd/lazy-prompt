// Simplified Gemini-only AI System

/**
 * AI call function using Gemini 2.0 Flash
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