// AI Provider Configuration Module
// Supports switching between DeepSeek and Gemini AI providers

export interface DeepSeekConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface GeminiConfig {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

export interface AIConfig {
  provider: 'deepseek' | 'gemini';
  deepseek: DeepSeekConfig;
  gemini: GeminiConfig;
}

export interface AIProviderClient {
  makeRequest(messages: Array<{role: string, content: string}>, systemPrompt?: string): Promise<string>;
}

// Default configurations
const DEFAULT_DEEPSEEK_CONFIG: DeepSeekConfig = {
  model: 'deepseek-chat',
  temperature: 0.3,
  max_tokens: 2000,
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0
};

const DEFAULT_GEMINI_CONFIG: GeminiConfig = {
  model: 'gemini-1.5-pro',
  temperature: 0.3,
  maxOutputTokens: 2000,
  topP: 1.0,
  topK: 40
};

/**
 * Load AI configuration from environment variables
 */
export function getAIConfig(): AIConfig {
  const provider = (Deno.env.get('MAIN_SYSTEM') || 'deepseek') as 'deepseek' | 'gemini';
  
  const deepseekConfig: DeepSeekConfig = {
    model: Deno.env.get('DEEPSEEK_MODEL') || DEFAULT_DEEPSEEK_CONFIG.model,
    temperature: parseFloat(Deno.env.get('DEEPSEEK_TEMPERATURE') || DEFAULT_DEEPSEEK_CONFIG.temperature.toString()),
    max_tokens: parseInt(Deno.env.get('DEEPSEEK_MAX_TOKENS') || DEFAULT_DEEPSEEK_CONFIG.max_tokens.toString()),
    top_p: parseFloat(Deno.env.get('DEEPSEEK_TOP_P') || DEFAULT_DEEPSEEK_CONFIG.top_p!.toString()),
    frequency_penalty: parseFloat(Deno.env.get('DEEPSEEK_FREQUENCY_PENALTY') || DEFAULT_DEEPSEEK_CONFIG.frequency_penalty!.toString()),
    presence_penalty: parseFloat(Deno.env.get('DEEPSEEK_PRESENCE_PENALTY') || DEFAULT_DEEPSEEK_CONFIG.presence_penalty!.toString())
  };

  const geminiConfig: GeminiConfig = {
    model: Deno.env.get('GEMINI_MODEL') || DEFAULT_GEMINI_CONFIG.model,
    temperature: parseFloat(Deno.env.get('GEMINI_TEMPERATURE') || DEFAULT_GEMINI_CONFIG.temperature.toString()),
    maxOutputTokens: parseInt(Deno.env.get('GEMINI_MAX_TOKENS') || DEFAULT_GEMINI_CONFIG.maxOutputTokens.toString()),
    topP: parseFloat(Deno.env.get('GEMINI_TOP_P') || DEFAULT_GEMINI_CONFIG.topP!.toString()),
    topK: parseInt(Deno.env.get('GEMINI_TOP_K') || DEFAULT_GEMINI_CONFIG.topK!.toString())
  };

  const config: AIConfig = {
    provider,
    deepseek: deepseekConfig,
    gemini: geminiConfig
  };

  validateConfig(config);
  return config;
}

/**
 * Validate AI configuration - fail fast on invalid configuration
 */
export function validateConfig(config: AIConfig): void {
  // Validate provider
  if (!['deepseek', 'gemini'].includes(config.provider)) {
    throw new Error(`Invalid AI provider: ${config.provider}. Must be 'deepseek' or 'gemini'`);
  }

  // Validate API keys based on active provider
  if (config.provider === 'deepseek') {
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required when using DeepSeek provider');
    }
  } else if (config.provider === 'gemini') {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required when using Gemini provider');
    }
  }

  // Validate DeepSeek configuration
  if (config.deepseek.temperature < 0 || config.deepseek.temperature > 2) {
    throw new Error('DeepSeek temperature must be between 0 and 2');
  }
  if (config.deepseek.max_tokens < 1 || config.deepseek.max_tokens > 8192) {
    throw new Error('DeepSeek max_tokens must be between 1 and 8192');
  }

  // Validate Gemini configuration
  if (config.gemini.temperature < 0 || config.gemini.temperature > 2) {
    throw new Error('Gemini temperature must be between 0 and 2');
  }
  if (config.gemini.maxOutputTokens < 1) {
    throw new Error('Gemini maxOutputTokens must be at least 1');
  }
}

/**
 * Get configuration for the active provider
 */
export function getActiveProviderConfig(): DeepSeekConfig | GeminiConfig {
  const config = getAIConfig();
  return config.provider === 'deepseek' ? config.deepseek : config.gemini;
}

/**
 * Create AI provider client based on configuration
 */
export function createAIProviderClient(config: AIConfig): AIProviderClient {
  if (config.provider === 'deepseek') {
    return new DeepSeekClient(config.deepseek);
  } else {
    return new GeminiClient(config.gemini);
  }
}

/**
 * DeepSeek API Client (OpenAI-compatible)
 */
class DeepSeekClient implements AIProviderClient {
  private config: DeepSeekConfig;
  private apiKey: string;
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(config: DeepSeekConfig) {
    this.config = config;
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async makeRequest(messages: Array<{role: string, content: string}>, systemPrompt?: string): Promise<string> {
    const requestMessages = [];
    
    if (systemPrompt) {
      requestMessages.push({ role: 'system', content: systemPrompt });
    }
    
    requestMessages.push(...messages);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: requestMessages,
        temperature: this.config.temperature,
        max_tokens: this.config.max_tokens,
        top_p: this.config.top_p,
        frequency_penalty: this.config.frequency_penalty,
        presence_penalty: this.config.presence_penalty,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData.choices[0].message.content;
  }
}

/**
 * Gemini API Client (Google AI)
 */
class GeminiClient implements AIProviderClient {
  private config: GeminiConfig;
  private apiKey: string;

  constructor(config: GeminiConfig) {
    this.config = config;
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async makeRequest(messages: Array<{role: string, content: string}>, systemPrompt?: string): Promise<string> {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.apiKey}`;
    
    // Convert messages to Gemini format
    const contents = [];
    
    // Add system prompt as first user message if provided
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
    }
    
    // Convert messages to Gemini format
    for (const message of messages) {
      let role = message.role;
      // Gemini uses 'user' and 'model' roles, map accordingly
      if (role === 'assistant') {
        role = 'model';
      } else if (role === 'system') {
        // System messages are added as user messages in Gemini
        role = 'user';
      }
      
      contents.push({
        role,
        parts: [{ text: message.content }]
      });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxOutputTokens,
          topP: this.config.topP,
          topK: this.config.topK,
          stopSequences: this.config.stopSequences
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Extract content from Gemini response format
    if (responseData.candidates && responseData.candidates.length > 0) {
      const candidate = responseData.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      }
    }
    
    throw new Error('Invalid response format from Gemini API');
  }
}