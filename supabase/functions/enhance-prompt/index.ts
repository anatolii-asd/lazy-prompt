import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PromptRequest {
  user_input: string;
  mode: 'super_lazy' | 'regular_lazy' | 'iterative';
  context?: any; // For lazy tweaks
  conversation_history?: ConversationEntry[];
}

interface ConversationEntry {
  question: string;
  answer: string;
  custom_text?: string;
}

interface IterativeQuestion {
  question: string;
  options: Array<{text: string; emoji: string}>;
  allow_custom: boolean;
}

interface GeminiChoice {
  message: {
    content: string;
  };
}

interface TemplateMatch {
  id: number;
  template_name: string;
  template_body: string;
  category: string;
  relevance_score: number;
}

interface EnhancedPromptResponse {
  enhanced_prompt?: string;
  questions?: Array<{
    question: string;
    options: Array<{
      text: string;
      emoji: string;
    }>;
  }>;
  lazy_tweaks?: Array<{
    name: string;
    emoji: string;
    description: string;
  }>;
  laziness_score: number;
  prompt_quality: number;
  template_used: string;
  // New fields for iterative mode
  question?: IterativeQuestion;
  is_complete?: boolean;
  completion_message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request data
    const requestBody = await req.json()
    const { user_input, mode, context, conversation_history }: PromptRequest = requestBody

    if (!user_input) {
      throw new Error('user_input is required')
    }

    // Step 1: Find the most relevant template
    const templateMatch = await findBestTemplate(supabaseClient, user_input)
    
    // Check if this is a final prompt generation request after iterative questions
    if (mode === 'iterative' && requestBody.generate_final && conversation_history && conversation_history.length > 0) {
      const finalPrompt = await generateFinalPromptFromHistory(user_input, templateMatch, conversation_history)
      return new Response(
        JSON.stringify(finalPrompt),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Step 2: Enhance the prompt using Gemini API
    const enhancement = await enhanceWithGemini(user_input, templateMatch, mode, context, conversation_history)

    return new Response(
      JSON.stringify(enhancement),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in enhance-prompt function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        enhanced_prompt: null,
        questions: null,
        laziness_score: 0,
        prompt_quality: 0,
        template_used: 'none'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

async function findBestTemplate(supabaseClient: any, userInput: string): Promise<TemplateMatch> {
  // First, try to use AI to categorize the input
  const categories = await getCategoriesFromAI(userInput)
  
  // Search templates using the AI-suggested categories
  let { data: templates, error } = await supabaseClient
    .from('prompt_templates')
    .select('*')
    .or(categories.map(cat => `category.ilike.%${cat}%`).join(','))
    .limit(10)

  if (error || !templates || templates.length === 0) {
    // Fallback: search by keywords in the user input
    const keywords = extractKeywords(userInput)
    const searchQuery = keywords.join(' | ')
    
    const { data: fallbackTemplates } = await supabaseClient
      .rpc('search_templates', { search_term: searchQuery })
      .limit(5)
    
    templates = fallbackTemplates || []
  }

  if (templates.length === 0) {
    // Ultimate fallback: use the Universal Generic Template
    const { data: genericTemplate } = await supabaseClient
      .from('prompt_templates')
      .select('*')
      .eq('template_name', 'Universal Generic Template')
      .single()
    
    return genericTemplate || {
      id: 0,
      template_name: 'Universal Generic Template',
      template_body: getDefaultTemplate(),
      category: 'Generic',
      relevance_score: 0.5
    }
  }

  // Use Gemini to pick the best template from the candidates
  const bestTemplate = await selectBestTemplateWithAI(userInput, templates)
  return bestTemplate
}

async function getCategoriesFromAI(userInput: string): Promise<string[]> {
  const prompt = `
Analyze this user input and suggest 2-3 most relevant categories from this list:
Analytics, Visual Analysis, Content Creation, Development, Business, Research, Problem Solving, Education, Communication, Evaluation, Documentation, Finance, Project Management, Product Management, Marketing, Legal, Training, Operations, Strategy, Risk Management, Generic

User input: "${userInput}"

Return only the category names, comma-separated, no explanations.
`

  try {
    const response = await callGeminiAPI(prompt)
    const categories = response.split(',').map(cat => cat.trim()).slice(0, 3)
    return categories
  } catch (error) {
    console.error('Error getting categories from AI:', error)
    return ['Generic']
  }
}

async function selectBestTemplateWithAI(userInput: string, templates: any[]): Promise<TemplateMatch> {
  const templateList = templates.map((t, index) => 
    `${index + 1}. ${t.template_name} (${t.category}): ${t.description}`
  ).join('\n')

  const prompt = `
Given this user input: "${userInput}"

Select the most relevant template from these options:
${templateList}

Return only the number (1-${templates.length}) of the best match, no explanations.
`

  try {
    const response = await callGeminiAPI(prompt)
    const selectedIndex = parseInt(response.trim()) - 1
    
    if (selectedIndex >= 0 && selectedIndex < templates.length) {
      return {
        ...templates[selectedIndex],
        relevance_score: 0.9
      }
    }
  } catch (error) {
    console.error('Error selecting template with AI:', error)
  }

  // Fallback to first template
  return {
    ...templates[0],
    relevance_score: 0.7
  }
}

async function enhanceWithGemini(
  userInput: string, 
  template: TemplateMatch, 
  mode: 'super_lazy' | 'regular_lazy' | 'iterative',
  context?: any,
  conversationHistory?: ConversationEntry[]
): Promise<EnhancedPromptResponse> {
  
  if (mode === 'super_lazy') {
    return await generateCompletePrompt(userInput, template, context)
  } else if (mode === 'regular_lazy') {
    return await generateQuestions(userInput, template)
  } else if (mode === 'iterative') {
    return await generateIterativeQuestion(userInput, template, conversationHistory || [])
  }
  
  // Fallback
  return await generateQuestions(userInput, template)
}

async function generateCompletePrompt(
  userInput: string, 
  template: TemplateMatch, 
  context?: any
): Promise<EnhancedPromptResponse> {
  
  const contextInfo = context ? `\nPrevious context: ${JSON.stringify(context)}` : ''
  
  const prompt = `
You are a prompt enhancement expert. The user wants to be LAZY, so create a complete, ready-to-use prompt for them.

User Input: "${userInput}"
Template: ${template.template_body}${contextInfo}

Instructions:
1. Create a COMPLETE prompt that the user can copy and paste immediately
2. Fill in the template with smart assumptions based on their input
3. Make it specific, actionable, and professional
4. The user should NOT have to fill in any blanks or answer more questions
5. Include specific examples, context, and requirements
6. Make it sound natural and comprehensive

Example: If they said "help me write a business email", create a prompt like:
"Write a professional business email to [specific audience you assume] regarding [specific topic you infer]. The email should be [tone], approximately [length], and include [specific elements]. Please ensure the email has a clear subject line, proper greeting, well-structured body paragraphs, and professional closing. The tone should be [specific tone] and the content should [specific instructions based on context]."

IMPORTANT: Create the FULL prompt, don't ask them to fill anything out!

Also provide 4-5 potential lazy tweaks the user might want:

Format as JSON:
{
  "enhanced_prompt": "Complete ready-to-use prompt here",
  "lazy_tweaks": [
    {
      "name": "Make it funnier",
      "emoji": "😄",
      "description": "Add humor and wit to make it more engaging"
    },
    {
      "name": "More details",
      "emoji": "📋",
      "description": "Include more specific requirements and examples"
    }
  ],
  "laziness_score": number,
  "prompt_quality": number,
  "template_used": "${template.template_name}"
}
`

  try {
    const response = await callGeminiAPI(prompt)
    console.log('Raw response:', response)
    
    // Clean the response more thoroughly
    let cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    
    // Try to extract JSON from the response using regex
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0]
    }
    
    // Remove control characters but preserve structure
    cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    
    console.log('Cleaned response:', cleanedResponse)
    
    const parsed = JSON.parse(cleanedResponse)
    return {
      enhanced_prompt: parsed.enhanced_prompt,
      lazy_tweaks: parsed.lazy_tweaks || [],
      laziness_score: parsed.laziness_score || 8,
      prompt_quality: parsed.prompt_quality || 7,
      template_used: template.template_name
    }
  } catch (error) {
    console.error('Error generating complete prompt:', error)
    console.error('Failed to parse response, using fallback')
    return {
      enhanced_prompt: `Enhanced prompt based on ${template.template_name}: ${userInput}`,
      lazy_tweaks: [],
      laziness_score: 5,
      prompt_quality: 5,
      template_used: template.template_name
    }
  }
}

async function generateQuestions(
  userInput: string, 
  template: TemplateMatch
): Promise<EnhancedPromptResponse> {
  
  const prompt = `
Create 5 SIMPLE questions to help enhance this request: "${userInput}"

Use this template as guidance: ${template.template_body}

Make the questions:
1. Easy to answer (no complex thinking required)
2. Focused on the most important aspects
3. Have clear, distinct options
4. Be fun with emojis but practical

For each question, provide 4 simple answer options with relevant emojis.

Example questions:
- "Who's this for?" 
- "What's the main goal?"
- "How formal should it be?"
- "How long should it be?"
- "Any special requirements?"

Format as JSON:
{
  "questions": [
    {
      "question": "Short, clear question?",
      "options": [
        {"text": "Brief option 1", "emoji": "🎯"},
        {"text": "Brief option 2", "emoji": "⚡"},
        {"text": "Brief option 3", "emoji": "🚀"},
        {"text": "Brief option 4", "emoji": "💡"}
      ]
    }
  ],
  "laziness_score": 6,
  "prompt_quality": 8,
  "template_used": "${template.template_name}"
}
`

  try {
    const response = await callGeminiAPI(prompt)
    console.log('Raw questions response:', response)
    
    // Clean the response more thoroughly
    let cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    
    // Try to extract JSON from the response using regex
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0]
    }
    
    // Remove control characters but preserve structure
    cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    
    console.log('Cleaned questions response:', cleanedResponse)
    
    const parsed = JSON.parse(cleanedResponse)
    return {
      questions: parsed.questions || [],
      laziness_score: parsed.laziness_score || 6,
      prompt_quality: parsed.prompt_quality || 8,
      template_used: template.template_name
    }
  } catch (error) {
    console.error('Error generating questions:', error)
    console.error('Failed to parse questions response, using fallback')
    return {
      questions: getDefaultQuestions(),
      laziness_score: 6,
      prompt_quality: 6,
      template_used: template.template_name
    }
  }
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
  
  console.log('API Key present:', !!GEMINI_API_KEY)
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required')
  }

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    }
  }

  console.log('Making request to Gemini API...')
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    }
  )

  console.log('Response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API error response:', errorText)
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('Gemini API response structure:', JSON.stringify(data, null, 2))
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.error('Invalid Gemini response structure:', data)
    throw new Error('Invalid response from Gemini API - no candidates or content')
  }

  const result = data.candidates[0].content.parts[0].text
  console.log('Extracted text length:', result?.length || 0)
  
  return result
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  return [...new Set(words)].slice(0, 5)
}

function getDefaultTemplate(): string {
  return `**Task Overview:**
- Primary objective: [What you want to accomplish]
- Context/background: [Relevant situational information]
- Target audience: [Who this is for or who will use the output]
- Success criteria: [How you'll know if this was successful]

**Specifications:**
- Scope: [What's included and what's not]
- Format requirements: [Structure, length, style preferences]
- Quality level: [Depth of detail needed]
- Technical level: [Complexity appropriate for audience]`
}

async function generateIterativeQuestion(
  userInput: string,
  template: TemplateMatch,
  conversationHistory: ConversationEntry[]
): Promise<EnhancedPromptResponse> {
  
  // Build conversation context
  const historyText = conversationHistory.length > 0 
    ? conversationHistory.map(entry => 
        `Q: ${entry.question}\nA: ${entry.answer}${entry.custom_text ? ` (Additional: ${entry.custom_text})` : ''}`
      ).join('\n\n')
    : 'No previous questions asked yet.'
  
  const prompt = `
You are helping a user create a better prompt through iterative questioning. You ask ONE question at a time.

Original user input: "${userInput}"
Template being used: ${template.template_body}

Conversation so far:
${historyText}

Your task:
1. Analyze what information is still needed to create a complete, high-quality prompt
2. Decide if you have enough information to generate the final prompt
3. If not enough info, generate ONE contextual question with 4 simple answer options

Rules:
- Ask only the MOST important missing information
- Questions should be easy to answer (no deep thinking required)
- Each option should be distinct and cover common cases
- Include fun, relevant emojis for each option
- Questions should build on previous answers
- After 3-5 questions, you should usually have enough info
- When you have enough info, set is_complete to true

Return JSON in this format:

If more info needed:
{
  "is_complete": false,
  "question": {
    "question": "Clear, simple question?",
    "options": [
      {"text": "Option 1", "emoji": "🎯"},
      {"text": "Option 2", "emoji": "⚡"},
      {"text": "Option 3", "emoji": "🚀"},
      {"text": "Option 4", "emoji": "💡"}
    ],
    "allow_custom": true
  }
}

If enough info collected:
{
  "is_complete": true,
  "completion_message": "I've got everything I need! Ready to create your amazing prompt? 🎉",
  "should_generate": true
}
`

  try {
    const response = await callGeminiAPI(prompt)
    console.log('Raw iterative response:', response)
    
    // Clean the response
    let cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0]
    }
    
    cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    
    const parsed = JSON.parse(cleanedResponse)
    
    if (parsed.is_complete) {
      // Ready to generate the final prompt
      return {
        is_complete: true,
        completion_message: parsed.completion_message || "I've got everything I need! Ready to create your amazing prompt? 🎉",
        laziness_score: 0,
        prompt_quality: 0,
        template_used: template.template_name
      }
    } else {
      // Return the next question
      return {
        question: parsed.question,
        is_complete: false,
        laziness_score: 0,
        prompt_quality: 0,
        template_used: template.template_name
      }
    }
  } catch (error) {
    console.error('Error generating iterative question:', error)
    // Fallback to a default question
    return {
      question: {
        question: "What's the main goal you want to achieve?",
        options: [
          { text: "Get quick results", emoji: "⚡" },
          { text: "Deep analysis", emoji: "🔍" },
          { text: "Creative output", emoji: "🎨" },
          { text: "Problem solving", emoji: "🧩" }
        ],
        allow_custom: true
      },
      is_complete: false,
      laziness_score: 0,
      prompt_quality: 0,
      template_used: template.template_name
    }
  }
}

async function generateFinalPromptFromHistory(
  userInput: string,
  template: TemplateMatch,
  conversationHistory: ConversationEntry[]
): Promise<EnhancedPromptResponse> {
  
  const historyText = conversationHistory.map(entry => 
    `Q: ${entry.question}\nA: ${entry.answer}${entry.custom_text ? ` (Additional: ${entry.custom_text})` : ''}`
  ).join('\n\n')
  
  const prompt = `
You are a prompt enhancement expert. Create a complete, ready-to-use prompt based on the user's input and their answers to clarifying questions.

Original user input: "${userInput}"
Template to use: ${template.template_body}

User's answers to questions:
${historyText}

Instructions:
1. Create a COMPLETE prompt that incorporates all the information gathered
2. Fill in the template using the user's specific answers
3. Make it specific, actionable, and professional
4. The user should NOT have to fill in any blanks
5. Include all context from their answers
6. Make it sound natural and comprehensive

Also provide 4-5 potential lazy tweaks the user might want.

Format as JSON:
{
  "enhanced_prompt": "Complete ready-to-use prompt here",
  "lazy_tweaks": [
    {
      "name": "Make it funnier",
      "emoji": "😄",
      "description": "Add humor and wit"
    }
  ],
  "laziness_score": number (1-10),
  "prompt_quality": number (1-10),
  "template_used": "${template.template_name}"
}
`

  try {
    const response = await callGeminiAPI(prompt)
    
    let cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0]
    }
    
    cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    
    const parsed = JSON.parse(cleanedResponse)
    return {
      enhanced_prompt: parsed.enhanced_prompt,
      lazy_tweaks: parsed.lazy_tweaks || [],
      laziness_score: parsed.laziness_score || 9,
      prompt_quality: parsed.prompt_quality || 9,
      template_used: template.template_name
    }
  } catch (error) {
    console.error('Error generating final prompt from history:', error)
    return {
      enhanced_prompt: `Enhanced prompt based on your answers: ${userInput}`,
      lazy_tweaks: [],
      laziness_score: 7,
      prompt_quality: 7,
      template_used: template.template_name
    }
  }
}

function getDefaultQuestions(): Array<{question: string; options: Array<{text: string; emoji: string}>}> {
  return [
    {
      question: "What's your main goal with this prompt?",
      options: [
        { text: "Get quick results", emoji: "⚡" },
        { text: "Deep analysis", emoji: "🔍" },
        { text: "Creative output", emoji: "🎨" },
        { text: "Problem solving", emoji: "🧩" }
      ]
    },
    {
      question: "Who is your target audience?",
      options: [
        { text: "General audience", emoji: "👥" },
        { text: "Experts/professionals", emoji: "🎓" },
        { text: "Beginners", emoji: "🌱" },
        { text: "Specific group", emoji: "🎯" }
      ]
    },
    {
      question: "What level of detail do you need?",
      options: [
        { text: "Brief summary", emoji: "📝" },
        { text: "Moderate detail", emoji: "📄" },
        { text: "Comprehensive", emoji: "📚" },
        { text: "Ultra-detailed", emoji: "🔬" }
      ]
    },
    {
      question: "What's your timeline?",
      options: [
        { text: "ASAP", emoji: "🚀" },
        { text: "This week", emoji: "📅" },
        { text: "This month", emoji: "🗓️" },
        { text: "No rush", emoji: "🐌" }
      ]
    },
    {
      question: "What format do you prefer?",
      options: [
        { text: "Step-by-step guide", emoji: "📋" },
        { text: "Narrative format", emoji: "📖" },
        { text: "Bullet points", emoji: "•" },
        { text: "Q&A format", emoji: "❓" }
      ]
    }
  ]
}