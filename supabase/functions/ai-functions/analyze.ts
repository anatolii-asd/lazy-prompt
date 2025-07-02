// Prompt Analysis Logic
import { ai_call } from "./ai_call.ts";

// System prompt for prompt analysis
const ANALYZE_SYSTEM_PROMPT = `You are an expert prompt engineering assistant. Your job is to analyze user prompts and provide structured feedback for improvement. You must respond in valid JSON format with the following structure:

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
    return JSON.parse(responseContent);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', responseContent);
    throw new Error('Invalid JSON response from AI provider');
  }
}