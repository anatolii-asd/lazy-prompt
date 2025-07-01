# Gemini API Integration Setup

This guide will help you set up the Gemini API integration for WizardBoost prompt enhancement.

## Prerequisites

1. A Google account
2. A Supabase project
3. Supabase CLI installed (`npm install -g supabase`)

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (keep it secure!)

## Step 2: Set up Database Tables

Run the database migrations to create the prompt templates table:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Run the migrations
supabase db push
```

If you prefer to run them manually:

```sql
-- Run the contents of supabase/migrations/002_prompt_templates.sql
-- Run the contents of supabase/migrations/003_prompt_templates_data.sql
```

## Step 3: Deploy Supabase Edge Function

1. Login to Supabase CLI:
```bash
supabase login
```

2. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

3. Set environment variables for the Edge Function:
```bash
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key
supabase secrets set SUPABASE_URL=your_supabase_project_url  
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Deploy the Edge Function:
```bash
supabase functions deploy enhance-prompt
```

## Step 4: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Try creating a prompt with both "Super Duper Lazy" and "Just Regular Lazy" modes
3. Check the browser console for any errors
4. Verify that prompts are being enhanced with AI-generated content

## Step 5: Verify Database Setup

Check that the templates were inserted properly:

```sql
SELECT template_name, category FROM prompt_templates ORDER BY category, template_name;
```

You should see 21 templates across various categories.

## Troubleshooting

### Edge Function Issues

1. **Function not found**: Make sure you deployed it correctly
```bash
supabase functions list
```

2. **API key errors**: Verify your Gemini API key is set:
```bash
supabase secrets list
```

3. **Permission errors**: Check that your service role key has the right permissions

### Frontend Issues

1. **CORS errors**: Make sure your Supabase URL and anon key are correct in `.env.local`
2. **Type errors**: Run `npm run type-check` to verify TypeScript compilation

### Database Issues

1. **Table not found**: Run the migrations again
2. **RLS policy errors**: Check that your user is authenticated properly

## How It Works

1. **Super Lazy Mode**: 
   - User input goes directly to Gemini API
   - AI selects the best template and fills it out
   - Returns enhanced prompt with laziness/quality scores

2. **Regular Lazy Mode**:
   - User input generates 5 smart questions
   - User answers the questions
   - AI uses answers + template to create enhanced prompt

3. **Template Selection**:
   - AI analyzes user input to determine category
   - Searches database for relevant templates
   - Picks the best match using additional AI reasoning

## API Response Format

The Edge Function returns:

```json
{
  "enhanced_prompt": "The enhanced prompt text...",
  "questions": [/* Array of questions for regular lazy mode */],
  "laziness_score": 8,
  "prompt_quality": 9,
  "template_used": "Business Strategy Template"
}
```

## Next Steps

Once everything is working:

1. Deploy to production (Vercel will automatically pick up the changes)
2. Monitor Edge Function logs in Supabase dashboard
3. Consider adding usage analytics
4. Add more templates as needed

## Support

If you encounter issues:

1. Check Supabase Edge Function logs
2. Verify environment variables are set
3. Test the Gemini API key directly
4. Check browser network tab for failed requests