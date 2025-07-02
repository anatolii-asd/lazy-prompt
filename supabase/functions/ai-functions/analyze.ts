// Prompt Analysis Logic
import { ai_call } from "./ai_call.ts";

// System prompt for prompt analysis
const ANALYZE_SYSTEM_PROMPT = `You are an expert prompt engineering assistant. Your job is to analyze user prompts and provide structured feedback for improvement. 

CRITICAL: You must respond with ONLY valid JSON. Do not use markdown formatting, do not wrap in code blocks, do not add any text before or after the JSON. Start your response directly with { and end with }.

Respond with this exact JSON structure:

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

/**
 * Analyze a prompt and return structured feedback
 */
export async function analyzePrompt(prompt: string): Promise<any> {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt is required');
  }
  
  const userPrompt = `Please analyze this prompt: "${prompt}"`;
  const responseContent = await ai_call(userPrompt, ANALYZE_SYSTEM_PROMPT, 'analyze');
  
  try {
    // Clean the response - remove markdown code blocks if present
    let cleanedContent = responseContent.trim();
    
    console.log('🔍 DEBUG: Original response length:', responseContent.length);
    console.log('🔍 DEBUG: First 50 chars:', JSON.stringify(responseContent.substring(0, 50)));
    
    // More aggressive cleaning - find the actual JSON content
    const jsonStart = cleanedContent.indexOf('{');
    const jsonEnd = cleanedContent.lastIndexOf('}');
    
    console.log('🔍 DEBUG: JSON start position:', jsonStart);
    console.log('🔍 DEBUG: JSON end position:', jsonEnd);
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
      console.log('🔍 DEBUG: Extracted JSON length:', cleanedContent.length);
      console.log('🔍 DEBUG: First 100 chars of extracted JSON:', cleanedContent.substring(0, 100));
    } else {
      console.log('❌ DEBUG: Could not find valid JSON boundaries');
    }
    
    const result = JSON.parse(cleanedContent);
    console.log('✅ DEBUG: JSON parsing successful');
    return result;
    
  } catch (error) {
    console.error('❌ DEBUG: JSON parsing failed');
    console.error('Error message:', error.message);
    console.error('Original content length:', responseContent.length);
    console.error('First 200 chars of original:', JSON.stringify(responseContent.substring(0, 200)));
    console.error('First 200 chars of cleaned:', JSON.stringify(cleanedContent?.substring(0, 200)));
    throw new Error('Invalid JSON response from AI provider');
  }
}