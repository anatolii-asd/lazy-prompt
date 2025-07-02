# AI Provider Switching System (Simplified)

This system allows you to switch between DeepSeek and Google Gemini AI providers using a single environment variable.

## Configuration

### Required Environment Variables

#### Provider Selection
- `MAIN_SYSTEM` - Set to `"deepseek"` or `"gemini"` (default: `"deepseek"`)

#### API Keys (Required)
- `DEEPSEEK_API_KEY` - Your DeepSeek API key (required when using DeepSeek)
- `GEMINI_API_KEY` - Your Google Gemini API key (required when using Gemini)

### Optional Configuration

#### DeepSeek Settings (Optional - defaults provided)
- `DEEPSEEK_MODEL` - Model name (default: `"deepseek-chat"`)
- `DEEPSEEK_TEMPERATURE` - Temperature setting (default: `"0.3"`)
- `DEEPSEEK_MAX_TOKENS` - Max tokens (default: `"2000"` for analyze, `"1500"` for improve)

#### Gemini Settings (Optional - defaults provided)
- `GEMINI_MODEL` - Model name (default: `"gemini-1.5-pro"`)
- `GEMINI_TEMPERATURE` - Temperature setting (default: `"0.3"`)
- `GEMINI_MAX_TOKENS` - Max output tokens (default: `"2000"` for analyze, `"1500"` for improve)

## Usage

### Switching Providers

1. Set the `MAIN_SYSTEM` environment variable to your desired provider
2. Ensure the corresponding API key is configured
3. Restart your Supabase Edge Functions

### Example Configuration

#### Using DeepSeek (Default)
```env
MAIN_SYSTEM=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key
```

#### Using Gemini
```env
MAIN_SYSTEM=gemini
GEMINI_API_KEY=your_google_gemini_api_key
```

## API Key Setup

### DeepSeek API Key
1. Visit [DeepSeek Platform](https://platform.deepseek.com/api_keys)
2. Create a new API key
3. Add it to your environment variables

### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey) or [AI for Developers](https://ai.google.dev/)
2. Create a new API key
3. Add it to your environment variables

## Error Handling

The system implements fail-fast error handling:

- **Missing API Key**: Returns 500 error with configuration error message
- **Invalid Provider**: Throws error during configuration loading
- **API Errors**: Handles 401 (unauthorized) and 429 (rate limit) errors
- **Invalid Parameters**: Validates temperature and token limits

## Implementation Details

### Files Modified
- `supabase/functions/_shared/ai_config.ts` - Single `ai_call()` function
- `supabase/functions/analyze/index.ts` - Analysis function
- `supabase/functions/improve/index.ts` - Improvement function
- `.env.example` - Environment variable template

### Simplified Architecture
- Single `ai_call()` function handles everything internally
- Provider switching happens automatically based on `MAIN_SYSTEM`
- No complex configuration objects or interfaces
- Minimal environment variables required

## Testing

To test the configuration:

1. Set environment variables for your chosen provider
2. Deploy the functions to Supabase
3. Test with a prompt analysis or improvement request
4. Check logs for any configuration errors

## Troubleshooting

### Common Issues

1. **Configuration Error**: Check that required API keys are set
2. **Invalid Provider**: Ensure `MAIN_SYSTEM` is set to `"deepseek"` or `"gemini"`
3. **API Errors**: Verify API keys are valid and have sufficient credits
4. **Parameter Errors**: Check that temperature values are between 0-2 and token limits are positive

### Debug Steps

1. Check Supabase Edge Functions logs
2. Verify environment variables are set correctly
3. Test with minimal configuration first
4. Ensure API keys have proper permissions