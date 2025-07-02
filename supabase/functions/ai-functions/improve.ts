// Prompt Improvement Logic
import { ai_call } from "./ai_call.ts";

// System prompt for prompt improvement
const IMPROVE_SYSTEM_PROMPT = 'You are a prompt improvement specialist. Help users enhance their prompts based on their specific requirements. Focus on creating natural, well-structured prompts that incorporate the user\'s answers seamlessly. Respond with ONLY valid JSON (no markdown formatting, no code blocks, no additional text).';

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
    
    // Remove ```json and ``` if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', responseContent);
    throw new Error('Invalid JSON response from AI provider');
  }
}