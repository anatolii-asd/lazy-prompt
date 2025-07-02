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
  
  try {
    // Clean the response - remove markdown code blocks if present
    let cleanedContent = responseContent.trim();
    
    // More aggressive cleaning - find the actual JSON content
    const jsonStart = cleanedContent.indexOf('{');
    const jsonEnd = cleanedContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
    }
    
    console.log('Cleaned JSON content preview:', cleanedContent.substring(0, 100) + '...');
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Failed to parse AI response as JSON. Original content length:', responseContent.length);
    console.error('Original preview:', responseContent.substring(0, 200));
    console.error('Cleaned content preview:', cleanedContent?.substring(0, 200));
    throw new Error('Invalid JSON response from AI provider');
  }
}