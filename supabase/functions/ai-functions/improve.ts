// Prompt Improvement Logic
import { ai_call } from "./ai_call.ts";

// System prompt for prompt improvement
const IMPROVE_SYSTEM_PROMPT = `You are a prompt improvement specialist. Help users enhance their prompts based on their specific requirements. Focus on creating natural, well-structured prompts that incorporate the user's answers seamlessly. 

CRITICAL: You must respond with ONLY valid JSON. Do not use markdown formatting, do not wrap in code blocks, do not add any text before or after the JSON. Start your response directly with { and end with }.`;

/**
 * Improve a prompt based on user answers
 */
export async function improvePrompt(originalPrompt: string, improvementArea: string, answers: any): Promise<any> {
  let improvePrompt: string;
  
  if (improvementArea === 'comprehensive') {
    // Handle comprehensive improvement with all answers
    const answersText = Object.entries(answers).map(([area, areaAnswers]) => {
      const answersList = Object.entries(areaAnswers as any).map(([question, answer]) => 
        `  Q: ${question}\n  A: ${answer}`
      ).join('\n');
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
  
  const responseContent = await ai_call(improvePrompt, IMPROVE_SYSTEM_PROMPT, 'improve');
  
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