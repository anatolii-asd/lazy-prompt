import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PromptRequest {
  user_input: string;
  mode: 'three_round';
  round?: number; // For three-round flow
  topic_answers?: Record<string, string>; // Answers from previous rounds
  user_language?: string; // Detected language
  generate_preliminary?: boolean; // Generate preliminary result after round
}

interface ConversationEntry {
  question: string;
  answer: string;
  custom_text?: string;
  total_questions?: number; // Store the estimated total for reference
}

interface IterativeQuestion {
  question: string;
  options: Array<{text: string; emoji: string}>;
  allow_custom: boolean;
}

interface QuestionBatch {
  questions: IterativeQuestion[];
  batch_number: number;
  total_batches: number;
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
  question_batch?: QuestionBatch;
  is_complete?: boolean;
  completion_message?: string;
  estimated_questions?: number;
  questions_asked?: number;
  // New fields for three-round mode
  round_questions?: Array<{
    topic: string;
    question: string;
    options: Array<{
      text: string;
      emoji: string;
    }>;
  }>;
  current_round?: number;
  total_rounds?: number;
  detected_language?: string;
  // New field for preliminary results
  preliminary_prompt?: string;
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
    const { user_input, mode, round, topic_answers, user_language, generate_preliminary }: PromptRequest = requestBody

    if (!user_input) {
      throw new Error('user_input is required')
    }

    // Only support three_round mode now
    if (mode !== 'three_round') {
      throw new Error('Only three_round mode is supported')
    }

    // Detect language if not provided
    const detectedLanguage = user_language || await detectLanguage(user_input)

    // Handle three-round mode
    const enhancement = await handleThreeRoundMode(user_input, round || 1, topic_answers || {}, detectedLanguage, generate_preliminary)

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



async function callDeepSeekAPI(prompt: string): Promise<string> {
  const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
  
  console.log('API Key present:', !!DEEPSEEK_API_KEY)
  
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY environment variable is required')
  }

  const requestBody = {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that provides responses in JSON format.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' }
  }

  console.log('Making request to DeepSeek API...')
  
  const response = await fetch(
    'https://api.deepseek.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    }
  )

  console.log('Response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('DeepSeek API error response:', errorText)
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('DeepSeek API response structure:', JSON.stringify(data, null, 2))
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Invalid DeepSeek response structure:', data)
    throw new Error('Invalid response from DeepSeek API - no choices or message')
  }

  const result = data.choices[0].message.content
  console.log('Extracted text length:', result?.length || 0)
  
  return result
}



async function detectLanguage(text: string): Promise<string> {
  const prompt = `
Detect the language of this text and return only the language code (e.g., "en" for English, "uk" for Ukrainian, "es" for Spanish, etc.).

Text: "${text}"

Return only the two-letter language code, nothing else.
`

  try {
    const response = await callDeepSeekAPI(prompt)
    const langCode = response.trim().toLowerCase()
    return langCode || 'en'
  } catch (error) {
    console.error('Error detecting language:', error)
    return 'en' // Default fallback
  }
}

async function handleThreeRoundMode(
  userInput: string,
  round: number,
  topicAnswers: Record<string, string>,
  language: string,
  generatePreliminary?: boolean
): Promise<EnhancedPromptResponse> {
  
  if (round === 1 && !generatePreliminary) {
    // First round: generate 6 questions for the 6 topics
    return await generateFirstRoundQuestions(userInput, language)
  } else if (round === 1 && generatePreliminary) {
    // Generate preliminary result after round 1
    return await generatePreliminaryPrompt(userInput, topicAnswers, language, 1)
  } else if (round === 2 && !generatePreliminary) {
    // Second round: generate deeper questions based on first round answers
    return await generateSecondRoundQuestions(userInput, topicAnswers, language)
  } else if (round === 2 && generatePreliminary) {
    // Generate preliminary result after round 2
    return await generatePreliminaryPrompt(userInput, topicAnswers, language, 2)
  } else if (round === 3 && !generatePreliminary) {
    // Third round: generate final clarifying questions
    return await generateThirdRoundQuestions(userInput, topicAnswers, language)
  } else if (round === 3 && generatePreliminary) {
    // Generate preliminary result after round 3 (final result)
    return await generatePreliminaryPrompt(userInput, topicAnswers, language, 3)
  } else {
    // Generate final prompt after all rounds
    return await generateFinalPromptFromRounds(userInput, topicAnswers, language)
  }
}

async function generateFirstRoundQuestions(
  userInput: string,
  language: string
): Promise<EnhancedPromptResponse> {
  
  const languageInstruction = language === 'en' ? 
    '' : 
    `IMPORTANT: Generate all questions and options in ${getLanguageName(language)} language. Follow the user's language exactly.`

  const prompt = `
${languageInstruction}

Generate 6 questions to clarify these specific aspects of the user's prompt request:

1. GOAL - What is the main objective?
2. ROLE - What persona/role should the AI adopt?
3. CONTEXT - What background information is needed?
4. OUTPUT FORMAT - How should the response be structured?
5. WARNING - What should be avoided or considered carefully?
6. EXAMPLE - What kind of examples would be helpful?

User input: "${userInput}"

For each topic, create ONE focused question with 4 clear answer options.

${language === 'en' ? 'Format as JSON:' : 'Форматуйте як JSON:'}
{
  "round_questions": [
    {
      "topic": "goal",
      "question": "${language === 'en' ? 'Clear question about the goal?' : 'Яке основне завдання?'}",
      "options": [
        {"text": "${language === 'en' ? 'Option 1' : 'Варіант 1'}", "emoji": "🎯"},
        {"text": "${language === 'en' ? 'Option 2' : 'Варіант 2'}", "emoji": "⚡"},
        {"text": "${language === 'en' ? 'Option 3' : 'Варіант 3'}", "emoji": "🚀"},
        {"text": "${language === 'en' ? 'Option 4' : 'Варіант 4'}", "emoji": "💡"}
      ]
    }
  ],
  "current_round": 1,
  "total_rounds": 3,
  "detected_language": "${language}"
}

Generate exactly 6 questions - one for each topic: goal, role, context, output_format, warning, example.
`

  try {
    const response = await callDeepSeekAPI(prompt)
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
      round_questions: parsed.round_questions || getDefaultRoundQuestions(language),
      current_round: 1,
      total_rounds: 3,
      detected_language: language,
      laziness_score: 0,
      prompt_quality: 0,
      template_used: 'three_round_mode'
    }
  } catch (error) {
    console.error('Error generating first round questions:', error)
    return {
      round_questions: getDefaultRoundQuestions(language),
      current_round: 1,
      total_rounds: 3,
      detected_language: language,
      laziness_score: 0,
      prompt_quality: 0,
      template_used: 'three_round_mode'
    }
  }
}

async function generateSecondRoundQuestions(
  userInput: string,
  topicAnswers: Record<string, string>,
  language: string
): Promise<EnhancedPromptResponse> {
  
  const languageInstruction = language === 'en' ? 
    '' : 
    `IMPORTANT: Generate all questions and options in ${getLanguageName(language)} language. Follow the user's language exactly.`

  const answersText = Object.entries(topicAnswers)
    .map(([topic, answer]) => `${topic}: ${answer}`)
    .join('\n')

  const prompt = `
${languageInstruction}

Based on the user's first round answers, generate 6 deeper clarifying questions for each topic.

User input: "${userInput}"

First round answers:
${answersText}

Now generate MORE SPECIFIC questions for each topic based on their answers:

1. GOAL - Dig deeper into their specific objective
2. ROLE - Clarify the exact persona/expertise needed  
3. CONTEXT - Get more background details
4. OUTPUT FORMAT - Specify exact formatting requirements
5. WARNING - Identify specific risks or constraints
6. EXAMPLE - Clarify what examples would be most helpful

${language === 'en' ? 'Format as JSON:' : 'Форматуйте як JSON:'}
{
  "round_questions": [
    {
      "topic": "goal",
      "question": "${language === 'en' ? 'More specific question about goal?' : 'Більш конкретне питання про мету?'}",
      "options": [
        {"text": "${language === 'en' ? 'Specific option 1' : 'Конкретний варіант 1'}", "emoji": "🎯"},
        {"text": "${language === 'en' ? 'Specific option 2' : 'Конкретний варіант 2'}", "emoji": "⚡"},
        {"text": "${language === 'en' ? 'Specific option 3' : 'Конкретний варіант 3'}", "emoji": "🚀"},
        {"text": "${language === 'en' ? 'Specific option 4' : 'Конкретний варіант 4'}", "emoji": "💡"}
      ]
    }
  ],
  "current_round": 2,
  "total_rounds": 3,
  "detected_language": "${language}"
}

Generate exactly 6 questions that build on their first round answers.
`

  try {
    const response = await callDeepSeekAPI(prompt)
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
      round_questions: parsed.round_questions || getDefaultRoundQuestions(language),
      current_round: 2,
      total_rounds: 3,
      detected_language: language,
      laziness_score: 0,
      prompt_quality: 0,
      template_used: 'three_round_mode'
    }
  } catch (error) {
    console.error('Error generating second round questions:', error)
    return {
      round_questions: getDefaultRoundQuestions(language),
      current_round: 2,
      total_rounds: 3,
      detected_language: language,
      laziness_score: 0,
      prompt_quality: 0,
      template_used: 'three_round_mode'
    }
  }
}

async function generateThirdRoundQuestions(
  userInput: string,
  topicAnswers: Record<string, string>,
  language: string
): Promise<EnhancedPromptResponse> {
  
  const languageInstruction = language === 'en' ? 
    '' : 
    `IMPORTANT: Generate all questions and options in ${getLanguageName(language)} language. Follow the user's language exactly.`

  const answersText = Object.entries(topicAnswers)
    .map(([topic, answer]) => `${topic}: ${answer}`)
    .join('\n')

  const prompt = `
${languageInstruction}

This is the FINAL round of questions. Generate 6 very specific, final clarifying questions.

User input: "${userInput}"

All previous answers:
${answersText}

Generate the FINAL set of 6 questions to gather any remaining important details:

1. GOAL - Final goal clarification
2. ROLE - Final role/persona details
3. CONTEXT - Final context requirements
4. OUTPUT FORMAT - Final format specifications
5. WARNING - Final constraints or warnings
6. EXAMPLE - Final example requirements

${language === 'en' ? 'Format as JSON:' : 'Форматуйте як JSON:'}
{
  "round_questions": [
    {
      "topic": "goal",
      "question": "${language === 'en' ? 'Final question about goal?' : 'Останнє питання про мету?'}",
      "options": [
        {"text": "${language === 'en' ? 'Final option 1' : 'Останній варіант 1'}", "emoji": "🎯"},
        {"text": "${language === 'en' ? 'Final option 2' : 'Останній варіант 2'}", "emoji": "⚡"},
        {"text": "${language === 'en' ? 'Final option 3' : 'Останній варіант 3'}", "emoji": "🚀"},
        {"text": "${language === 'en' ? 'Final option 4' : 'Останній варіант 4'}", "emoji": "💡"}
      ]
    }
  ],
  "current_round": 3,
  "total_rounds": 3,
  "detected_language": "${language}"
}

Generate exactly 6 final clarifying questions.
`

  try {
    const response = await callDeepSeekAPI(prompt)
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
      round_questions: parsed.round_questions || getDefaultRoundQuestions(language),
      current_round: 3,
      total_rounds: 3,
      detected_language: language,
      laziness_score: 0,
      prompt_quality: 0,
      template_used: 'three_round_mode'
    }
  } catch (error) {
    console.error('Error generating third round questions:', error)
    return {
      round_questions: getDefaultRoundQuestions(language),
      current_round: 3,
      total_rounds: 3,
      detected_language: language,
      laziness_score: 0,
      prompt_quality: 0,
      template_used: 'three_round_mode'
    }
  }
}

async function generatePreliminaryPrompt(
  userInput: string,
  topicAnswers: Record<string, string>,
  language: string,
  completedRound: number
): Promise<EnhancedPromptResponse> {
  
  const languageInstruction = language === 'en' ? 
    '' : 
    `IMPORTANT: Generate the preliminary prompt in ${getLanguageName(language)} language if the user's input was in that language.`

  const answersText = Object.entries(topicAnswers)
    .map(([topic, answer]) => `${topic}: ${answer}`)
    .join('\n')

  const prompt = `
${languageInstruction}

Create a PRELIMINARY prompt based on the user's input and their answers from ${completedRound} round(s) of questions.
This is NOT the final version - the user can choose to continue with more rounds for better refinement.

User input: "${userInput}"

Answers collected so far:
${answersText}

Instructions:
1. Create a good working prompt using the information gathered so far
2. It should be functional but show room for improvement with more rounds
3. Structure it with clear sections: goal, role, context, output format, etc.
4. Make it practical and usable as-is
5. Keep the tone appropriate to the detected language

${language === 'en' ? 'Format as JSON:' : 'Форматуйте як JSON:'}
{
  "preliminary_prompt": "Complete preliminary prompt here",
  "laziness_score": ${completedRound === 1 ? 6 : 8},
  "prompt_quality": ${completedRound === 1 ? 6 : 8},
  "template_used": "three_round_preliminary_r${completedRound}",
  "current_round": ${completedRound},
  "total_rounds": 3,
  "detected_language": "${language}"
}
`

  try {
    const response = await callDeepSeekAPI(prompt)
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
      preliminary_prompt: parsed.preliminary_prompt,
      laziness_score: parsed.laziness_score || (completedRound === 1 ? 6 : 8),
      prompt_quality: parsed.prompt_quality || (completedRound === 1 ? 6 : 8),
      template_used: parsed.template_used || `three_round_preliminary_r${completedRound}`,
      current_round: completedRound,
      total_rounds: 3,
      detected_language: language
    }
  } catch (error) {
    console.error('Error generating preliminary prompt:', error)
    return {
      preliminary_prompt: `Preliminary prompt based on round ${completedRound} answers: ${userInput}`,
      laziness_score: completedRound === 1 ? 6 : 8,
      prompt_quality: completedRound === 1 ? 6 : 8,
      template_used: `three_round_preliminary_r${completedRound}`,
      current_round: completedRound,
      total_rounds: 3,
      detected_language: language
    }
  }
}

async function generateFinalPromptFromRounds(
  userInput: string,
  topicAnswers: Record<string, string>,
  language: string
): Promise<EnhancedPromptResponse> {
  
  const languageInstruction = language === 'en' ? 
    '' : 
    `IMPORTANT: Generate the final prompt in ${getLanguageName(language)} language if the user's input was in that language.`

  const answersText = Object.entries(topicAnswers)
    .map(([topic, answer]) => `${topic}: ${answer}`)
    .join('\n')

  const prompt = `
${languageInstruction}

Create a complete, professional prompt based on the user's input and their detailed answers from 3 rounds of questions.

User input: "${userInput}"

Complete answers from all rounds:
${answersText}

Instructions:
1. Create a COMPLETE, ready-to-use prompt incorporating all the gathered information
2. Structure it professionally with clear sections for: goal, role, context, output format, warnings, and examples
3. Make it specific and actionable
4. The user should NOT have to fill in any blanks
5. Include all the context from their answers
6. Make it comprehensive and well-structured

${language === 'en' ? 'Format as JSON:' : 'Форматуйте як JSON:'}
{
  "enhanced_prompt": "Complete ready-to-use prompt here",
  "lazy_tweaks": [
    {
      "name": "${language === 'en' ? 'Make it more detailed' : 'Зробити детальніше'}",
      "emoji": "📋",
      "description": "${language === 'en' ? 'Add more specific requirements and examples' : 'Додати більше конкретних вимог та прикладів'}"
    }
  ],
  "laziness_score": 10,
  "prompt_quality": 10,
  "template_used": "three_round_comprehensive"
}
`

  try {
    const response = await callDeepSeekAPI(prompt)
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
      laziness_score: parsed.laziness_score || 10,
      prompt_quality: parsed.prompt_quality || 10,
      template_used: 'three_round_comprehensive'
    }
  } catch (error) {
    console.error('Error generating final prompt from rounds:', error)
    return {
      enhanced_prompt: `Enhanced prompt based on your detailed answers: ${userInput}`,
      lazy_tweaks: [],
      laziness_score: 8,
      prompt_quality: 8,
      template_used: 'three_round_comprehensive'
    }
  }
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'uk': 'Ukrainian',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'pl': 'Polish',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese'
  }
  return languages[code] || 'English'
}

function getDefaultRoundQuestions(language: string): Array<{topic: string; question: string; options: Array<{text: string; emoji: string}>}> {
  if (language === 'uk') {
    return [
      {
        topic: "goal",
        question: "Яка основна мета цього запиту?",
        options: [
          { text: "Отримати швидкий результат", emoji: "⚡" },
          { text: "Глибокий аналіз", emoji: "🔍" },
          { text: "Творчий результат", emoji: "🎨" },
          { text: "Вирішення проблеми", emoji: "🧩" }
        ]
      },
      {
        topic: "role",
        question: "Яку роль повинен грати AI?",
        options: [
          { text: "Експерт у галузі", emoji: "🎓" },
          { text: "Помічник-консультант", emoji: "🤝" },
          { text: "Творчий партнер", emoji: "🎭" },
          { text: "Аналітик", emoji: "📊" }
        ]
      },
      {
        topic: "context",
        question: "Який контекст важливий?",
        options: [
          { text: "Бізнес-контекст", emoji: "💼" },
          { text: "Особистий контекст", emoji: "👤" },
          { text: "Технічний контекст", emoji: "⚙️" },
          { text: "Освітній контекст", emoji: "📚" }
        ]
      },
      {
        topic: "output_format",
        question: "Який формат відповіді потрібен?",
        options: [
          { text: "Покроковий план", emoji: "📋" },
          { text: "Детальний опис", emoji: "📄" },
          { text: "Список пунктів", emoji: "•" },
          { text: "Структурований текст", emoji: "📊" }
        ]
      },
      {
        topic: "warning",
        question: "Що слід врахувати або уникнути?",
        options: [
          { text: "Часові обмеження", emoji: "⏰" },
          { text: "Бюджетні обмеження", emoji: "💰" },
          { text: "Технічні обмеження", emoji: "⚙️" },
          { text: "Правові аспекти", emoji: "⚖️" }
        ]
      },
      {
        topic: "example",
        question: "Які приклади будуть корисними?",
        options: [
          { text: "Практичні приклади", emoji: "💡" },
          { text: "Реальні кейси", emoji: "📚" },
          { text: "Покрокові приклади", emoji: "🔢" },
          { text: "Візуальні приклади", emoji: "🎨" }
        ]
      }
    ]
  }
  
  // Default English questions
  return [
    {
      topic: "goal",
      question: "What's the main goal of this request?",
      options: [
        { text: "Get quick results", emoji: "⚡" },
        { text: "Deep analysis", emoji: "🔍" },
        { text: "Creative output", emoji: "🎨" },
        { text: "Problem solving", emoji: "🧩" }
      ]
    },
    {
      topic: "role",
      question: "What role should the AI play?",
      options: [
        { text: "Domain expert", emoji: "🎓" },
        { text: "Assistant consultant", emoji: "🤝" },
        { text: "Creative partner", emoji: "🎭" },
        { text: "Data analyst", emoji: "📊" }
      ]
    },
    {
      topic: "context",
      question: "What context is important?",
      options: [
        { text: "Business context", emoji: "💼" },
        { text: "Personal context", emoji: "👤" },
        { text: "Technical context", emoji: "⚙️" },
        { text: "Educational context", emoji: "📚" }
      ]
    },
    {
      topic: "output_format",
      question: "What output format do you need?",
      options: [
        { text: "Step-by-step guide", emoji: "📋" },
        { text: "Detailed description", emoji: "📄" },
        { text: "Bullet points", emoji: "•" },
        { text: "Structured text", emoji: "📊" }
      ]
    },
    {
      topic: "warning",
      question: "What should be considered or avoided?",
      options: [
        { text: "Time constraints", emoji: "⏰" },
        { text: "Budget limitations", emoji: "💰" },
        { text: "Technical limitations", emoji: "⚙️" },
        { text: "Legal aspects", emoji: "⚖️" }
      ]
    },
    {
      topic: "example",
      question: "What examples would be helpful?",
      options: [
        { text: "Practical examples", emoji: "💡" },
        { text: "Real case studies", emoji: "📚" },
        { text: "Step-by-step examples", emoji: "🔢" },
        { text: "Visual examples", emoji: "🎨" }
      ]
    }
  ]
}

